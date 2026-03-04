// src/app/admin/banners/new/page.tsx
import BannerForm from "@/components/admin/form/BannerForm";

export default function NewBannerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        New Banner
      </h1>
      <BannerForm />
    </div>
  );
}
