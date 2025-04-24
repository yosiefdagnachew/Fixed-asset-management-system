import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to retry an operation
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}

// POST /api/disposals/[id]/approve
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First check if the disposal exists
    const existingDisposal = await prisma.disposal.findUnique({
      where: { id: params.id },
      include: { asset: true },
    });

    if (!existingDisposal) {
      console.error(`Disposal with ID ${params.id} not found`);
      return NextResponse.json(
        { error: 'Disposal not found' },
        { status: 404 }
      );
    }

    if (existingDisposal.status === 'APPROVED') {
      console.warn(`Disposal with ID ${params.id} is already approved`);
      return NextResponse.json(
        { error: 'Disposal is already approved' },
        { status: 400 }
      );
    }

    // Store the original disposal status for potential rollback
    const originalStatus = existingDisposal.status;

    // Update the disposal status
    const disposal = await prisma.disposal.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        // In a real app, get this from the session
        approvedBy: 'user-id',
      },
      include: {
        asset: true,
      },
    });

    console.log(`Disposal ${params.id} approved successfully`);

    try {
      // Update the asset status to DISPOSED with retry mechanism
      await retryOperation(async () => {
        return await prisma.asset.update({
          where: { id: disposal.assetId },
          data: {
            status: 'DISPOSED',
            currentValue: 0, // Asset is no longer valuable to the organization
          },
        });
      });
      
      console.log(`Asset ${disposal.assetId} marked as disposed`);
    } catch (assetError) {
      console.error(`Failed to update asset ${disposal.assetId} after retries:`, assetError);
      
      // Rollback the disposal status
      try {
        await prisma.disposal.update({
          where: { id: params.id },
          data: {
            status: originalStatus,
            approvedAt: null,
            approvedBy: null,
          },
        });
        console.log(`Rolled back disposal ${params.id} to status: ${originalStatus}`);
      } catch (rollbackError) {
        console.error(`Failed to rollback disposal ${params.id}:`, rollbackError);
      }
      
      return NextResponse.json(
        { error: 'Failed to update asset status. Disposal approval rolled back.' },
        { status: 500 }
      );
    }

    return NextResponse.json(disposal);
  } catch (error) {
    console.error('Error approving disposal:', error);
    return NextResponse.json(
      { error: 'Failed to approve disposal' },
      { status: 500 }
    );
  }
}










// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // POST /api/disposals/[id]/approve
// export async function POST(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const result = await prisma.$transaction(async (tx: PrismaClient) => {
//       const disposal = await tx.disposal.update({
//         where: { id: params.id },
//         data: {
//           status: 'APPROVED',
//           approvedAt: new Date(),
//           approvedBy: 'user-id',
//         },
//         include: {
//           asset: true,
//         },
//       });

//       await tx.asset.update({
//         where: { id: disposal.assetId },
//         data: {
//           status: 'DISPOSED',
//           currentValue: 0,
//         },
//       });

//       return disposal;
//     });

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json(
//       { error: 'Failed to approve disposal' },
//       { status: 500 }
//     );
//   }
// }
