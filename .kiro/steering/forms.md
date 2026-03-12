# Form Patterns & Best Practices

## Standard Form Setup

All forms should use react-hook-form with zod validation:

```typescript
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  field: z.string().min(1, "Field is required"),
});

type FormValues = z.infer<typeof schema>;

const { register, handleSubmit, control, watch, setValue, formState } = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { field: "" },
});
```

## Field Registration

### Text Inputs
```typescript
<input {...register("fieldName")} className="input" />
{errors.fieldName && <FieldError message={errors.fieldName.message} />}
```

### Number Inputs
```typescript
<input {...register("count", { valueAsNumber: true })} type="number" />
```

### Select with Number Value
```typescript
<select {...register("roleId", { valueAsNumber: true })}>
  <option value={1}>Option 1</option>
</select>
```

### Nullable Select
```typescript
<select {...register("categoryId", { 
  valueAsNumber: true,
  setValueAs: v => v === "" ? null : Number(v)
})}>
  <option value="">None</option>
</select>
```


### Boolean Toggle (Controller)
```typescript
<Controller
  control={control}
  name="isActive"
  render={({ field }) => (
    <button type="button" onClick={() => field.onChange(!field.value)}>
      <div className={field.value ? "bg-sky-500" : "bg-slate-700"}>
        <div className={field.value ? "translate-x-5" : "translate-x-0"} />
      </div>
    </button>
  )}
/>
```

### Date Inputs
```typescript
<input {...register("startDate")} type="datetime-local" />
```

### Custom Components (Controller)
```typescript
<Controller
  control={control}
  name="imageUrl"
  render={({ field }) => (
    <ImageUpload value={field.value} onChange={field.onChange} />
  )}
/>
```

## Zod Schema Patterns

### String Validation
```typescript
z.string().min(1, "Required").max(100, "Too long")
z.string().email("Invalid email")  // Use .email() not .email("")
z.string().url("Invalid URL").or(z.literal("")).optional().nullable()
```

### Number Validation
```typescript
z.number().min(0, "Must be 0 or more")
z.number().nullable()
```

### Date Validation with Refinement
```typescript
z.object({
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
}).refine(
  (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  { message: "End date must be after start date", path: ["endDate"] }
)
```


## Form Submission

```typescript
async function onSubmit(values: FormValues) {
  try {
    if (isEdit) {
      await editAction(values, id);
    } else {
      await createAction(values);
    }
    success("Success!", "Operation completed");
    router.push("/admin/resource");
  } catch (err) {
    const error = err as { message?: string };
    toastError("Failed", error.message);
  }
}
```

## Error Display Component

```typescript
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {message}
    </p>
  );
}
```

## Submit Button Pattern

```typescript
<button
  type="submit"
  disabled={isSubmitting}
  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
>
  {isSubmitting && <SpinnerIcon />}
  {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
</button>

{isDirty && !isSubmitting && (
  <span className="text-xs text-amber-400 ml-1">● Unsaved changes</span>
)}
```

## Common Mistakes to Avoid

- Don't use `z.string().email("")` - use `z.string().email()` instead
- Don't forget `valueAsNumber: true` for number inputs
- Don't leave unused imports (Error, console.log)
- Always use `noValidate` on form element to disable browser validation
- Use Controller for custom components, not register
- Don't mix useState with react-hook-form (use watch/setValue instead)


## Error Handling Best Practices

### Server Actions Error Handling

Always throw errors with descriptive messages:

```typescript
export async function deleteUser(id: number) {
  // Use === for comparison, not = (assignment)
  if (id === 1) {
    throw new Error("Cannot delete admin user");
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/user");
}
```

### Client-Side Error Handling

Always extract and display error messages:

```typescript
async function handleDelete() {
  try {
    await deleteAction(id);
    success("Deleted!", "Item deleted successfully");
  } catch (err) {
    const errorObj = err as { message?: string };
    console.error(err);
    error("Failed to delete", errorObj.message || "Something went wrong");
  }
}
```

### Common Validation Errors

```typescript
// Email already exists
if (existing) throw new Error("Email already exists");

// Cannot delete protected resource
if (id === 1) throw new Error("Cannot delete admin user");

// Resource has dependencies
if (userCount > 0) throw new Error("Cannot delete role with assigned users");

// Invalid input
if (!data.title) throw new Error("Title is required");
```

### Error Display Pattern

```typescript
// In forms
catch (err) {
  const error = err as { message?: string };
  toastError("Operation failed", error.message || "Please try again");
}

// In delete buttons
catch (err) {
  const errorObj = err as { message?: string };
  error("Failed to delete", errorObj.message || "Something went wrong");
}
```


## Rich Text Editor (Quill)

### Usage with Controller

```typescript
<Controller
  control={control}
  name="body"
  render={({ field }) => (
    <RichTextEditor
      value={field.value}
      onChange={field.onChange}
      placeholder="Write your content here..."
      error={errors.body?.message}
    />
  )}
/>
```

### RichTextEditor Props

```typescript
interface RichTextEditorProps {
  value: string;              // HTML content
  onChange: (value: string) => void;  // Callback when content changes
  placeholder?: string;       // Placeholder text
  error?: string;            // Error message to display
}
```

### Features

- WYSIWYG HTML editor with Quill
- Dark theme matching admin dashboard
- Toolbar: headers, bold, italic, underline, strike, lists, alignment, links, images
- Controlled component pattern (works with react-hook-form)
- Automatic sync between form state and editor content
- Error display support

### Important Notes

- Editor returns HTML string
- Empty content is stored as empty string (not `<p><br></p>`)
- Use with Controller, not register
- Content is validated by zod schema
