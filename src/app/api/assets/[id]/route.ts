import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRole } from '@/middleware/rbac';

export const GET = withRole(['MANAGER', 'USER'], async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, clean up any self-referencing links
    await cleanupSelfReferencingLinks(id);

    // Fetch the asset with its linked assets
    const asset = await prisma.asset.findUnique({
      where: {
        id: id,
      },
      include: {
        linkedTo: {
          include: {
            toAsset: true
          }
        },
        linkedFrom: {
          include: {
            fromAsset: true
          }
        }
      }
    });

    console.log("API DEBUGGING - GET ASSET");
    console.log("Asset ID:", id);
    console.log("Asset found:", !!asset);
    if (asset) {
      console.log("LinkedTo count:", asset.linkedTo?.length || 0);
      console.log("LinkedFrom count:", asset.linkedFrom?.length || 0);

      // Check if linkedTo has the expected structure
      if (asset.linkedTo && asset.linkedTo.length > 0) {
        console.log("First linkedTo item:", JSON.stringify(asset.linkedTo[0]));
      }

      // Check if linkedFrom has the expected structure
      if (asset.linkedFrom && asset.linkedFrom.length > 0) {
        console.log("First linkedFrom item:", JSON.stringify(asset.linkedFrom[0]));
      }
    }

    console.log("API GET asset data:", asset);
    console.log("API GET linkedTo:", asset?.linkedTo);
    console.log("API GET linkedTo length:", asset?.linkedTo?.length || 0);

    // Check if there are any linked assets in the database
    const linkedAssetsCount = await prisma.linkedAsset.count({
      where: {
        fromAssetId: id
      }
    });

    console.log("Direct DB query linkedAssets count:", linkedAssetsCount);

    // Helper function to clean up self-referencing links
    async function cleanupSelfReferencingLinks(assetId: string) {
      try {
        // Find any self-referencing links
        const selfLinks = await prisma.linkedAsset.findMany({
          where: {
            AND: [
              { fromAssetId: assetId },
              { toAssetId: assetId }
            ]
          }
        });

        if (selfLinks.length > 0) {
          console.log(`Found ${selfLinks.length} self-referencing links for asset ${assetId}. Cleaning up...`);

          // Delete all self-referencing links
          await prisma.linkedAsset.deleteMany({
            where: {
              AND: [
                { fromAssetId: assetId },
                { toAssetId: assetId }
              ]
            }
          });

          console.log(`Successfully deleted ${selfLinks.length} self-referencing links.`);
        }
      } catch (error) {
        console.error("Error cleaning up self-referencing links:", error);
      }
    }

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching asset:', error.message);
    } else {
      console.error('Unknown error fetching asset:', error);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = withRole(['MANAGER'], async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has 'Asset edit' permission (user-specific or role-based)
    const { id: userId, role } = session.user;
    const { hasPermission } = await import('@/app/api/users/[id]/route');
    const permitted = await hasPermission({ id: userId, role }, 'Asset edit');
    if (!permitted) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // First get the current asset to compare changes
    const currentAsset = await prisma.asset.findUnique({
      where: { id: id }
    });

    if (!currentAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Update the asset
    const updatedAsset = await prisma.asset.update({
      where: {
        id: id,
      },
      data: {
        name: body.name,
        serialNumber: body.serialNumber,
        purchaseDate: new Date(body.purchaseDate),
        purchasePrice: parseFloat(body.purchasePrice),
        currentValue: parseFloat(body.currentValue),
        status: body.status,
        location: body.location,
        department: "Zemen Bank", // Always set to Zemen Bank regardless of form input
        category: body.category,
        type: body.type,
        supplier: body.supplier,
        description: body.description,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
        lastMaintenance: body.lastMaintenance ? new Date(body.lastMaintenance) : null,
        nextMaintenance: body.nextMaintenance ? new Date(body.nextMaintenance) : null,
        // Depreciation fields
        depreciableCost: body.depreciableCost ? parseFloat(body.depreciableCost) : null,
        salvageValue: body.salvageValue ? parseFloat(body.salvageValue) : null,
        usefulLifeMonths: body.usefulLifeMonths ? parseInt(body.usefulLifeMonths) : null,
        depreciationMethod: body.depreciationMethod || null,
        depreciationStartDate: body.depreciationStartDate ? new Date(body.depreciationStartDate) : null,
      },
    });

    // Track changes in asset history
    const changes = [];
    const fields = [
      'name', 'serialNumber', 'purchaseDate', 'purchasePrice', 'currentValue',
      'status', 'location', 'department', 'category', 'type', 'supplier', 'description',
      'warrantyExpiry', 'lastMaintenance', 'nextMaintenance', 'depreciableCost',
      'salvageValue', 'usefulLifeMonths', 'depreciationMethod', 'depreciationStartDate'
    ];

    console.log('Current asset:', currentAsset);
    console.log('Updated asset:', updatedAsset);

    for (const field of fields) {
      const oldValue = currentAsset[field];
      const newValue = updatedAsset[field];

      console.log(`Field: ${field}, Old: ${oldValue}, New: ${newValue}`);

      if (oldValue?.toString() !== newValue?.toString()) {
        changes.push({
          assetId: id,
          field,
          oldValue: oldValue?.toString() || null,
          newValue: newValue?.toString() || null,
          changedBy: session.user?.name || 'system',
        });
      }
    }

    console.log('Changes to be recorded:', changes);

    if (changes.length > 0) {
      try {
        const result = await prisma.assetHistory.createMany({
          data: changes,
        });
        console.log('History records created:', result);
      } catch (error) {
        console.error('Error creating history records:', error);
      }
    }

    return NextResponse.json(updatedAsset);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating asset:', error.message);
    } else {
      console.error('Unknown error updating asset:', error);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = withRole(['MANAGER'], async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First check if the asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: id }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // First delete all related records manually to avoid foreign key constraint issues
    console.log(`Deleting all related records for asset ${id}`);

    // Delete asset depreciations
    await prisma.assetDepreciation.deleteMany({
      where: { assetId: id }
    });

    // Delete depreciation records
    await prisma.depreciation.deleteMany({
      where: { assetId: id }
    });

    // Delete linked assets (both directions)
    await prisma.linkedAsset.deleteMany({
      where: {
        OR: [
          { fromAssetId: id },
          { toAssetId: id }
        ]
      }
    });

    // Delete history records
    await prisma.assetHistory.deleteMany({
      where: { assetId: id }
    });

    // Delete maintenance records
    await prisma.maintenance.deleteMany({
      where: { assetId: id }
    });

    // Delete transfer records
    await prisma.transfer.deleteMany({
      where: { assetId: id }
    });

    // Delete disposal records
    await prisma.disposal.deleteMany({
      where: { assetId: id }
    });

    // Delete document records
    await prisma.document.deleteMany({
      where: { assetId: id }
    });

    // Finally delete the asset itself
    await prisma.asset.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting asset:', error.message);
    } else {
      console.error('Unknown error deleting asset:', error);
    }

    // Check for specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Failed to delete asset',
          code: 'P2003',
          details: 'This asset has related records that need to be deleted first. Please contact support.',
          technicalDetails: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to delete asset',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
)