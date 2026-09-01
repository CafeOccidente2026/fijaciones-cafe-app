/**
 * Deletes everything seed-test-week.ts created: the test user's
 * PriceFixing rows, then the test user itself. Only ever touches the
 * dedicated "prueba_historial_semanal" account - never real data.
 *
 * Usage:  npx tsx scripts/cleanup-test-week.ts
 */
import { prisma } from "../src/config/prismaClient";

const TEST_USERNAME = "prueba_historial_semanal";

async function main() {
  const testUser = await prisma.user.findUnique({ where: { username: TEST_USERNAME } });
  if (!testUser) {
    console.log("No hay usuario de prueba que borrar.");
    return;
  }

  const { count } = await prisma.priceFixing.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });

  console.log(`Borradas ${count} fijaciones y el usuario de prueba (${testUser.id}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
