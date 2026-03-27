import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client.ts";
import { hash } from "bcryptjs";
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  
  const existing = await prisma.user.findFirst({ where: { displayName: "山田太郎", deletedAt: null } });
  if (existing) {
    console.log("User already exists:", existing.displayName);
    await prisma.$disconnect();
    return;
  }
  
  const passwordHash = await hash("password", 10);
  const user = await prisma.user.create({
    data: { displayName: "山田太郎", passwordHash, isAdmin: false },
  });
  console.log("Created user:", user.displayName);
  await prisma.$disconnect();
}
main().catch(console.error);
