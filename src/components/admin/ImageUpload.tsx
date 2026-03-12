// src/components/admin/ImageUpload.tsx
"use client";
import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { uploadFile } from "@/utils/upload-file";

interface ImageUploadProps {
  value?: string;          // current imageUrl
  onChange: (url: string) => void;
  folder?: string;         // subfolder in /public/uploads/
  error?: string;
}

const MAX_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ACCEPTED_EXT = ".jpg,.jpeg,.png,.webp,.gif,.svg";

export default function ImageUpload({
  value,
  onChange,
  folder = "banners",
  error,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File) => {
      setUploadError("");

      // Client-side validation
      if (!ACCEPTED.includes(file.type)) {
        setUploadError("Only JPG, PNG, WebP, GIF, SVG are supported.");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setUploadError(`File too large. Max ${MAX_MB}MB.`);
        return;
      }

      setUploading(true);
      setProgress(10);

      const fd = new FormData();
      fd.append("file", file);
      // fd.append("folder", folder);

      // Fake progress ticks while uploading
      const ticker = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85));
      }, 200);

      try {
        // const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        // const data = await res.json();

        const uploadPath = await uploadFile(fd, folder)

        clearInterval(ticker);

        setProgress(100);
        onChange(uploadPath);
        setTimeout(() => setProgress(0), 600);

        // if (!res.ok) {
        //   setUploadError(data.message ?? "Upload failed.");
        // } else {
        //   setProgress(100);
        //   onChange(data.url);
        //   setTimeout(() => setProgress(0), 600);
        // }
      } catch {
        clearInterval(ticker);
        setUploadError("Network error. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  /* ── Drag handlers ─────────────────────────── */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = ""; // reset so same file can be picked again
  };

  const hasImage = !!value;

  return (
    <div className="space-y-2">
      {/* Drop zone / Preview */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${dragging
            ? "border-sky-400 bg-sky-500/10 scale-[1.01]"
            : hasImage
              ? "border-slate-600 hover:border-slate-500"
              : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
          }
          ${error || uploadError ? "border-red-500/60" : ""}
        `}
      >
        {hasImage ? (
          /* ── Image preview ── */
          <div className="relative group">
            <div className="relative w-full h-52">
              <Image
                src={value!}
                alt="Banner preview"
                fill
                className="object-cover"
                unoptimized={value?.startsWith("/uploads")}
              />
            </div>
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Click or drop to replace
              </span>
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${dragging ? "bg-sky-500/20" : "bg-slate-800"
              }`}>
              {uploading ? (
                <svg className="w-7 h-7 text-sky-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className={`w-7 h-7 transition-colors ${dragging ? "text-sky-400" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <p className={`text-sm font-medium transition-colors ${dragging ? "text-sky-400" : "text-slate-300"}`}>
              {dragging ? "Drop image here" : uploading ? "Uploading..." : "Click or drag image here"}
            </p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP, GIF, SVG — Max {MAX_MB}MB</p>
          </div>
        )}

        {/* Progress bar */}
        {uploading && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <div
              className="h-full bg-sky-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT}
        className="hidden"
        onChange={onFileChange}
      />

      {/* Error messages */}
      {(uploadError || error) && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {uploadError || error}
        </p>
      )}

      {/* Current URL display + clear */}
      {hasImage && (
        <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
          <p className="text-xs text-slate-400 truncate flex-1 font-mono">{value}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="text-slate-500 hover:text-red-400 transition-colors shrink-0 text-xs"
            title="Remove image"
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  );
}
