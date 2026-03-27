import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client.ts";
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  const users = await prisma.user.findMany({ where: { deletedAt: null }, select: { displayName: true } });
  console.log(JSON.stringify(users));
  await prisma.$disconnect();
}
main().catch(console.error);
