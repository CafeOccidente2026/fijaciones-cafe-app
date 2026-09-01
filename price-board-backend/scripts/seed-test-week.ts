/**
 * One-off test-data helper - NOT part of the app's business logic.
 * Creates a handful of PriceFixing rows dated last week (Mon-Fri) so the
 * ADMIN "historial de semanas" screen has a closed week to show.
 *
 * All rows hang off a single dedicated PRODUCER account, clearly marked as
 * test data (username/fullName/municipality all start with "PRUEBA"), so
 * they're easy to spot in the app and easy to wipe with cleanup-test-week.ts
 * without touching any real user or fixing.
 *
 * Usage:  npx tsx scripts/seed-test-week.ts
 */
import { prisma } from "../src/config/prismaClient";
import { PasswordUtil } from "../src/utils/password.util";
import { getWeekStart } from "../src/utils/dateRange.util";

const TEST_USERNAME = "prueba_historial_semanal";

async function main() {
  const coffeeType = await prisma.coffeeType.findFirst({ where: { active: true } });
  if (!coffeeType) {
    throw new Error("No hay ningun tipo de cafe activo. Crea uno antes de correr este script.");
  }

  const passwordHash = await PasswordUtil.hash("no-login-" + Date.now());
  const testUser = await prisma.user.upsert({
    where: { username: TEST_USERNAME },
    update: {},
    create: {
      username: TEST_USERNAME,
      passwordHash,
      fullName: "PRUEBA - Historial Semanal",
      municipality: "PRUEBA",
      role: "PRODUCER",
    },
  });

  // Last week's Monday, based on this week's Monday.
  const thisMonday = getWeekStart(new Date());
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  const rows: { userId: string; coffeeTypeId: string; kilos: number; priceAtFixing: number; createdAt: Date }[] = [];
  for (let day = 0; day < 5; day++) {
    const createdAt = new Date(lastMonday);
    createdAt.setDate(createdAt.getDate() + day);
    createdAt.setHours(9, 0, 0, 0);

    rows.push({
      userId: testUser.id,
      coffeeTypeId: coffeeType.id,
      kilos: 10 + day * 5,
      priceAtFixing: Number(coffeeType.currentPrice),
      createdAt,
    });
  }

  await prisma.priceFixing.createMany({ data: rows });

  console.log(`Usuario de prueba: ${testUser.fullName} (${testUser.id})`);
  console.log(`Tipo de cafe usado: ${coffeeType.name}`);
  console.log(`${rows.length} fijaciones creadas entre ${rows[0].createdAt.toDateString()} y ${rows[rows.length - 1].createdAt.toDateString()}`);
  console.log("Para borrarlas: npx tsx scripts/cleanup-test-week.ts");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
