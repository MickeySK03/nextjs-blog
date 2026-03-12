# Tech Stack

## Framework & Runtime
- **Next.js 16** (App Router) - React framework with server/client components
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Node.js** - Runtime environment

## Database & ORM
- **MySQL/MariaDB** - Primary database
- **Prisma 7.4** - ORM with custom adapter
- **@prisma/adapter-mariadb** - Database adapter
- Generated client location: `generated/prisma/`

## Authentication & Security
- **NextAuth.js 4.24** - Authentication with JWT strategy
- **bcryptjs** - Password hashing
- Credentials provider with email/password
- Session stored in JWT tokens

## Styling & UI
- **Tailwind CSS 4.2** - Utility-first CSS
- **PostCSS** - CSS processing
- Custom color scheme with `admin` and `primary` palettes
- Dark theme for admin dashboard

## Forms & Validation
- **react-hook-form 7.71** - Form state management
- **zod 4.3** - Schema validation
- **@hookform/resolvers** - Integration layer

## Rich Text & Media
- **Quill 2.0** / **react-quill 2.0** - WYSIWYG editor for content
- **sharp 0.34** - Image processing
- File uploads stored in `public/uploads/`

## Development Tools
- **ESLint** - Code linting
- **ts-node** - TypeScript execution for scripts
- **tsx** - Fast TypeScript runner

## Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio GUI

# Testing
# No test framework configured yet
```

## Environment Variables

Required in `.env`:
- `DATABASE_HOST` - MySQL host
- `DATABASE_USER` - MySQL username
- `DATABASE_PASSWORD` - MySQL password
- `DATABASE_NAME` - Database name
- `NEXTAUTH_SECRET` - Secret for JWT signing
- `NEXTAUTH_URL` - Application URL

## Module System
- **Type**: ES Modules (`"type": "module"` in package.json)
- **Path Alias**: `@/*` maps to `./src/*`
