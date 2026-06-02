# Item Types

Stash organizes all user-saved content around the `Item` model, where each item is tagged with exactly one `ItemType`. Seven system item types ship out of the box (created in `prisma/seed.ts` with `isSystem: true` and `userId: null`). Per-user custom item types are supported by the schema but not yet exposed.

## Sources

- `prisma/schema.prisma` — `Item`, `ItemType`, and `ContentType` enum
- `prisma/seed.ts` — system item type creation + demo data per type
- `src/lib/constants/item-types.ts` — UI mapping (icon, color, label)
- `context/project-overview.md` — product-level type table + routes

---

## The 7 System Types

### Snippet

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Name           | `snippet`                          |
| Label          | Snippet                            |
| Icon (Lucide)  | `Code`                             |
| Color (hex)    | `#3b82f6` (blue)                   |
| Content kind   | Text                               |
| `ContentType`  | `TEXT`                             |
| Route          | `/items/snippets`                  |
| Pro-only       | No                                 |

**Purpose:** Reusable code blocks — hooks, helpers, boilerplates.

**Key fields used:**
- `title`, `content` (the code body), `language` (for syntax highlighting), `description`
- `isFavorite`, `isPinned`
- `tags`, `collections`

---

### Prompt

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Name           | `prompt`                           |
| Label          | Prompt                             |
| Icon (Lucide)  | `Sparkles`                         |
| Color (hex)    | `#8b5cf6` (purple)                 |
| Content kind   | Text                               |
| `ContentType`  | `TEXT`                             |
| Route          | `/items/prompts`                   |
| Pro-only       | No                                 |

**Purpose:** Reusable LLM prompts — code review, doc generation, refactor templates.

**Key fields used:**
- `title`, `content` (the prompt body), `description`
- `isFavorite`, `isPinned`
- `tags`, `collections`
- `language` typically unset (prompts are natural language)

---

### Command

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Name           | `command`                          |
| Label          | Command                            |
| Icon (Lucide)  | `Terminal`                         |
| Color (hex)    | `#f97316` (orange)                 |
| Content kind   | Text                               |
| `ContentType`  | `TEXT`                             |
| Route          | `/items/commands`                  |
| Pro-only       | No                                 |

**Purpose:** Shell / CLI commands worth saving — git, docker, kubectl, etc.

**Key fields used:**
- `title`, `content` (the command line), `description`
- `isFavorite`, `isPinned`
- `tags`, `collections`
- `language` typically unset; commands are usually a single shell line

---

### Note

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Name           | `note`                             |
| Label          | Note                               |
| Icon (Lucide)  | `StickyNote`                       |
| Color (hex)    | `#fde047` (yellow)                 |
| Content kind   | Text (Markdown)                    |
| `ContentType`  | `TEXT`                             |
| Route          | `/items/notes`                     |
| Pro-only       | No                                 |

**Purpose:** Free-form notes, explanations, learning logs. Project overview specifies a Markdown editor for text types.

**Key fields used:**
- `title`, `content` (Markdown body), `description`
- `isFavorite`, `isPinned`
- `tags`, `collections`

---

### File

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Name           | `file`                             |
| Label          | File                               |
| Icon (Lucide)  | `File`                             |
| Color (hex)    | `#6b7280` (gray)                   |
| Content kind   | File (binary, stored in R2)        |
| `ContentType`  | `FILE`                             |
| Route          | `/items/files`                     |
| Pro-only       | **Yes**                            |

**Purpose:** Arbitrary uploaded files — context files, configs, attachments.

**Key fields used:**
- `title`, `description`
- `fileUrl` (Cloudflare R2 URL), `fileName` (original), `fileSize` (bytes)
- `isFavorite`, `isPinned`
- `tags`, `collections`
- `content` unused; `language` unused

---

### Image

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Name           | `image`                            |
| Label          | Image                              |
| Icon (Lucide)  | `Image`                            |
| Color (hex)    | `#ec4899` (pink)                   |
| Content kind   | File (image binary, stored in R2)  |
| `ContentType`  | `FILE`                             |
| Route          | `/items/images`                    |
| Pro-only       | **Yes**                            |

**Purpose:** Screenshots, mockups, reference images.

**Key fields used:**
- `title`, `description`
- `fileUrl`, `fileName`, `fileSize`
- `isFavorite`, `isPinned`
- `tags`, `collections`
- `content` unused; `language` unused

