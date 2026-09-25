/**
 * Dumps the price_board database from its Docker container, gzips it to a
 * fixed path (each run overwrites the previous backup) and emails it to
 * GMAIL_BACKUP_USER using the Gmail app password in RESPALDO_FIJACIONES.
 *
 * Usage: npm run backup:db   (exits with code 1 on any failure, for cron)
 */
import path from "path";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { createWriteStream, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";
import nodemailer from "nodemailer";

// Explicit path so it works no matter which directory cron runs it from.
dotenv.config({ path: path.join(__dirname, "../.env") });

const BACKUP_FILE = "/home/priceboard/backups/price_board_backup.sql.gz";

async function dumpDatabase(): Promise<void> {
  mkdirSync(path.dirname(BACKUP_FILE), { recursive: true });

  const dump = spawn("docker", ["exec", "price_board_db", "pg_dump", "-U", "price_board_user", "price_board"]);
  let stderr = "";
  dump.stderr.on("data", (chunk) => (stderr += chunk));
  const exitCode = new Promise<number | null>((resolve, reject) => {
    dump.on("error", reject);
    dump.on("close", resolve);
  });

  await pipeline(dump.stdout, createGzip(), createWriteStream(BACKUP_FILE));

  const code = await exitCode;
  if (code !== 0) {
    throw new Error(`pg_dump termino con codigo ${code}: ${stderr.trim()}`);
  }
}

async function emailBackup(): Promise<void> {
  const user = process.env.GMAIL_BACKUP_USER;
  const pass = process.env.RESPALDO_FIJACIONES;
  if (!user || !pass) {
    throw new Error("Faltan GMAIL_BACKUP_USER o RESPALDO_FIJACIONES en el .env");
  }

  const today = new Date().toLocaleDateString("es-CO");
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });

  await transporter.sendMail({
    from: user,
    to: user,
    subject: `Respaldo Fijaciones - ${today}`,
    text: `Respaldo automatico de la base de datos de Fijaciones generado el ${today}.\n\nEl archivo adjunto contiene el volcado completo (pg_dump comprimido con gzip).`,
    attachments: [{ filename: path.basename(BACKUP_FILE), path: BACKUP_FILE }],
  });
}

async function main() {
  await dumpDatabase();
  console.log(`Respaldo guardado en ${BACKUP_FILE}`);
  await emailBackup();
  console.log("Respaldo enviado por correo.");
}

main().catch((error) => {
  console.error("[backup] Fallo el respaldo de la base de datos:", error);
  process.exit(1);
});
