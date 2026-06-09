import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating default ADMIN user directly in Neon...");

  const hashedPassword = await hash("Admin@123$", 10);

  const admin = await prisma.user.upsert({
    where: { email: "brytebee@gmail.com" },
    update: {
      role: "ADMIN",
      password: hashedPassword,
    },
    create: {
      email: "brytebee@gmail.com",
      firstName: "System",
      lastName: "Admin",
      role: "ADMIN",
      password: hashedPassword,
    },
  });

  console.log("✅ Admin user created/verified successfully:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
