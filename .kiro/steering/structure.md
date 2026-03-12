# Project Structure & Conventions

## Directory Layout

```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/        # Public pages (route group, no URL prefix)
│   ├── admin/             # Protected admin dashboard
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Core utilities
└── utils/                 # Helper functions

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Initial data seeding

generated/prisma/          # Auto-generated Prisma client
public/uploads/            # User-uploaded files
```

## Route Organization

### Frontend Routes (Public)
- `app/(frontend)/page.tsx` - Homepage
- `app/(frontend)/blog/page.tsx` - Blog listing
- `app/(frontend)/blog/[slug]/page.tsx` - Individual blog post
- Route group `(frontend)` doesn't affect URLs

### Admin Routes (Protected)
- `app/admin/layout.tsx` - Shared admin layout with sidebar/header
- `app/admin/dashboard/page.tsx` - Dashboard
- `app/admin/{resource}/page.tsx` - List view
- `app/admin/{resource}/new/page.tsx` - Create form
- `app/admin/{resource}/[id]/edit/page.tsx` - Edit form
- Resources: `banners`, `contents`, `roles`, `user`

### API Routes
- `app/api/admin/*` - Protected endpoints (require auth)
- `app/api/public/*` - Public endpoints (no auth)
- `app/api/auth/[...nextauth]/` - NextAuth handlers

## Component Organization

```
components/
├── admin/                      # Admin-specific components
│   ├── AdminHeader.tsx        # Top navigation
│   ├── AdminSidebar.tsx       # Side navigation
│   ├── form/                  # Form components
│   │   ├── BannerForm.tsx
│   │   ├── ContentForm.tsx
│   │   ├── RoleForm.tsx
│   │   └── UserForm.tsx
│   ├── Delete*Button.tsx      # Delete action buttons
│   └── ImageUpload.tsx        # File upload component
├── providers/                  # Context providers
│   ├── SessionProvider.tsx
│   └── ToastProvider.tsx
└── BannerCarousel.tsx         # Frontend components
```

## Code Patterns

### Server Actions
- Located in `app/admin/{resource}/actions.ts`
- Use `"use server"` directive
- Handle create, update, delete operations
- Call `revalidatePath()` after mutations
- Import types from `generated/prisma/models`

Example:
```typescript
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createResource(data) {
  const result = await prisma.resource.create({ data });
  revalidatePath("/admin/resources");
  return result;
}
```

### API Routes
- Use Next.js route handlers (GET, POST, PUT, DELETE)
- Admin routes check authentication
- Return JSON responses
- Handle errors with try/catch

### Forms
- Use `react-hook-form` with `zod` validation
- Client components (`"use client"`)
- Consistent structure across all forms
- Call server actions on submit

### Authentication
- NextAuth configured in `lib/auth.ts`
- JWT strategy with credentials provider
- Session includes user role and permissions
- Protected routes check session in layout/middleware

### Database Access
- Import from `@/lib/prisma`
- Use Prisma client methods
- Include relations with `include` option
- Generated types from `generated/prisma/`

### Styling
- Tailwind utility classes
- Custom admin color palette (`admin-bg`, `admin-sidebar`, etc.)
- Responsive design with Tailwind breakpoints
- Dark theme for admin, light for frontend

## File Naming
- **Pages**: `page.tsx`
- **Layouts**: `layout.tsx`
- **Server Actions**: `actions.ts`
- **API Routes**: `route.ts`
- **Components**: PascalCase (e.g., `BannerForm.tsx`)
- **Utilities**: kebab-case (e.g., `upload-file.ts`)

## Import Conventions
- Use `@/*` path alias for `src/*`
- Import Prisma client from `@/lib/prisma`
- Import types from `generated/prisma/models` or `generated/prisma/enums`
- Group imports: external → internal → relative

## Key Principles
1. **Server-first**: Use server components by default, client only when needed
2. **Colocation**: Keep related files together (actions near pages)
3. **Type Safety**: Leverage TypeScript and Prisma types
4. **Separation**: Clear boundaries between admin/frontend/api
5. **Reusability**: Shared components and utilities
