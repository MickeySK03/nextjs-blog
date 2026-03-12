# File Upload Configuration

## Upload Limits

- **Maximum file size**: 10MB
- **Allowed formats**: JPG, JPEG, PNG, WebP, GIF, SVG
- **Upload timeout**: 30 seconds
- **Storage location**: `public/uploads/{folder}/`

## Next.js Configuration

Body size limit is configured in `next.config.mjs`:

```javascript
experimental: {
  serverActions: {
    bodySizeLimit: "10mb",
  },
}
```

## Upload Methods

### 1. Server Action (Recommended)

Used by ImageUpload component:

```typescript
import { uploadFile } from "@/utils/upload-file";

const formData = new FormData();
formData.append("file", file);
const url = await uploadFile(formData, "banners");
```

### 2. API Route (Alternative)

Available at `/api/admin/upload`:

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("folder", "banners");

const res = await fetch("/api/admin/upload", {
  method: "POST",
  body: formData,
});
const data = await res.json();
```

## ImageUpload Component

### Usage

```typescript
<Controller
  control={control}
  name="coverImage"
  render={({ field }) => (
    <ImageUpload
      value={field.value || ""}
      onChange={field.onChange}
      folder="content"
      error={errors.coverImage?.message}
    />
  )}
/>
```

### Props

```typescript
interface ImageUploadProps {
  value?: string;          // Current image URL
  onChange: (url: string) => void;  // Callback when upload completes
  folder?: string;         // Subfolder in /public/uploads/ (default: "banners")
  error?: string;          // Error message to display
}
```

### Features

- Drag and drop support
- Image preview
- Upload progress indicator
- Client-side validation (file type and size)
- Remove image functionality
- Error display

## Upload Folders

- `banners/` - Banner images
- `content/` - Content cover images
- `avatars/` - User avatars
- `general/` - Other uploads

## Validation

### Client-Side

```typescript
// File type
if (!ACCEPTED.includes(file.type)) {
  setUploadError("Only JPG, PNG, WebP, GIF, SVG are supported.");
  return;
}

// File size
if (file.size > MAX_MB * 1024 * 1024) {
  setUploadError(`File too large. Max ${MAX_MB}MB.`);
  return;
}
```

### Server-Side

```typescript
// In API route or server action
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error("File type not allowed");
}

if (file.size > MAX_SIZE) {
  throw new Error("File too large. Maximum size is 10MB");
}
```

## File Naming

Uploaded files are renamed to prevent conflicts:

```typescript
const fileName = `${Date.now()}-${file.name}`;
// Example: 1234567890-banner.jpg
```

## Important Notes

- Always validate file type and size on both client and server
- Use appropriate folder names for organization
- Images are stored in `public/uploads/` and served statically
- Use `unoptimized` prop for Next.js Image component with local uploads
- Server actions have 10MB body size limit (configurable)
- API routes have 30 second timeout for large uploads
