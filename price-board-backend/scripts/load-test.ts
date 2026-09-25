/**
 * Load test: N simulated users log in at the same time, then each one fires
 * its typical reads in parallel, then logs out (revoking the refresh token
 * its login created). Read-only apart from those refresh-token rows - it
 * never creates fixings or touches other data.
 *
 * Needs a dedicated PRODUCER test account (my-history is PRODUCER-only).
 *
 * Usage:
 *   LOAD_TEST_USERNAME=... LOAD_TEST_PASSWORD=... npx tsx scripts/load-test.ts
 * Optional: LOAD_TEST_URL (default production), LOAD_TEST_USERS (default 50).
 */
const BASE_URL = process.env.LOAD_TEST_URL ?? "https://fijaciones.cafeoccidente.co/api";
const USERS = Number(process.env.LOAD_TEST_USERS ?? 50);
const USERNAME = process.env.LOAD_TEST_USERNAME;
const PASSWORD = process.env.LOAD_TEST_PASSWORD;
const REQUEST_TIMEOUT_MS = 30000;

interface Sample {
  label: string;
  ms: number;
  ok: boolean;
  detail: string;
}

async function timed(label: string, path: string, init: RequestInit): Promise<{ sample: Sample; body: unknown }> {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    const body: unknown = await res.json().catch(() => null);
    return { sample: { label, ms: performance.now() - start, ok: res.ok, detail: String(res.status) }, body };
  } catch (error) {
    const detail = error instanceof Error ? error.name : "error";
    return { sample: { label, ms: performance.now() - start, ok: false, detail }, body: null };
  }
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

async function simulateUser(): Promise<Sample[]> {
  const login = await timed("POST /auth/login", "/auth/login", json({ username: USERNAME, password: PASSWORD }));
  const tokens = (login.body as { data?: { accessToken: string; refreshToken: string } } | null)?.data;
  if (!login.sample.ok || !tokens) return [login.sample];

  const auth: RequestInit = { headers: { Authorization: `Bearer ${tokens.accessToken}` } };
  const reads = await Promise.all([
    timed("GET /coffee-types", "/coffee-types", auth),
    timed("GET /price-fixings/my-history", "/price-fixings/my-history", auth),
  ]);
  const logout = await timed("POST /auth/logout", "/auth/logout", {
    ...json({ refreshToken: tokens.refreshToken }),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokens.accessToken}` },
  });

  return [login.sample, ...reads.map((r) => r.sample), logout.sample];
}

function report(label: string, samples: Sample[]): void {
  const times = samples.map((s) => s.ms);
  const failed = samples.filter((s) => !s.ok);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const failures = failed.length ? `  fallos: ${failed.map((s) => s.detail).join(", ")}` : "";
  console.log(
    `${label.padEnd(30)} n=${samples.length}  min=${Math.min(...times).toFixed(0)}ms  ` +
      `prom=${avg.toFixed(0)}ms  max=${Math.max(...times).toFixed(0)}ms  fallidas=${failed.length}${failures}`
  );
}

async function main() {
  if (!USERNAME || !PASSWORD) {
    throw new Error("Faltan LOAD_TEST_USERNAME y LOAD_TEST_PASSWORD");
  }

  console.log(`Prueba de carga: ${USERS} usuarios simultaneos contra ${BASE_URL}\n`);
  const start = performance.now();
  const samples = (await Promise.all(Array.from({ length: USERS }, simulateUser))).flat();
  const totalSeconds = ((performance.now() - start) / 1000).toFixed(1);

  for (const label of [...new Set(samples.map((s) => s.label))]) {
    report(label, samples.filter((s) => s.label === label));
  }
  report("TOTAL", samples);
  console.log(`\nDuracion total: ${totalSeconds}s`);
}

main().catch((error) => {
  console.error("[load-test] Fallo la prueba:", error);
  process.exit(1);
});
