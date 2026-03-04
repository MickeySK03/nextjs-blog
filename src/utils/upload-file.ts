"use server";
import fs from "node:fs/promises";
import path from "node:path";

export async function uploadFile(formData: FormData, folder: string) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = path.join(process.cwd(), `public/uploads/${folder}`);

  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${folder}/${fileName}`;
}
