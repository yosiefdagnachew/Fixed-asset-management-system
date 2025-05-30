import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all linked assets directly from the database
    const linkedAssets = await prisma.linkedAsset.findMany({
      include: {
        fromAsset: true,
        toAsset: true
      }
    });

    // Get all assets
    const assets = await prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        serialNumber: true
      }
    });

    // Return both for debugging
    return NextResponse.json({
      linkedAssets,
      assets,
      count: linkedAssets.length
    });
  } catch (error) {
    console.error('Error fetching linked assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
