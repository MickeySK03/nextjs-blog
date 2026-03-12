"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./quill-custom.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  error,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isUpdatingRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current || initializedRef.current) return;

    // Check if Quill is already initialized on this element
    if (editorRef.current.classList.contains("ql-container")) {
      return;
    }

    // Initialize Quill
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
      },
      placeholder,
    });

    quillRef.current = quill;
    initializedRef.current = true;

    // Set initial content
    if (value) {
      isUpdatingRef.current = true;
      quill.root.innerHTML = value;
      isUpdatingRef.current = false;
    }

    // Handle content changes
    const handleTextChange = () => {
      if (isUpdatingRef.current) return;
      const html = quill.root.innerHTML;
      const isEmpty = html === "<p><br></p>" || html === "";
      onChange(isEmpty ? "" : html);
    };

    quill.on("text-change", handleTextChange);

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change", handleTextChange);
      }
      initializedRef.current = false;
      quillRef.current = null;
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (!quillRef.current || isUpdatingRef.current) return;

    const currentContent = quillRef.current.root.innerHTML;
    const newValue = value || "";
    const isEmpty = newValue === "" || newValue === "<p><br></p>";
    const currentIsEmpty = currentContent === "<p><br></p>" || currentContent === "";

    // Only update if content is actually different
    if (!isEmpty && currentContent !== newValue) {
      isUpdatingRef.current = true;
      quillRef.current.root.innerHTML = newValue;
      isUpdatingRef.current = false;
    } else if (isEmpty && !currentIsEmpty) {
      isUpdatingRef.current = true;
      quillRef.current.setText("");
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div>
      <div
        ref={editorRef}
        className={`bg-slate-900 border rounded-lg text-slate-200 ${
          error ? "border-red-500" : "border-slate-700"
        }`}
        style={{ minHeight: "300px" }}
      />
      {error && (
        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
