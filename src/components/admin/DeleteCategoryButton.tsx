"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/app/admin/categories/actions";
import { useToast } from "@/components/providers/ToastProvider";
import AlertModal from "@/components/ui/AlertModal";

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  contentCount,
}: {
  categoryId: number;
  categoryName: string;
  contentCount: number;
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteCategory(categoryId);
      success("Category deleted!", `"${categoryName}" has been deleted successfully.`);
      setShowModal(false);
      router.refresh();
    } catch (err) {
      const errorObj = err as { message?: string };
      console.error(err);
      error("Failed to delete category", errorObj.message || "Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const canDelete = contentCount === 0;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!canDelete}
        className="text-red-400 hover:text-red-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        title={!canDelete ? "Cannot delete: contents are assigned to this category" : ""}
      >
        Delete
      </button>

      <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={
          canDelete
            ? `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
            : `Cannot delete "${categoryName}" because it has ${contentCount} content(s) assigned. Please reassign or delete the contents first.`
        }
        confirmText={canDelete ? "Delete Category" : undefined}
        cancelText={canDelete ? "Cancel" : "Close"}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
