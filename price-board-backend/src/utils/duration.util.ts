const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parses simple duration strings like "15m", "7d", "30s" into milliseconds.
 * Used to compute exact expiration Date objects for stored refresh tokens.
 */
export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());

  if (!match) {
    throw new Error(`Formato de duracion invalido: "${duration}". Usa algo como "15m" o "7d".`);
  }

  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}
