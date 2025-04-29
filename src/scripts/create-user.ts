const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await hash('Admin@123', 12);
  
  const user = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@fams.com',
      password: password,
      role: 'ADMIN',
    },
  });

  console.log('User created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 