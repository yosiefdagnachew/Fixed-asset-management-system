import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/disposals/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const disposal = await prisma.disposal.findUnique({
      where: { id: params.id },
      include: {
        asset: true,
      },
    });
    if (!disposal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(disposal);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch disposal' }, { status: 500 });
  }
}

// PUT /api/disposals/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { reason, method, proceeds, status } = body;
    const disposal = await prisma.disposal.update({
      where: { id: params.id },
      data: { reason, method, proceeds, status },
    });
    return NextResponse.json(disposal);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update disposal' }, { status: 500 });
  }
}

// DELETE /api/disposals/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await prisma.disposal.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete disposal' }, { status: 500 });
  }
}