> Image is structurally identical to File at the data layer — both use `ContentType.FILE` and the same file fields. The difference is purely presentational (icon, color, preview behavior).

---

### Link

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Name           | `link`                             |
| Label          | Link                               |
| Icon (Lucide)  | `Link`                             |
| Color (hex)    | `#10b981` (emerald)                |
| Content kind   | URL                                |
| `ContentType`  | `URL`                              |
| Route          | `/items/links`                     |
| Pro-only       | No                                 |

**Purpose:** Bookmarked external resources — docs sites, registries, references.

**Key fields used:**
- `title`, `url` (the link target), `description`
- `isFavorite`, `isPinned`
- `tags`, `collections`
- `content` unused; `language` unused; file fields unused

---

## Summary Tables

### By content classification

| `ContentType` | Types                                     | Primary content field |
| ------------- | ----------------------------------------- | --------------------- |
| `TEXT`        | snippet, prompt, command, note            | `content`             |
| `FILE`        | file, image                               | `fileUrl` (+ `fileName`, `fileSize`) |
| `URL`         | link                                      | `url`                 |

### Field usage by type

| Field          | snippet | prompt | command | note | file | image | link |
| -------------- | :-----: | :----: | :-----: | :--: | :--: | :---: | :--: |
| `title`        | ✅      | ✅     | ✅      | ✅   | ✅   | ✅    | ✅   |
| `description`  | ✅      | ✅     | ✅      | ✅   | ✅   | ✅    | ✅   |
| `content`      | ✅      | ✅     | ✅      | ✅   | —    | —     | —    |
| `language`     | ✅      | (rare) | (rare)  | —    | —    | —     | —    |
| `url`          | —       | —      | —       | —    | —    | —     | ✅   |
| `fileUrl`      | —       | —      | —       | —    | ✅   | ✅    | —    |
| `fileName`     | —       | —      | —       | —    | ✅   | ✅    | —    |
| `fileSize`     | —       | —      | —       | —    | ✅   | ✅    | —    |
| `isFavorite`   | ✅      | ✅     | ✅      | ✅   | ✅   | ✅    | ✅   |
| `isPinned`     | ✅      | ✅     | ✅      | ✅   | ✅   | ✅    | ✅   |
| `tags`         | ✅      | ✅     | ✅      | ✅   | ✅   | ✅    | ✅   |
| `collections`  | ✅      | ✅     | ✅      | ✅   | ✅   | ✅    | ✅   |

### Pro gating

| Free tier              | Pro tier (additional)   |
| ---------------------- | ----------------------- |
| snippet, prompt, command, note, link | file, image |

## Shared Properties

Every item, regardless of type, carries:

- **Identity:** `id`, `userId`, `itemTypeId`, `createdAt`, `updatedAt`
- **Display:** `title`, `description`
- **Flags:** `isFavorite`, `isPinned`
- **Organization:** `tags` (many-to-many `Tag`), `collections` (many-to-many via `ItemCollection`)

The UI mapping in `src/lib/constants/item-types.ts` is keyed by `ItemType.name` and provides three maps used across the dashboard, sidebar, and item lists:

- `ITEM_TYPE_ICONS` → Lucide component
- `ITEM_TYPE_COLORS` → hex color string
- `ITEM_TYPE_LABELS` → display label

All three are typed as `Partial<Record<string, ...>>` so unknown/custom type names won't be falsely guaranteed to resolve.

## Display Differences

The differences between types are concentrated in three places:

1. **Which content fields are populated** — see field-usage table above. `ContentType` (`TEXT` | `FILE` | `URL`) is the schema-level switch that determines which fields are meaningful.
2. **Visual identity** — every type has its own icon and color via `ITEM_TYPE_ICONS` / `ITEM_TYPE_COLORS`. Pinned cards on the dashboard hide content previews; other cards may show a content/URL/file preview based on `ContentType`.
3. **Editor & viewer** — text types render a Markdown / code editor over `content` (with `language` driving syntax highlighting for snippets). File/image types render an upload + preview over `fileUrl`. Link types render a URL input + outbound link.

Routing follows a single pluralized pattern: `/items/{name}s` for each type. Collections may also declare a `defaultTypeId` so newly created items in that collection default to a particular type (e.g., the "Terminal Commands" collection defaults to `command`).