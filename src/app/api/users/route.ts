import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(users);
}

import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { name, email, role, password } = await request.json();
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, role, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { id, name, role } = await request.json();
    if (!id || !name || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { name, role },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}


// You can add POST, PUT, DELETE for user management (create, update, delete users) as needed.
