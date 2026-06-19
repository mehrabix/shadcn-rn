# shadcn-rn Implementation Plan

## Architecture Overview

shadcn-rn is a React Native adaptation of shadcn/ui. It provides a CLI tool and component registry for adding copy-paste UI components to React Native/Expo projects, styled with NativeWind (Tailwind CSS for RN).

---

## Directory Structure

```
lib/shadcn-rn/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                          # CLI entry point
│   ├── commands/
│   │   ├── init.ts                       # Initialize project
│   │   ├── add.ts                        # Add components
│   │   └── build.ts                      # Build registry JSON
│   ├── registry/
│   │   ├── schema.ts                     # Zod schemas
│   │   ├── loader.ts                     # Load registry files
│   │   ├── parser.ts                     # Parse @namespace/item
│   │   ├── resolver.ts                   # Resolve dependency tree
│   │   ├── builder.ts                    # Build URLs/headers
│   │   ├── fetcher.ts                    # HTTP fetching
│   │   ├── api.ts                        # High-level API
│   │   ├── config.ts                     # Config defaults
│   │   ├── constants.ts                  # Registry URL, defaults
│   │   ├── errors.ts                     # Error classes
│   │   ├── context.ts                    # Global headers state
│   │   ├── address.ts                    # Item address resolution
│   │   ├── validate.ts                   # Registry validation
│   │   ├── validator.ts                  # Env var validation
│   │   └── index.ts                      # Re-exports
│   ├── utils/
│   │   ├── get-config.ts                 # Load components.json
│   │   ├── add-components.ts             # Orchestrator
│   │   ├── get-project-info.ts           # Detect Expo/RN framework
│   │   ├── get-package-manager.ts        # Detect npm/yarn/pnpm
│   │   ├── resolve-import.ts             # Resolve path aliases
│   │   ├── logger.ts                     # Colored output
│   │   ├── spinner.ts                    # Loading spinner
│   │   ├── errors.ts                     # Error handler
│   │   ├── handle-error.ts               # Global error handler
│   │   ├── is-safe-target.ts             # Path traversal check
│   │   └── transformers/
│   │       ├── index.ts                  # Transformer pipeline
│   │       ├── transform-import.ts       # Rewrite imports
│   │       └── transform-cleanup.ts      # Remove unused imports
│   ├── styles/
│   │   └── tailwind.css                  # Base Tailwind CSS
│   ├── colors/
│   │   ├── neutral.ts                    # Color palette
│   │   ├── zinc.ts
│   │   └── index.ts
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       ├── avatar.tsx
│   │       ├── alert.tsx
│   │       ├── separator.tsx
│   │       ├── switch.tsx
│   │       ├── checkbox.tsx
│   │       ├── label.tsx
│   │       ├── textarea.tsx
│   │       ├── select.tsx
│   │       ├── sheet.tsx
│   │       ├── dialog.tsx
│   │       ├── toast.tsx
│   │       ├── tabs.tsx
│   │       ├── toggle.tsx
│   │       ├── toggle-group.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── context-menu.tsx
│   │       ├── tooltip.tsx
│   │       ├── collapsible.tsx
│   │       ├── accordion.tsx
│   │       ├── progress.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── scroll-area.tsx
│   │       ├── separator.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── resizable.tsx
│   │       ├── popover.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── use-color-scheme.ts
│   │   ├── use-theme.ts
│   │   ├── use-controllable-state.ts
│   │   └── index.ts
│   └── lib/
│       ├── utils.ts                      # cn() utility
│       └── constants.ts                  # App constants
├── test/
│   ├── registry/
│   │   ├── schema.test.ts
│   │   ├── loader.test.ts
│   │   ├── parser.test.ts
│   │   ├── resolver.test.ts
│   │   ├── builder.test.ts
│   │   ├── fetcher.test.ts
│   │   ├── api.test.ts
│   │   ├── config.test.ts
│   │   ├── validate.test.ts
│   │   ├── validator.test.ts
│   │   ├── address.test.ts
│   │   └── utils.test.ts
│   ├── commands/
│   │   ├── init.test.ts
│   │   ├── add.test.ts
│   │   └── build.test.ts
│   ├── utils/
│   │   ├── get-config.test.ts
│   │   ├── add-components.test.ts
│   │   ├── get-project-info.test.ts
│   │   ├── resolve-import.test.ts
│   │   └── transformers/
│   │       ├── transform-import.test.ts
│   │       └── transform-cleanup.test.ts
│   └── components/
│       ├── button.test.tsx
│       ├── card.test.tsx
│       ├── input.test.tsx
│       └── badge.test.tsx
└── fixtures/
    ├── registry.json
    ├── components.json
    └── sample-project/
```

---

## Phase 1: Core Registry System

### 1.1 Schema (`registry/schema.ts`)

Mirror shadcn/ui's Zod schemas adapted for React Native:

```typescript
// Key types:
- rawConfigSchema: { style, nativewind, tsx, aliases, registries }
- configSchema: rawConfigSchema + resolvedPaths
- registryItemTypeSchema: registry:ui, registry:hook, registry:lib, etc.
- registryItemSchema: discriminated union on type
- registryItemCommonSchema: name, files, dependencies, registryDependencies
- registrySchema: full registry with name, homepage, items
```

### 1.2 Parser (`registry/parser.ts`)

```typescript
// Input: "@shadcn-rn/button"
// Output: { registry: "@shadcn-rn", item: "button" }
```

### 1.3 Builder (`registry/builder.ts`)

