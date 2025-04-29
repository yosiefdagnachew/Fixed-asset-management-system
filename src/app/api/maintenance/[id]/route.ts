import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/maintenance/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const maintenanceRequest = await prisma.maintenance.findUnique({
      where: { id: params.id },
      include: {
        asset: {
          select: {
            name: true,
            serialNumber: true,
          },
        },
        requestedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: 'Maintenance request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(maintenanceRequest);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance request' },
      { status: 500 }
    );
  }
}

// PUT /api/maintenance/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    const maintenanceRequest = await prisma.maintenance.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'COMPLETED' ? { endDate: new Date() } : {}),
        ...(status === 'IN_PROGRESS' ? { startDate: new Date() } : {}),
      },
      include: {
        asset: {
          select: {
            name: true,
            serialNumber: true,
          },
        },
        requestedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // If the maintenance is completed, update the asset's lastMaintenance and nextMaintenance dates
    if (status === 'COMPLETED') {
      const nextMaintenanceDate = new Date();
      nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 3); // Schedule next maintenance in 3 months

      await prisma.asset.update({
        where: { id: maintenanceRequest.assetId },
        data: {
          lastMaintenance: new Date(),
          nextMaintenance: nextMaintenanceDate,
        },
      });
    }

    return NextResponse.json(maintenanceRequest);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance request' },
      { status: 500 }
    );
  }
}
