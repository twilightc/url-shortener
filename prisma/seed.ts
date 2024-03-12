import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const alice = await prisma.user.upsert({
    where: { userId: 1234 },
    update: {},
    create: {
      userId: 9527,
      email: 'alice@prisma.io',
      name: 'Alice',
      enrollTime: new Date(),
    },
  });
  const bob = await prisma.user.upsert({
    where: { userId: 2356 },
    update: {},
    create: {
      userId: 555,
      email: 'bob@prisma.io',
      name: 'Bob',
      enrollTime: new Date(),
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
