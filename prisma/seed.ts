// prisma/seed.ts

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full access",
      permissions: {
        create: [
          { action: "create", subject: "user" },
          { action: "read", subject: "user" },
          { action: "update", subject: "user" },
          { action: "delete", subject: "user" },
          { action: "create", subject: "banner" },
          { action: "read", subject: "banner" },
          { action: "update", subject: "banner" },
          { action: "delete", subject: "banner" },
          { action: "create", subject: "content" },
          { action: "read", subject: "content" },
          { action: "update", subject: "content" },
          { action: "delete", subject: "content" },
        ],
      },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: "editor" },
    update: {},
    create: {
      name: "editor",
      description: "Can manage banners and content",
      permissions: {
        create: [
          { action: "create", subject: "banner" },
          { action: "read", subject: "banner" },
          { action: "update", subject: "banner" },
          { action: "create", subject: "content" },
          { action: "read", subject: "content" },
          { action: "update", subject: "content" },
        ],
      },
    },
  });

  await prisma.role.upsert({
    where: { name: "viewer" },
    update: {},
    create: {
      name: "viewer",
      description: "Read-only access",
      permissions: {
        create: [
          { action: "read", subject: "banner" },
          { action: "read", subject: "content" },
        ],
      },
    },
  });

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  // Create Editor User
  const editorPassword = await bcrypt.hash("editor123", 12);
  await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: {},
    create: {
      name: "Editor User",
      email: "editor@example.com",
      password: editorPassword,
      roleId: editorRole.id,
    },
  });

  // Create Categories
  const techCategory = await prisma.category.upsert({
    where: { slug: "technology" },
    update: {},
    create: {
      name: "Technology",
      slug: "technology",
      description: "Tech news and updates",
    },
  });

  // Create Sample Banners
  await prisma.banner.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Welcome Banner",
        description: "Welcome to our website!",
        imageUrl: "/uploads/banners/welcome.jpg",
        linkUrl: "/about",
        position: "HOME_TOP",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Promotion Banner",
        description: "Special offer this month",
        imageUrl: "/uploads/banners/promo.jpg",
        linkUrl: "/promotions",
        position: "HOME_MIDDLE",
        isActive: true,
        sortOrder: 2,
      },
    ],
  });

  // Create Sample Content
  await prisma.content.upsert({
    where: { slug: "getting-started" },
    update: {},
    create: {
      title: "Getting Started with Our Platform",
      slug: "getting-started",
      excerpt: "Learn how to use our platform effectively",
      body: "<p>Welcome to our platform! This guide will help you get started...</p><p>Our platform offers a wide range of features to help you manage your content effectively.</p>",
      status: "PUBLISHED",
      isFeatured: true,
      categoryId: techCategory.id,
      publishedAt: new Date(),
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
