import { PrismaClient } from '@prisma/client';
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('👤 Creating admin user...');
    
    // Hash the password
    const hashedPassword = await hash('admin123', 12);
    
    // Create or update the admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('✅ Admin user created/updated:', {
      email: admin.email,
      role: admin.role,
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 