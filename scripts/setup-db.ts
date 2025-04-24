import { PrismaClient } from '@prisma/client';
const { hash } = require('bcryptjs');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Setting up database...');

    // Run migrations
    console.log('📦 Running migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

    // Create admin user
    console.log('👤 Creating admin user...');
    const password = await hash('admin123', 12);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password,
        role: 'ADMIN',
      },
    });

    console.log('✅ Database setup completed!');
    console.log('Admin user created:', { email: admin.email, role: admin.role });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 