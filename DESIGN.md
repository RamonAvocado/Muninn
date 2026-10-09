# Muninn design

How Muninn looks and why. This describes the UI as it exists in the code today, with pointers to the source of each decision. Read it before adding or changing UI.

- [Feeling](#feeling)
- [Stack](#stack)
- [Tokens](#tokens)
- [Color palette](#color-palette)
- [Components](#components)
- [Conventions for new UI](#conventions-for-new-ui)

## Feeling

Muninn is named after Odin's raven of memory, and the mark is the lucide `Bird` icon in the sidebar. It is a personal notebook for todos and ideas, and the UI is meant to feel like one: quiet, fast, and out of the way.

**Monochrome first.** Every theme token is a pure grey (zero chroma). Color only appears when it carries meaning: a project's accent dot, a label's dot, or a destructive action. Nothing is colored for decoration.

**Flat.** Surfaces are separated by a 1px ring (`ring-1 ring-foreground/10`) or a hairline border, not by shadows. The only shadow in the app is the select popup (`shadow-md`), because it floats over content.

**Compact.** Controls are 32px tall, body text is `text-sm`, and every page is a single centered column (`max-w-3xl`). The app should show a lot of todos without feeling cramped.

**Immediate.** Transitions run 100 to 200ms. Checking a todo updates optimistically. Adding a todo is an always-visible inline field, not a modal. Settings save on blur or on pick, with no Save button.

**Plain-spoken.** Empty states are one short muted sentence: "Nothing pending.", "Nothing done yet.", "No ideas yet." No illustrations, no exclamation marks, no onboarding copy.

## Stack

| Concern | Choice | Where |
| --- | --- | --- |
| Styling | Tailwind CSS v4, CSS-first (no `tailwind.config`) | `app/globals.css` |
| Component source | shadcn, style `base-nova`, base color `neutral`, CSS variables on | `components.json` |
| Headless primitives | `@base-ui/react` (Base UI, not Radix) | `components/ui/*` |
| Variants | `class-variance-authority` | `button.tsx`, `badge.tsx` |
| Class merging | `cn` from the `cn` package | everywhere |
| Icons | `lucide-react` | everywhere |
| Animation utilities | `tw-animate-css` | `app/globals.css` |
| Theming | `next-themes`, `attribute="class"`, default `system`, `disableTransitionOnChange` | `app/layout.tsx` |
| Toasts | `sonner` | `components/ui/sonner.tsx` |

## Tokens

All tokens live in `app/globals.css`, in two layers:

1. **Raw variables** on `:root` (light) and `.dark` (dark), such as `--background` and `--radius`.
2. **Tailwind mapping** in `@theme inline`, which exposes them as utilities: `--color-background: var(--background)` gives `bg-background`, `--radius-lg: var(--radius)` gives `rounded-lg`, and so on.

Dark mode is class-based: `@custom-variant dark (&:is(.dark *))`. The base layer applies `border-border outline-ring/50` to every element and `bg-background text-foreground` to `body`, so borders and outlines pick up the theme with no extra classes.

### Color tokens

Values are OKLCH. `L` alone means `oklch(L 0 0)`, a pure grey.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `background` | 1 | 0.145 | Page background |
| `foreground` | 0.145 | 0.985 | Default text |
| `card` | 1 | 0.205 | Card surface |
| `card-foreground` | 0.145 | 0.985 | Text on cards |
| `popover` | 1 | 0.205 | Dialogs, select popup, toasts |
| `popover-foreground` | 0.145 | 0.985 | Text on popovers |
| `primary` | 0.205 | 0.922 | Default button, checked checkbox, drop-target ring |
| `primary-foreground` | 0.985 | 0.205 | Text and icons on primary |
| `secondary` | 0.97 | 0.269 | Secondary badge (labels, repo name) |
| `secondary-foreground` | 0.205 | 0.985 | Text on secondary |
| `muted` | 0.97 | 0.269 | Hover fills, card and dialog footer bars (at 50%) |
| `muted-foreground` | 0.556 | 0.708 | Secondary text, empty states, done items, placeholder |
| `accent` | 0.97 | 0.269 | Focused select item, selected row in the label picker |
| `accent-foreground` | 0.205 | 0.985 | Text on accent |
| `destructive` | `0.577 0.245 27.325` | `0.704 0.191 22.216` | Delete project button, error text, invalid fields |
| `border` | 0.922 | white at 10% | Hairlines and dividers |
| `input` | 0.922 | white at 15% | Field and checkbox borders, dark field fill (at 30%) |
| `ring` | 0.708 | 0.556 | Focus ring (at 50%) and focus border |
| `sidebar` | 0.985 | 0.205 | Sidebar surface |
| `sidebar-foreground` | 0.145 | 0.985 | Sidebar text (inactive items use it at 70%) |
| `sidebar-accent` | 0.97 | 0.269 | Active and hovered nav item, active theme button |
| `sidebar-accent-foreground` | 0.205 | 0.985 | Text on the above |
| `sidebar-border` | 0.922 | white at 10% | Sidebar right edge |
| `sidebar-primary` | 0.205 | `0.488 0.243 264.376` | Defined, unused |
| `sidebar-primary-foreground` | 0.985 | 0.985 | Defined, unused |
| `sidebar-ring` | 0.708 | 0.556 | Defined, unused |
| `chart-1` to `chart-5` | 0.87, 0.556, 0.439, 0.371, 0.269 | same | Defined, unused (no charts yet) |

Things worth knowing:

- `secondary`, `muted` and `accent` are the same grey in each theme. They are three names for one fill; pick the name by intent (static chip, quiet hover, selection).
- In dark mode, `border` and `input` are translucent white, not solid greys, so hairlines stay visible on both the page (0.145) and raised surfaces (0.205).
- Light mode has no elevation steps: page, card and popover are all white, and the ring does the separating. Dark mode raises cards, popovers and the sidebar one step (0.145 to 0.205).
- `destructive` is used as a tint, never a solid fill: `bg-destructive/10 text-destructive` (20% in dark).
- The only chromatic theme token besides `destructive` is the dark `sidebar-primary` blue, a shadcn default that nothing references.

### Radius

One base value, `--radius: 0.625rem` (10px), and a derived scale:

| Utility | Formula | Size | Used by |
| --- | --- | --- | --- |
| `rounded-sm` | `× 0.6` | 6px | Rows in the label picker |
| `rounded-md` | `× 0.8` | 8px | Sidebar nav items, theme buttons, select items, `xs`/`sm` buttons |
| `rounded-lg` | `× 1` | 10px | Buttons, inputs, textarea, select trigger and popup |
| `rounded-xl` | `× 1.4` | 14px | Cards, dialogs |
| `rounded-2xl` | `× 1.8` | 18px | Unused |
| `rounded-3xl` | `× 2.2` | 22px | Unused |
| `rounded-4xl` | `× 2.6` | 26px | Badges (reads as a pill at 20px tall) |
| `rounded-full` | | | Accent and label dots, swatches |

The checkbox is the one fixed exception at `rounded-[4px]`. Toasts take `--radius` directly.

### Typography

| Role | Font | Variable |
| --- | --- | --- |
| Body and headings | Plus Jakarta Sans | `--font-sans`, also aliased as `--font-heading` |
| Monospace | Geist Mono | `--font-geist-mono`, exposed as `font-mono` (loaded, not used yet) |

Both are loaded with `next/font/google` in `app/layout.tsx`, and `html` gets `antialiased`.

The type scale in use is small on purpose:

| Use | Classes |
| --- | --- |
| Page title (`h1`) | `text-xl font-semibold` |
| Card title, dialog title, wordmark | `font-heading text-base font-medium` (wordmark is `font-semibold`) |
| Body, rows, descriptions, nav | `text-sm` (nav and section labels add `font-medium`) |
| Badges, issue numbers | `text-xs` (badges add `font-medium`) |
| Inputs and textareas | `text-base` on mobile, `md:text-sm` (avoids iOS zoom on focus) |

Hierarchy comes from weight and from `text-muted-foreground`, not from size. Done items are `line-through text-muted-foreground`.

### Spacing and layout

Shell (`app/layout.tsx`, `components/sidebar.tsx`):

- `body` is a flex row: sidebar, then `main`.
- Sidebar: `w-60` open, `w-16` collapsed, `h-screen`, sticky, with a `h-16` header row. Width animates over 200ms.
- Main: `p-8`, scrolls on its own, content centered at `max-w-3xl`.

Rhythm inside a page:

| Gap | Where |
| --- | --- |
| `gap-6` | Between page sections (header, cards) |
| `gap-4` | Dialog content, groups inside the settings dialog |
| `gap-3` | Rows inside a todo card, forms, project list |
| `gap-2` | Elements within a row, button groups, read-only lists |
| `gap-1` | Nav items, badges in a row, chevron and label |

Card padding is a single variable, `--card-spacing`: 16px by default, 12px with `size="sm"`. It drives the card's vertical padding, its inner gap and the horizontal padding of every slot. Dialogs use `p-4`.

### Control sizes

| Size | Height | Notes |
| --- | --- | --- |
| `xs` | 24px | `text-xs`, 12px icons |
| `sm` | 28px | 0.8rem text, 14px icons |
| `default` | 32px | Buttons, inputs, select trigger |
| `lg` | 36px | |
| `icon`, `icon-xs`, `icon-sm`, `icon-lg` | square at the matching height | |

Icons default to `size-4` (16px). Chevrons and the back arrow are `size-3.5`. Checkboxes are 16px with an invisible larger hit area (`after:-inset-x-3 after:-inset-y-2`).

### States and motion

| State | Treatment |
| --- | --- |
| Hover | A `muted` fill (`hover:bg-muted`, or `/50` on cards), or an underline for text links |
| Focus | `focus-visible:border-ring` plus `ring-3 ring-ring/50` |
| Pressed | Buttons shift down 1px (`active:translate-y-px`) |
| Disabled | `opacity-50`, pointer events off |
| Invalid | `border-destructive` plus `ring-3 ring-destructive/20` (40% in dark) |
| Pending | Control disabled, its icon gets `animate-spin` |
| Drop target | `ring-2 ring-primary bg-muted/50` |

Motion is short and functional: dialogs and popups fade and zoom from 95% in 100ms, the checkbox tick scales in over 150ms, the sidebar width takes 200ms, and disclosure chevrons rotate 90 degrees. Theme switches do not animate.

## Color palette

### Neutrals

Nine grey steps cover every surface and text color:

| OKLCH L | Light theme role | Dark theme role |
| --- | --- | --- |
| 1 | Background, card, popover | Border and input (at 10% and 15% alpha) |
| 0.985 | Sidebar, text on primary | Foreground |
| 0.97 | Secondary, muted, accent | |
| 0.922 | Border, input | Primary |
| 0.708 | Ring | Muted foreground |
| 0.556 | Muted foreground | Ring |
| 0.269 | | Secondary, muted, accent |
| 0.205 | Primary | Card, popover, sidebar, text on primary |
| 0.145 | Foreground | Background |

### Destructive

| Theme | Value |
| --- | --- |
| Light | `oklch(0.577 0.245 27.325)` |
| Dark | `oklch(0.704 0.191 22.216)` |

### Project accents

Defined in `lib/project-accents.ts`. A project stores the key (or nothing); the hex is looked up at render time.

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

These are the Tailwind 500 shades. An accent is only ever shown as a dot: 8px before the name on a project card, 10px before the project page title, and 24px swatches in the settings picker. The selected swatch gets a 2px halo in its own color, and "no accent" is a dashed empty circle.

### Label colors

Labels carry an optional hex color stored without the `#`. They are user-defined or synced from GitHub. The defaults in `lib/default-labels.ts` mirror GitHub's:

| Label | Hex |
| --- | --- |
| bug | `d73a4a` |
| documentation | `0075ca` |
| duplicate | `cfd3d7` |
| enhancement | `a2eeef` |
| good first issue | `7057ff` |
| help wanted | `008672` |
| invalid | `e4e669` |
| question | `d876e3` |
| wontfix | `ffffff` |

A label color is shown as a dot inside a neutral `secondary` badge (8px) or as a 20px circle in the label picker. Badges are never filled with the label color, which keeps text contrast independent of whatever color GitHub hands back. Labels on todo rows are plain `secondary` badges with no dot.

### The rule for color

Accent and label colors are **data, not theme**. They are applied with inline `style`, they sit outside the token system, and they are identical in light and dark. Everything else uses a semantic token.

## Components

### Primitives (`components/ui/`)

Generated by shadcn (`base-nova`) on top of Base UI. Every primitive sets a `data-slot` attribute and accepts `className`.

| Component | Variants and sizes | Notes |
| --- | --- | --- |
| `Button` | Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`. Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` | `default` is the one solid, high-contrast element on a page |
| `Badge` | `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` | 20px pill. The app only uses `secondary` |
| `Card` | `size`: `default`, `sm`. Slots: `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | Ring instead of border or shadow. Footer is a `bg-muted/50` bar with a top border |
| `Checkbox` | | 16px, fills with `primary` when checked |
| `Collapsible` | `Collapsible`, `CollapsibleTrigger`, `CollapsiblePanel` | Unstyled apart from `overflow-hidden` |
| `Dialog` | `showCloseButton` on content and footer | `bg-black/10` backdrop with a slight blur, `sm:max-w-sm` popup, footer bar like the card's |
| `Input` | | 32px, transparent in light, `bg-input/30` in dark |
| `Textarea` | | Auto-grows with `field-sizing-content`, `min-h-16` |
| `Select` | Trigger `size`: `default`, `sm` | Popup matches the trigger width, check mark on the selected item |
| `Toaster` | | Sonner themed from `popover`, `border` and `radius`, with lucide status icons |

### App shell

- **`Sidebar`** (`components/sidebar.tsx`). Wordmark, four nav links (Dashboard, Projects, Ideas, Done) and the theme toggle. Active and hovered links get `bg-sidebar-accent`; inactive ones are `text-sidebar-foreground/70`. Collapsing hides labels and keeps icons with a `title` tooltip; the Bird mark becomes the expand button on hover. State persists in `localStorage` under `muninn-sidebar-collapsed`.
- **`ThemeToggle`** (`components/theme-toggle.tsx`). Three 28px icon buttons for light, dark and system. The active one takes the nav item's active style. Stacks vertically when the sidebar is collapsed.

### Feature components (`components/`)

**Todos**

| Component | What it is |
| --- | --- |
| `QuickAddTodo` | Inline input plus an "Add" button at the top of a todo card |
| `NewTodoDialog` | Outline icon button opening the full form: title, description and a scrollable label picker (rows highlight with `accent`, the color circle shows an X when selected) |
| `TodoCheckbox` | Checkbox that flips immediately and disables itself while the request runs |
| `TodoTitle` | The title is a text button (underline on hover) that opens a dialog to edit the description |
| `DoneCollection` | Collapsible "N done" list, open by default only when there are 5 or fewer |
| `DeleteButton` | Ghost icon button with an X; deletes with no confirmation |
| `PushIssueButton` | Ghost `icon-sm` button that creates a GitHub issue from a manual todo |

**Projects**

| Component | What it is |
| --- | --- |
| `ProjectCard` | Clickable card: accent dot, name, repo badge, and a remove-from-group icon that appears on hover |
| `ProjectGroupCard` | Clickable card with a muted folder icon; shows the drop-target ring while a project is dragged over it |
| `ProjectList` | Vertical list of both, reordered with native HTML drag and drop (`cursor-grab`). Dropping a project on a group moves it in |
| `ProjectSettingsDialog` | Wider dialog (`sm:max-w-md`) with stacked sections, each headed by a `text-sm font-medium` label: Accent, Group, GitHub, Labels. "Delete project" sits in the footer as the destructive button |
| `NewProjectDialog` | The page's primary button, "New project" |
| `NewProjectGroupDialog` | Outline icon button, "New group" |

**Labels**

| Component | What it is |
| --- | --- |
| `LabelManager` | Wrapping row of removable label badges above a name, hex and add form. Used for both personal and project labels |
| `ProjectLabelsSection` | `LabelManager` for a project, with the sync button when a repo is connected |
| `PersonalLabelsDialog` | "My labels" outline button opening a `LabelManager` |
| `SyncLabelsButton` | Small outline button, "Sync from GitHub" |

**Ideas and sync**

| Component | What it is |
| --- | --- |
| `NewIdeaForm` | Title input, details textarea, "Save idea" button |
| `IdeaItem` | A plain line, or a collapsible with a chevron when the idea has a body |
| `SyncButton` | Outline button with a refresh icon, "Sync with GitHub" |

### Recurring patterns

- **Page header.** `h1` on the left, actions on the right, in a `flex items-center justify-between` row. Only one action per page is a solid `default` button; the rest are `outline`.
- **Section as card.** Each list on a page is a `Card` with a `CardTitle` ("Open", "Done", "Life todos").
- **Todo row.** `flex items-center gap-2`: checkbox, title (`flex-1`), label badges, issue link (`#12`, `text-xs`, muted, underlined), then icon actions.
- **Read-only row.** `flex justify-between text-sm`: struck-through title on the left, project name (or "Life") on the right, both muted.
- **Back link.** Muted `text-sm` link with a small left arrow above the page title on nested pages.
- **Icon-only actions.** `ghost` inside rows, `outline` in headers, always with a `title`.
- **Async feedback.** The control disables and its icon spins; the result is a sonner toast (`toast.success` or `toast.error`). Errors that belong to a field are shown inline as `text-sm text-destructive`.
- **Destructive actions.** Tinted, never solid. Deleting a project asks through the native `confirm()`.

## Conventions for new UI

- Use semantic tokens (`bg-muted`, `text-muted-foreground`, `border-border`). Do not write raw colors, with one exception: accent and label colors from data, applied through inline `style`.
- Reach for an existing primitive first. Add new ones with shadcn so they land in `components/ui/` in the `base-nova` style; feature components go flat in `components/`.
- Stay on the scale: 32px controls, the radius steps above, `text-sm` body, 16px lucide icons.
- Separate surfaces with the ring or a border. Add a shadow only to something that floats.
- Keep pages to the single `max-w-3xl` column, built from the page header and section cards.
- One solid button per view.
- Write empty states as one short muted sentence.
- Check both themes; remember that light mode has no surface steps to lean on.
