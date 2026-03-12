import CategoryForm from "@/components/admin/form/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Category</h1>
        <p className="text-sm text-slate-400 mt-1">
          Add a new content category
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
