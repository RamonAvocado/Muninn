---
name: Muninn
slogan: What was thought
surface: web
theme: system
base: Mimird-Web/DESIGN.md
colors:
  canvas: "#ffffff / #0a0a0a"
  surface: "#ffffff / #0f0f10"
  text: "#0a0a0a / #fafafa"
  text-muted: "#52525b / #a1a1aa"
  brand: "#7a0e1a / #e8a3ab"
  destructive: "#e5484d / #ef4444"
typography:
  sans: Geist
  mono: Geist Mono
radius:
  base: 10px
spacing:
  unit: 4px
---

# Muninn Design System

Muninn uses the Mimird design system. **[Mimird-Web/DESIGN.md](../Mimird-Web/DESIGN.md) is the base**: its rules for type, spacing, radius, motion, components, accessibility and code all apply here. This file has the same structure and records only what Muninn does differently or adds. If a section below says nothing about something, follow Mimird.

When this file and the code disagree, this file is right and the code has drifted. Known drift is listed in [section 14](#14-open-decisions-and-known-drift).

---

## 1. The feeling

Muninn is named after Odin's raven of memory. It is a personal notebook for todos, ideas and time: what is open, what got done, and where the hours went. Where Mimird is the inside of a watch, Muninn is **a notebook**: quiet, fast and out of the way.

- **Monochrome first, one light.** Every surface and text token is neutral. The one saturated color is crimson, used the way Mimird uses blue.
- **Flat.** App cards keep a flat ring (Mimird 6.3). Only things that float get a shadow: the sidebar, menus, dialogs and toasts.
- **Compact.** 32px controls, `text-sm` body, one centered column per page. A lot of todos fit on a screen without feeling cramped.
- **Immediate.** Checking a todo updates optimistically. Adding a todo is an always-visible inline field, not a modal. Settings save on blur or on pick, with no Save button.
- **Plain-spoken.** Empty states are one short muted sentence: "Nothing pending.", "Nothing done yet.", "No ideas yet." There are no illustrations and no onboarding copy.

Mimird's five tests (caseback, one-light, bevel, patience, proof) apply as written, with crimson in place of blue.

---

## 2. Brand

- **Muninn**, always capitalised, `translate="no"` on the wordmark.
- **Logo.** The Mimird mark (`public/brand/mimird-icon-{black,white}.svg`): black on light, white on dark. *Deviation:* Mimird says never to recolor the mark. Muninn's mark is the Mimird icon recolored crimson, which sets the product apart inside the ecosystem.
- **Voice.** The same as Mimird: direct, calm, full stops. Button labels are Title Case ("New Project", "Save Idea", "Delete Project"), with short prepositions lowercase ("Sync with GitHub"); everything else is sentence case.

---

## 3. Colour

All neutrals, `destructive`, the radius scale and the shadcn mapping come from `@mimird/ui/tokens.css`. `app/globals.css` overrides only the following.

### 3.1 Brand (the light)

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--brand` | `#7a0e1a` | `#e8a3ab` | Active sidebar icon, `.link-subtle`, selection (at 28%), the calendar's now-line, the deep-work stripe, `Switch` |
| `--ring`, `--sidebar-ring` | `#7a0e1a` | `#e8a3ab` | Focus rings |

Both values come from the mark. Muninn has no hero light, so it has no `--brand-deep`.

### 3.2 Surfaces

Muninn takes the package's neutrals unchanged. *Deviation:* it does not use Mimird-Web's cold dark overrides (`#07080a`, `#101111`, `#252829`). Those still live in Mimird-Web's own `globals.css` rather than in the package (see Mimird section 14). Light and dark are equal themes, and `system` is the default.

### 3.3 Project accents (data, not theme)

Defined in `lib/project-accents.ts`. A project stores the key (or nothing); the hex is looked up at render time and applied with inline `style`.

| Key | Hex |
| --- | --- |
| `red` | `#ef4444` |
| `orange` | `#f97316` |
| `amber` | `#f59e0b` |
| `green` | `#22c55e` |
| `teal` | `#14b8a6` |
| `blue` | `#3b82f6` |
| `violet` | `#8b5cf6` |
| `pink` | `#ec4899` |

These are the Tailwind 500 shades, the same in both themes. An accent is only ever a dot: 8px before the name on a project card, 10px before the project page title, and 24px swatches in the settings picker. The selected swatch gets a 2px halo in its own color, and "no accent" is a dashed empty circle. A project's accent also tints its calendar blocks.

### 3.4 Label colours (data, not theme)

Labels carry an optional hex stored without the `#`, user-defined or synced from GitHub. The defaults in `lib/default-labels.ts` mirror GitHub's (`bug` `d73a4a`, `documentation` `0075ca`, `enhancement` `a2eeef`, …).

A label color is a dot inside a neutral `secondary` badge (8px) or a 20px circle in the label picker. Badges are never filled with the label color, which keeps contrast independent of whatever GitHub hands back. Labels on todo rows are plain `secondary` badges with no dot.

### 3.5 Calendar

FullCalendar is mapped onto the tokens through its `--fc-*` variables in `app/globals.css`. Blocks are `muted` with a `border` edge unless a project accent colors them; notes are dashed and transparent; deep-work blocks carry a 4px `brand` stripe on the left; sleep is transparent at 60%; done entries are struck through.

---

## 4. Typography

The same as Mimird: **Geist** for everything and **Geist Mono** for literal text, loaded in `app/layout.tsx` as `--font-geist-sans` / `--font-geist-mono` (the names `tokens.css` reads). The body sets `font-feature-settings: "cv11", "ss01"`.

Muninn uses the app end of Mimird's scale only:

| Use | Classes |
| --- | --- |
| Page title (`h1`) | `text-xl font-semibold` |
| Card and dialog title | `font-heading text-base font-medium` |
| Body, rows, nav | `text-sm` (section labels in dialogs add `font-medium`) |
| Badges, issue numbers | `text-xs` |

Done items are `line-through text-muted-foreground`. Every changing number (deep-work stats, counts) is `tabular-nums`.

---

## 5. Space and shape

- Spacing and radius are Mimird's (4px unit; `rounded-sm` 6 → `rounded-2xl` 18).
- **Layout.** *Deviation:* every page is one centered `max-w-3xl` column, instead of Mimird's widening app container. A todo list reads best narrow. A page that needs the full width (the calendar) marks its root `data-wide`, and the shell drops the cap.
- Page gutter `px-4 py-6 sm:px-6 lg:px-8` (`components/app-shell.tsx`).
- Rhythm: `gap-6` between page sections, `gap-4` inside dialogs, `gap-3` for rows in a card, forms and the project list, `gap-2` within a row, and `gap-1` between nav items and badges.

---

## 6. Depth and elevation

The same three tokens as Mimird (`shadow-card`, `shadow-raised`, `shadow-floating`) and `.surface-glass`, defined in `app/globals.css`. Following Mimird 6.3, app cards stay flat (`ring-1 ring-foreground/10`), and only the sidebar, menus, dialogs and toasts float.

---

## 7. Motion

Mimird's rules, unchanged. The places motion carries information in Muninn:

| Place | Motion | What it tells |
| --- | --- | --- |
| Done list, ideas with a body | The chevron turns 90° | That the row opened |
| Sync, push to GitHub, delete | The button loads (`<Button loading>`) | That the request is running |
| Dragging a project onto a group | The group gets `ring-2 ring-primary bg-muted/50` | Where the project will land |
| Checking a todo | The tick scales in | That it is done, before the server answers |

---

## 8. Atmosphere and imagery

None. Muninn has no marketing pages, so no hero light, no stone and no imagery. The logo is the only brand mark.

---

## 9. Components

Every primitive comes from `@mimird/ui/components/*`, and the account UI comes from `@mimird/auth`. The only local primitives are `components/ui/checkbox.tsx` and `components/ui/collapsible.tsx` (shadcn `base-nova`), because the package has no equivalent yet; a new missing primitive goes into the package (`Mimird-packages/packages/ui`), not here. Feature components go flat in `components/`.

### 9.1 App shell (`components/app-shell.tsx`, `app/(app)/layout.tsx`)

- **Sidebar.** `Sidebar` from `@mimird/ui/components/sidebar` (Mimird 9.18): a floating glass panel with the logo and wordmark as `title` and the mark alone as `mark`. Entries are `SidebarItem`s: Dashboard (`LayoutDashboard`), Projects (`Boxes`), Calendar (`CalendarDays`), Ideas (`Lightbulb`), Done (`CheckCircle2`). A section stays active on its sub-pages. The collapsed state is the `muninn_sidebar` cookie, read on the server.
- **Footer.** `UserMenu` from `@mimird/auth/account/user-menu`, with Profile and Settings items.
- **Account dialog.** `SettingsDialog` from `@mimird/auth`, with `ProfileSection` and `AppearanceSection`, opened on `#settings/profile` and `#settings/appearance` (as in Mimird). The theme is picked there; there is no separate theme toggle.
- **Mobile.** Below `lg`, a header with a `Sheet` holding the same nav and the account menu.

### 9.2 Auth

`@mimird/auth` pages behind `app/(auth)/[step]/page.tsx`, with `AuthShell brand="Muninn"`. Users live in Muninn's SQLite (`kv` table in `db/schema.ts`, `kvStore` in `instrumentation.ts`). Cookies use the `muninn` prefix (`next.config.ts`), so other ecosystem apps on the same host never share Muninn's session. `proxy.ts` redirects signed-out visitors from every page and answers a signed-out call to `/api/*` (except `/api/auth/*`) with a 401; `requireUser()` in `app/(app)/layout.tsx` does the real check for pages. `bun run db:seed-user` creates a verified test account.

### 9.3 Feature components

**Todos**

| Component | What it is |
| --- | --- |
| `QuickAddTodo` | Inline input plus an "Add" button at the top of a todo card |
| `NewTodoDialog` | Outline icon button opening the full form: title, description and a scrollable label picker |
| `TodoCheckbox` | Checkbox that flips immediately and disables itself while the request runs |
| `TodoTitle` | The title is a text button that opens a dialog to edit the description |
| `DoneCollection` | Collapsible "N done" list, open by default only when there are 5 or fewer |
| `DeleteButton` | Ghost icon button with an X; deletes with no confirmation |
| `PushIssueButton` | Ghost `icon-sm` button that creates a GitHub issue from a manual todo |

**Projects**

| Component | What it is |
| --- | --- |
| `ProjectCard` | Clickable card: accent dot, name, repo badge, and a remove-from-group icon that appears on hover or focus |
| `ProjectGroupCard` | Clickable card with a muted folder icon; the drop target while a project is dragged |
| `ProjectList` | Both, reordered with native HTML drag and drop |
| `ProjectSettingsDialog` | Modal with stacked sections (Accent, Group, GitHub, Labels). "Delete Project" sits at the bottom and asks through `ConfirmDialog` |
| `NewProjectDialog` | The page's primary button, "New Project" |
| `NewProjectGroupDialog` | Outline icon button, "New Group" |

**Labels, ideas, sync, calendar**

| Component | What it is |
| --- | --- |
| `LabelManager` | Removable label badges above a name, hex and add form. Used for personal and project labels |
| `PersonalLabelsDialog` | "My Labels" outline button opening a `LabelManager` |
| `SyncButton`, `SyncLabelsButton` | Outline buttons that load while syncing with GitHub |
| `NewIdeaForm`, `IdeaItem` | Title, details and "Save Idea"; an idea is a plain line, or a collapsible when it has a body |
| `CalendarView`, `EventDialog` | FullCalendar time grid and the entry dialog (blocks, notes, repeats, deep work) |
| `DeepWorkPanel` | Deep-work fields in the entry dialog: linked todos and an interruption counter |

### 9.4 Recurring patterns

- **Page header.** `h1` left, actions right. One solid button per view; the rest are `outline` or `ghost`.
- **Section as card.** Each list on a page is a flat `Card` with a `CardTitle` ("Open", "Done", "Life todos").
- **Todo row.** `flex items-center gap-2`: checkbox, title (`flex-1`), label badges, issue link (`#12`, `text-xs`, muted), then icon actions.
- **Back link.** Muted `text-sm` link with a small left arrow above the page title on nested pages.
- **Icon-only actions.** `ghost` in rows, `outline` in headers, with an `aria-label`, inside a `Hint`. Never the native `title`.
- **Async feedback.** The button takes `loading`; the result is a sonner toast. Field errors show inline as `text-sm text-destructive`.
- **Destructive actions.** Tinted, never solid. Irreversible ones (deleting a project) ask through `ConfirmDialog`, never `confirm()`.

---

## 10. Accessibility

Mimird's rules. Add-ons for Muninn: a "Skip to content" link targets `#main` in the root layout, every icon-only control has an `aria-label`, and hover-revealed controls also show on `focus-visible`.

---

## 11. Do and don't

**Do:** start from neutral surfaces; use crimson once or twice per view; keep pages to the `max-w-3xl` column of a page header and section cards; show accent and label colors only as dots.

**Don't:** fill a badge with a label color; write raw colors in components (accent and label colors from data are the exception); add a shadow to a resting card; use the native `title` or `confirm()`.

---

## 12. Implementation

Stack: Next.js 16 (App Router), React 19, Tailwind v4, `@mimird/ui` and `@mimird/auth`, Drizzle on libSQL, FullCalendar v6.

| What | Where |
| --- | --- |
| Base tokens | `@mimird/ui/tokens.css` |
| Crimson, elevation, `.surface-glass`, `.link-subtle`, FullCalendar mapping | `app/globals.css` |
| Fonts, theme provider, toaster | `app/layout.tsx` |
| Shell, auth gate | `components/app-shell.tsx`, `app/(app)/layout.tsx`, `proxy.ts` |
| Auth store | `db/schema.ts` (`kv`), `db/index.ts`, `instrumentation.ts` |
| Test user | `scripts/seed-user.ts` |
| Project accents | `lib/project-accents.ts` |

The code rules are Mimird 12.3: no raw values in components, keep shadcn variable names, theme with variables rather than `dark:` forks, and compose rather than fork shared components.

---

## 13. Prompt guide for agents

- "One `max-w-3xl` column: an `h1` with one solid action on the right, then flat section `Card`s."
- "Primitives from `@mimird/ui/components/*`; icon buttons are `ghost` inside a `Hint`."
- "Accent and label colors are dots, applied with inline `style`."
- "Crimson only on the active nav icon, links, focus and the calendar's now-line."

---

## 14. Open decisions and known drift

- **Cold dark neutrals.** Mimird-Web's dark palette is an app-level override, not in `tokens.css`. When it moves into the package (Mimird section 14), Muninn picks it up for free.
- **Local checkbox and collapsible.** They should move into `@mimird/ui`; until then they live in `components/ui/`.
- **Email.** No `sendEmail` is configured, so sign-up and reset codes only print to the server log. Production needs one (see `home/instrumentation.ts` for a Resend example).
- **Data is not per-user.** Sign-in gates the app, but todos, projects and calendar entries have no owner column: every account sees the same data.
