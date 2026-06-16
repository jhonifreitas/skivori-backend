import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import 'dotenv-expand/config';
import { Prisma, PrismaClient } from 'src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

class Seeds {
  async init() {
    console.log('🚀 Starting seeding...');

    await this.user();

    console.log('✅ Seeding completed!');
  }

  private async user() {
    console.log('🔑 User processing...');

    const email = 'user.1@test.com';

    const exist = await prisma.user.findFirst({
      where: { email },
    });
    if (exist) {
      console.log('❗️ User already exists, skipping...');
      return;
    }

    const password = await hash('123456', 10);

    const data: Prisma.UserCreateInput = {
      name: 'User Test 1',
      email,
      password,
    };

    await prisma.user.create({ data });

    console.log('🎉 User seeding completed!');
  }
}

new Seeds()
  .init()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