```typescript
// Build URL + headers from registry config
// Support env var expansion: ${TOKEN}
// Support {name} placeholder replacement
```

### 1.4 Fetcher (`registry/fetcher.ts`)

```typescript
// Fetch registry items from:
// - HTTP URLs
// - Local JSON files
// - GitHub repos
// Support caching, error handling, auth headers
```

### 1.5 Resolver (`registry/resolver.ts`)

```typescript
// Resolve full dependency tree:
// 1. Fetch requested items
// 2. Resolve registryDependencies recursively
// 3. Topological sort (Kahn's algorithm)
// 4. Merge: dependencies, files, tailwind config, cssVars
// 5. Deduplicate files by target path
```

### 1.6 Loader (`registry/loader.ts`)

```typescript
// Load registry from filesystem
// Support include directives
// Validate no cycles, depth limits
```

### 1.7 Constants (`registry/constants.ts`)

```typescript
REGISTRY_URL = "https://raw.githubusercontent.com/mehrabix/shadcn-rn/main/registry"
BUILTIN_REGISTRIES = {
  "@shadcn-rn": "{REGISTRY_URL}/{name}.json"
}
```

---

## Phase 2: CLI Commands

### 2.1 `init` Command

```
npx shadcn-rn@latest init
```

Flow:
1. Detect project (Expo, bare RN)
2. Prompt for style (default, new-york)
3. Create `components.json`
4. Install NativeWind if missing
5. Add base components (button)

### 2.2 `add` Command

```
npx shadcn-rn@latest add button card input
```

Flow:
1. Load `components.json`
2. Parse component names
3. Fetch registry items + resolve deps
4. Transform imports for project aliases
5. Write files to components/ui/
6. Install dependencies

### 2.3 `build` Command

```
npx shadcn-rn@latest build
```

Flow:
1. Read local `registry.json`
2. Resolve all items with file content
3. Output individual JSON files

---

## Phase 3: UI Components

All components use NativeWind classes and React Native primitives.

### Core Components

| Component | File | Description |
|-----------|------|-------------|
| Button | button.tsx | Pressable with variants |
| Card | card.tsx | Card, CardHeader, CardContent, CardFooter |
| Input | input.tsx | TextInput wrapper |
| Badge | badge.tsx | Status badge |
| Avatar | avatar.tsx | Image with fallback |
| Alert | alert.tsx | Alert banner |
| Separator | separator.tsx | Divider |
| Label | label.tsx | Form label |
| Switch | switch.tsx | Toggle switch |
| Checkbox | checkbox.tsx | Checkbox with label |

### Form Components

| Component | File | Description |
|-----------|------|-------------|
| Textarea | textarea.tsx | Multi-line input |
| Select | select.tsx | Dropdown select |
| Radio Group | radio-group.tsx | Radio buttons |

### Overlay Components

| Component | File | Description |
|-----------|------|-------------|
| Dialog | dialog.tsx | Modal dialog |
| Sheet | sheet.tsx | Bottom sheet |
| Popover | popover.tsx | Floating popover |
| Dropdown Menu | dropdown-menu.tsx | Action menu |
| Context Menu | context-menu.tsx | Long-press menu |
| Tooltip | tooltip.tsx | Hover tooltip |

### Layout Components

| Component | File | Description |
|-----------|------|-------------|
| Tabs | tabs.tsx | Tab navigation |
| Accordion | accordion.tsx | Collapsible sections |
| Collapsible | collapsible.tsx | Show/hide content |
| Scroll Area | scroll-area.tsx | Styled ScrollView |
| Resizable | resizable.tsx | Resizable panels |

### Data Display

| Component | File | Description |
|-----------|------|-------------|
| Table | table.tsx | Data table |
| Progress | progress.tsx | Progress bar |
| Skeleton | skeleton.tsx | Loading placeholder |

### Feedback Components

| Component | File | Description |
|-----------|------|-------------|
| Toast | toast.tsx | Notification toast |
| Toggle | toggle.tsx | Toggle button |
| Toggle Group | toggle-group.tsx | Group of toggles |

---

## Phase 4: Theme System

### Colors

```typescript
// src/colors/neutral.ts
export const neutral = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#e5e5e5",
  // ... full palette
}
```

### CSS Variables (NativeWind)

```css
/* tailwind.css */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

---

## Phase 5: Tests

### Test Framework

- Vitest with react-native preset
- @testing-library/react-native for component tests
- MSW for HTTP mocking (registry fetching)

### Test Categories

1. **Registry Tests** (12 files)
   - Schema validation
   - Parser tests
   - Builder tests
   - Fetcher tests
   - Resolver tests (dependency ordering, dedup)
   - Loader tests (includes, cycles)

2. **Command Tests** (3 files)
   - Init command
   - Add command
   - Build command

3. **Utility Tests** (5 files)
   - Config loading
   - Project detection
   - Import resolution
   - Transformers

4. **Component Tests** (4 files)
   - Button renders correctly
   - Card structure
   - Input handling
   - Badge variants

---

## Implementation Order

1. ✅ Basic package structure
2. Registry schema + parser + builder
3. Fetcher + resolver
4. Loader + API
5. CLI entry point + init command
6. Add command
7. Core UI components (Button, Card, Input, Badge)
8. Theme system + colors
9. Overlay components (Dialog, Sheet, Dropdown)
10. Form components (Textarea, Select, Checkbox)
11. Layout components (Tabs, Accordion)
12. Data display (Table, Progress, Skeleton)
13. Toast + feedback components
14. Tests for all modules
15. Build command
16. Documentation
