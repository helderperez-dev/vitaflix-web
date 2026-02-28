# Vitaflix Design System Guideline

This document defines the standard design patterns and component usages for the Vitaflix Web application. Following these guidelines ensures a consistent, premium, and professional user experience.

## 🎨 Core Color Palette

| Name | Role | HEX | OKLCH |
| :--- | :--- | :--- | :--- |
| **Primary** | Actions, Highlights | `#3AD49F` | `oklch(0.78 0.15 160)` |
| **Secondary** | Headings, Navigation | `#192A3F` | `oklch(0.24 0.05 240)` |
| **Background** | Page Surfaces | `#FFFFFF` | `oklch(1 0 0)` |
| **Dark BG** | Dark Mode Surfaces | `#181C26` | `oklch(0.18 0.03 240)` |

## 📐 Layout & Surfaces

### Admin Drawers (Sheets)
- **Background**: Use solid `bg-background` and `bg-muted/10` or `bg-muted/50` for secondary surfaces. Avoid "liquid glass" or transparency/blur effects in light mode to maintain a minimalist aesthetic and high readability.
- **Borders**: Standard `border-border`. Use `border-b` for headers and `border-t` for footers.
- **Width**: Typically `sm:max-w-xl` (or `sm:max-w-2xl` for complex forms) for detailed forms.
- **Structure**: Clear `SheetHeader` (with wide padding `px-8 py-8`), scrollable `flex-1` body, and a fixed `SheetFooter` with `border-t`.

## ⌨️ Form Elements

### Inputs & Selects
- **Consistency**: ALWAYS use `@/components/ui` components without ad-hoc background or border overrides. Layout-specific tweaks should be handled via global CSS or the component's internal theme.
- **Styling**: 
  - Standard border: `border-input`.
  - Focus state: `border-primary` with a subtle `ring-primary/10` and `ring-4` for a premium feel.
  - Background: Subtle `bg-muted/5` for a slight distinction from the main surface.
- **Height**: Standard height is `h-10`.
- **Groups**: Use logical grouping with uppercase bold text headers (e.g., `text-[10px] font-bold uppercase tracking-widest`). Avoid icons in form labels and section headers.

## 📐 Layout & Spacing
- **Internal Padding**: Use `px-8 py-8` for the main drawer container.
- **Section Spacing**: Separate logical groups with `space-y-12`.
- **Grid Gaps**: When using side-by-side inputs (e.g., `md:grid-cols-2`), use a minimum horizontal gap of `gap-x-12` and vertical gap of `gap-y-8`.
- **Label Spacing**: Use standard `FormItem` spacing. Labels should be `uppercase tracking-widest text-[10px] font-bold text-muted-foreground`.

## 💎 Iconography
- **Library**: Lucide React.
- **Minimalism**: Avoid decorative icons in headers (no sparkles, plus signs, etc.) or section labels unless they serve a critical functional purpose.
- **Size**: Standard `h-4 w-4` for functional icons like `Loader2`.

## ✨ Buttons & Actions
- **Drawer Actions**: Use a two-button pattern in the footer: a `variant="outline"` **Cancel** button and a primary **Save** button.
- **Grid Layout**: Buttons should be right-aligned with standard spacing (`gap-3`).
- **Typography**: Button text should be `font-bold text-xs uppercase tracking-widest`.
- **Feedback**: Always provide loading states using `Loader2` within the Save button.
- **Actions Menu (3 Dots)**: 
  - **No Header**: Do not use `DropdownMenuLabel` or `DropdownMenuSeparator` headers (avoid "Actions").
  - **Monochromatic**: Use standard `text-foreground` or `text-muted-foreground` for all items and icons. Avoid mixing colors like green/red/blue within a single menu.
  - **Alignment**: Standardize right-aligned `DropdownMenu` for table actions.
  - **Icon Size**: Standard `h-4 w-4` for all menu icons.
  - **Text**: Use clear, concise labels (e.g., "Edit Details", "Delete").

## 🌍 Multilingual Management
- **Dynamic Configuration**: Supported languages must be fetched from the `system_settings` table (`supported_languages` key), using ISO standard hyphenated format (e.g., `pt-pt`, `pt-br`, `en`).
- **Interface**: ALWAYS use the `TranslationFields` component for multilingual data. This component uses a **dynamic list-based interface** where users add only the translations they need.
- **Styling**: 
  - **Selective Entry**: Only show inputs for languages explicitly added by the user.
  - **"Add Language" Dropdown**: Use a searchable popover (`Command`) for adding new languages.
  - **Management**: Include a subtle hover-to-reveal "Remove" (`X`) button on the right side of each input/textarea.
- **Context-Aware Tables**: Data grids should only show content in the user's active locale (with an English fallback) to maintain a clean interface.

## 🌑 Dark Mode
- Surfaces should shift to the deeper `oklch(0.18 0.03 240)` palette.
- Borders use lower opacity white (`oklch(1 0 0 / 10%)`).
- Input backgrounds should be slightly darker than the surface (`oklch(1 0 0 / 15%)`).
