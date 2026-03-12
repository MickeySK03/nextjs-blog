"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/app/admin/user/actions";
import { useToast } from "@/components/providers/ToastProvider";
import AlertModal from "@/components/ui/AlertModal";

export default function DeleteUserButton({
  userId,
  userName,
}: {
  userId: number;
  userName: string;
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteUser(userId);
      success("User deleted!", `"${userName}" has been deleted successfully.`);
      setShowModal(false);
      router.push("/admin/user");
    } catch (err) {
      const errorObj = err as { message?: string };
      console.error(err);
      error(
        "Failed to delete user",
        errorObj.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-400 hover:text-red-300 text-sm"
      >
        Delete
      </button>

      <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete "${userName}" ?`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
