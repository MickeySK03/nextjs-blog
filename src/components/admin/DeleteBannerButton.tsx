"use client";
import { useState } from "react";
import { deleteBanner } from "@/app/admin/banners/actions";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/ui/AlertModal";

export default function DeleteBannerButton({ bannerId, bannerTitle }: { bannerId: number; bannerTitle: string }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteBanner(bannerId);
      success("Banner deleted!", `"${bannerTitle}" has been deleted successfully.`);
      setShowModal(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toastError("Failed to delete banner", "Something went wrong. Please try again.");
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
        title="Delete Banner"
        description={`Are you sure you want to delete "${bannerTitle}"? This action cannot be undone.`}
        confirmText="Delete Banner"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
