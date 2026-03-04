// src/app/(frontend)/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BannerCarousel from "@/components/BannerCarousel";

async function getData() {
  const now = new Date();
  const [bannersTop, bannersMiddle, featuredContents, latestContents] = await Promise.all([
    prisma.banner.findMany({
      where: {
        isActive: true,
        position: "HOME_TOP",
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.banner.findMany({
      where: { isActive: true, position: "HOME_MIDDLE" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.content.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.content.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
  ]);
  return { bannersTop, bannersMiddle, featuredContents, latestContents };
}

export default async function HomePage() {
  const { bannersTop, bannersMiddle, featuredContents, latestContents } = await getData();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" style={{ fontFamily: "var(--font-body)" }}>
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-heading)" }}>
            CMS Site
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-slate-400 hover:text-white transition-colors text-sm">Blog</Link>
            <Link href="/admin/dashboard" className="text-sky-400 hover:text-sky-300 transition-colors text-sm">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner Carousel */}
      <BannerCarousel banners={bannersTop} />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Featured */}
        {featuredContents.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Featured
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredContents.map((content) => (
                <Link key={content.id} href={`/blog/${content.slug}`}>
                  <article className="card hover:border-slate-600 transition-colors cursor-pointer h-full">
                    {content.category && (
                      <span className="badge bg-sky-500/10 text-sky-400 mb-3 inline-block">
                        {content.category.name}
                      </span>
                    )}
                    <h3 className="text-white font-semibold mb-2 line-clamp-2">{content.title}</h3>
                    {content.excerpt && (
                      <p className="text-slate-400 text-sm line-clamp-3">{content.excerpt}</p>
                    )}
                    <p className="text-slate-500 text-xs mt-4">
                      {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString("th-TH") : ""}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Middle Banner */}
        {bannersMiddle.length > 0 && (
          <section className="mb-16">
            {bannersMiddle.map((banner) => (
              <div key={banner.id} className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {banner.title}
                </h3>
                {banner.description && <p className="text-slate-300">{banner.description}</p>}
                {banner.linkUrl && (
                  <Link href={banner.linkUrl} className="mt-4 inline-block btn-primary">
                    Learn More
                  </Link>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Latest */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Latest Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestContents.map((content) => (
              <Link key={content.id} href={`/blog/${content.slug}`}>
                <article className="card hover:border-slate-600 transition-colors cursor-pointer">
                  {content.category && (
                    <span className="badge bg-slate-700 text-slate-300 mb-3 inline-block">
                      {content.category.name}
                    </span>
                  )}
                  <h3 className="text-white font-medium mb-2 line-clamp-2 text-sm">{content.title}</h3>
                  <p className="text-slate-500 text-xs">
                    {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString("th-TH") : ""}
                    {" · "}{content.viewCount} views
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
