"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/ui/AlertModal";

interface DeleteRoleButtonProps {
  id: number;
  name: string;
  userCount: number;
}

export default function DeleteRoleButton({ id, name, userCount }: DeleteRoleButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Failed to delete");
    } else {
      setShowModal(false);
      router.refresh();
    }
  }

  const canDelete = userCount === 0;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!canDelete}
        className="text-xs py-1.5 px-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={!canDelete ? "Cannot delete: users are assigned to this role" : ""}
      >
        Delete
      </button>

      <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        description={
          error
            ? error
            : `Are you sure you want to delete the role "${name}"? This action cannot be undone.`
        }
        confirmText="Delete Role"
        cancelText="Cancel"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}
