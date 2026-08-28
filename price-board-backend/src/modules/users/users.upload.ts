import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { AppError } from "../../utils/apiResponse.util";

/** <projectRoot>/uploads/profile-photos - resolves the same from src (tsx) and dist. */
export const PROFILE_PHOTO_DIR = path.join(__dirname, "../../../uploads/profile-photos");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(PROFILE_PHOTO_DIR, { recursive: true });
    callback(null, PROFILE_PHOTO_DIR);
  },
  filename: (req, file, callback) => {
    const extension = EXTENSION_BY_MIME[file.mimetype] ?? ".jpg";
    callback(null, `${req.auth!.userId}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (EXTENSION_BY_MIME[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new AppError("Formato no soportado. Usa JPG, PNG o WEBP.", 422));
    }
  },
});

/**
 * Single responsibility: run multer for a single "photo" field and turn
 * its errors into AppError so the shared errorHandler answers them
 * consistently. Must run after `authenticate` (uses req.auth).
 */
export function uploadProfilePhoto(req: Request, res: Response, next: NextFunction): void {
  upload.single("photo")(req, res, (error: unknown) => {
    if (error instanceof MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new AppError("La imagen supera el limite de 5 MB.", 422));
        return;
      }
      next(new AppError("No se pudo procesar la imagen.", 422));
      return;
    }
    if (error) {
      next(error);
      return;
    }
    if (!req.file) {
      next(new AppError("No se envio ninguna imagen.", 422));
      return;
    }
    next();
  });
}
