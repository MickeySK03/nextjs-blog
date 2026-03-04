"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteContent } from "@/app/admin/contents/actions";
import { useToast } from "@/components/providers/ToastProvider";
import AlertModal from "@/components/ui/AlertModal";

export default function DeleteContentButton({ contentId, contentTitle }: { contentId: number; contentTitle: string }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteContent(contentId);
      success("Content deleted!", `"${contentTitle}" has been deleted successfully.`);
      setShowModal(false);
      router.push("/admin/contents");
    } catch (err) {
      console.error(err);
      error("Failed to delete content", "Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="text-red-400 hover:text-red-300 text-sm">
        Delete
      </button>

      <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Delete Content"
        description={`Are you sure you want to delete "${contentTitle}"? This action cannot be undone.`}
        confirmText="Delete Content"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
