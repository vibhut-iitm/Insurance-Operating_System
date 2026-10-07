import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const { BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_PASSWORD } = process.env;
  if (!BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_NAME || !BOOTSTRAP_ADMIN_PASSWORD) {
    throw new Error('Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, and BOOTSTRAP_ADMIN_PASSWORD to create an administrator.');
  }
  if (BOOTSTRAP_ADMIN_PASSWORD.length < 12) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: BOOTSTRAP_ADMIN_EMAIL.toLowerCase() },
    update: {},
    create: {
      name: BOOTSTRAP_ADMIN_NAME,
      email: BOOTSTRAP_ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
