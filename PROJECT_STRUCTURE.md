# Project Structure

This Next.js project follows best practices for organization and scalability.

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (frontend)/              # Public-facing pages (route group)
│   │   ├── page.tsx            # Homepage
│   │   └── blog/               # Blog pages
│   │       ├── page.tsx        # Blog listing
│   │       └── [slug]/         # Individual blog post
│   │           └── page.tsx
│   │
│   ├── admin/                   # Admin dashboard
│   │   ├── layout.tsx          # Admin layout wrapper
│   │   ├── dashboard/          # Dashboard page
│   │   ├── banners/            # Banner management
│   │   │   ├── page.tsx        # List banners
│   │   │   ├── actions.ts      # Server actions
│   │   │   ├── new/            # Create banner
│   │   │   └── [id]/edit/      # Edit banner
│   │   ├── contents/           # Content management
│   │   ├── roles/              # Role management
│   │   ├── user/               # User management
│   │   └── login/              # Login page
│   │
│   ├── api/                     # API routes
│   │   ├── admin/              # Admin API endpoints
│   │   │   ├── banners/
│   │   │   ├── contents/
│   │   │   ├── roles/
│   │   │   ├── users/
│   │   │   └── upload/
│   │   ├── auth/               # Authentication
│   │   └── public/             # Public API endpoints
│   │
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root page (redirects to frontend)
│   └── globals.css             # Global styles
│
├── components/                  # Reusable components
│   ├── admin/                  # Admin-specific components
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── BannerForm.tsx      # Form components
│   │   ├── ContentForm.tsx
│   │   ├── RoleForm.tsx
│   │   ├── UserForm.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── DeleteBannerButton.tsx
│   │   ├── DeleteContentButton.tsx
│   │   ├── DeleteRoleButton.tsx
│   │   └── DeleteUserButton.tsx
│   │
│   ├── providers/              # Context providers
│   │   ├── SessionProvider.tsx
│   │   └── ToastProvider.tsx
│   │
│   └── BannerCarousel.tsx      # Frontend components
│
├── lib/                         # Core utilities and configurations
│   ├── auth.ts                 # NextAuth configuration
│   └── prisma.ts               # Prisma client instance
│
└── utils/                       # Helper functions
    └── upload-file.ts          # File upload utilities

prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Database seeding

public/
└── uploads/                    # User-uploaded files
    └── banners/

generated/
└── prisma/                     # Generated Prisma client
```

## Key Conventions

### 1. Route Organization
- **(frontend)**: Route group for public pages (doesn't affect URL)
- **admin**: Admin dashboard with shared layout
- **api**: API routes following REST conventions

### 2. Component Organization
- **components/admin**: Admin-specific UI components
- **components/providers**: React context providers
- **components/**: Shared frontend components

### 3. Server Actions
- Located alongside their related pages (e.g., `app/admin/banners/actions.ts`)
- Handle create, update, delete operations
- Use `revalidatePath` for cache invalidation

### 4. API Routes
- **admin**: Protected endpoints requiring authentication
- **public**: Public-facing endpoints for frontend
- Follow RESTful conventions (GET, POST, PUT, DELETE)

### 5. Forms
- All form components in `components/admin/`
- Use react-hook-form + zod for validation
- Follow consistent patterns across all forms

### 6. Database
- Prisma ORM with MySQL
- Schema in `prisma/schema.prisma`
- Generated client in `generated/prisma/`

## Best Practices Applied

1. **Colocation**: Server actions near their pages
2. **Separation of Concerns**: Clear boundaries between admin/frontend/api
3. **Type Safety**: TypeScript + Zod validation
4. **Reusability**: Shared components and utilities
5. **Security**: Protected routes with NextAuth
6. **Performance**: Server components by default, client components only when needed
