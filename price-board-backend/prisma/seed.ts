import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Creates the first ADMIN account so someone can log in and start
 * creating the rest of the users from the app itself.
 * Safe to run multiple times: it skips creation if the admin already exists.
 */
async function main(): Promise<void> {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const plainPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const fullName = process.env.SEED_ADMIN_FULLNAME ?? "Administrador Principal";
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  const existingAdmin = await prisma.user.findUnique({ where: { username } });

  if (existingAdmin) {
    console.log(`El usuario admin "${username}" ya existe. No se crea de nuevo.`);
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

  await prisma.user.create({
    data: {
      username,
      passwordHash,
      fullName,
      role: Role.ADMIN,
    },
  });

  console.log("Administrador creado correctamente:");
  console.log(`  usuario:   ${username}`);
  console.log(`  password:  ${plainPassword} (cambiala despues de tu primer login)`);
}

main()
  .catch((error) => {
    console.error("Error ejecutando el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
