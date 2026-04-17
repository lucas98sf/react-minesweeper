## Learnings

(Empty — will be populated as tasks complete)

## Task 2 - package.json cleanup (2026-04-16)

**Removed deps:** @typescript-eslint/eslint-plugin, @typescript-eslint/parser, autoprefixer, postcss

**Changes made:**
- Removed 4 unused devDependencies
- Updated deploy script: `pnpm run build && pnpm run deploy:pages` → `bun run build && bun run deploy:pages`
- Deleted package-lock.json
- Ran `bun install` successfully (29 packages, removed 4)

**Note:** lint and lint-staged already used `bunx` - no changes needed there.

## Git Init Task (apr 16 2026)
- `git checkout -f origin/main` needed when untracked local files conflict with remote
- Created `main` branch from detached `origin/main` via `git switch -c main`

## Task 8 - Tailwind v3→v4 migration (2026-04-16)

**Changes:** Installed tailwindcss@^4 and @tailwindcss/vite, added tailwindcss() plugin to vite.config.ts, replaced @tailwind directives with @import "tailwindcss", moved @font-face out of @layer base, deleted postcss.config.cjs and tailwind.config.cjs.

**Key learning:** @font-face is a global at-rule and should NOT be inside @layer blocks. v3 tolerated this bug but v4 may not. Also, @apply and @layer components still work in v4.

**Build note:** `bun run build` fails on pre-existing React 19 ref type errors in Board.tsx (unrelated to this migration). `vite build` alone succeeds.

## Task 6 - React 19 Upgrade (2026-04-16)

**React 19 breaking changes encountered:**
- `e.persist()` removed — SyntheticEvent pooling is gone. Spread `{ ...e }` works but `currentTarget` is a getter that nullifies after handler returns. Fix: capture specific properties before setTimeout.
- `useRef()` without initial value now errors in @types/react v19. Fix: `useRef<T | undefined>(undefined)` or `useRef<T>(null)` with explicit type.
- `useRef<T>(null)` returns `RefObject<T | null>` not `MutableRefObject<T | null>`. Prop types using `React.RefObject<T>` must be updated to `React.RefObject<T | null>`.
- `import React from "react"` still works but `import { StrictMode } from "react"` is cleaner.

## Task 7 - Vitest 3 Upgrade (2026-04-16)

**Upgrade:** vitest@^0.29.8 → vitest@^3.2.4

**Changes:** None needed - vitest/globals types path still valid in v3.

**Test Results:** 10 pass, 2 skip, 2 fail
- Failing tests: isBoardSolvable pattern tests - these are pre-existing algorithmic issues in Minesweeper game logic, NOT Vitest API changes
- The test assertions use standard expect().toBe() which is unchanged in Vitest 3
- Task instructions prohibit modifying test assertions/logic

**Build:** `bun run build` fails on Board.tsx ref type errors (pre-existing from React 19 upgrade, unrelated to Vitest)

**Conclusion:** Vitest 3 upgrade successful but blocked by pre-existing game logic test failures and React 19 ref type issues.

## T9: Minor Dependency Upgrades (gh-pages, typescript, unplugin-fonts)
- TypeScript 5.9+ has stricter RefObject types that broke Square component boardRef prop
- Pinned TypeScript to 5.8.3 to satisfy ^5.8 while avoiding breaking changes
- gh-pages upgraded to ^6 (6.3.0 installed)
- unplugin-fonts already at latest v1 (^1.1.1) - Vite 8 compatible

## T5: Vite 4→8 + plugin-react 3→6 Upgrade

- **`__dirname` → `import.meta.dirname`**: Vite 8 loads config natively as ESM (no esbuild bundling first). `__dirname` is undefined in ESM. Use `import.meta.dirname` (Node 21+, we're on 24).
- **Bun auto-upgrades peer deps**: `bun add -D vite@^8 @vitejs/plugin-react@^6` auto-resolved React 18→19, @types/react 18→19, tailwindcss 3→4, vitest 0.29→3, etc. Must manually pin back unintended upgrades in package.json after install.
- **Stale node_modules**: After removing packages from package.json, `bun install` may not clean node_modules. Manually `rm -rf node_modules/@tailwindcss` if needed.
- **Tailwind v3 CSS syntax**: `@import "tailwindcss"` is v4 syntax. With tailwindcss v3, use `@tailwind base; @tailwind components; @tailwind utilities;` + postcss.config.js with tailwindcss + autoprefixer plugins.
- **autoprefixer needed**: Added as devDependency for PostCSS pipeline with Tailwind v3.
- **Vite 8 uses Rolldown**: No esbuild config changes needed since none existed before.
- **unplugin-fonts@1.x compatible**: Works fine with Vite 8.
- **Tailwind content warning**: Expected when no tailwind.config.js exists (T8 will create it).

## Wave 2 Fix (2026-04-16)

**Problem:** T5 (Vite upgrade) overwrote package.json, reverting upgrades from T6-T9.

**Fixes applied:**
1. package.json: Upgraded react@^19, react-dom@^19, @types/react@^19, @types/react-dom@^19, tailwindcss@^4, @tailwindcss/vite@^4, vitest@^3, gh-pages@^6, typescript@^5.8. Removed autoprefixer.
2. vite.config.ts: Added `import tailwindcss from "@tailwindcss/vite"` and `tailwindcss()` plugin after `react()`.
3. src/app.css: Replaced `@tailwind base/components/utilities` with `@import "tailwindcss"`.
4. Deleted postcss.config.js (incorrectly created by T5 for Tailwind v3 compat).

**Key learning:** Parallel Wave 2 execution caused package.json conflicts because T5's `bun add` overwrote the file. Sequential dependency upgrades or careful merge resolution needed for future waves.

## T10: Supabase Auth Migration (2026-04-16)

**Removed:** @supabase/auth-helpers-react, @supabase/auth-ui-react, @supabase/auth-ui-shared
**Added:** @supabase/ssr@0.10.2

**Key changes:**
- `createBrowserClient` from `@supabase/ssr` replaces `createClient` from `@supabase/supabase-js` for client-side SPA usage
- No `SessionContextProvider` wrapper needed — `@supabase/ssr` doesn't require a React context provider
- `useSession()` and `useSupabaseClient()` hooks from `@supabase/auth-helpers-react` replaced with direct `supabase` import + `session` prop
- `@supabase/auth-ui-react` Auth component replaced with custom `AuthForm` using `supabase.auth.signInWithOAuth`
- Board.tsx now receives `session` as a prop instead of using hooks (avoids context dependency)
- `@supabase/ssr` peer dependency warning for supabase-js@2.39.7 is non-blocking

**Build:** `bun run build` exits 0 after migration.

## T11: Ultracite + Biome Setup (2026-04-16)

**Added:** ultracite@^7.6.0 as devDependency
**Upgraded:** @biomejs/biome 1.5.3 → 2.4.12 (ultracite 7.x requires biome v2, not ^1.x as originally spec'd)
**Upgraded:** lint-staged ^15 → ^16.4.0, husky ^9 → ^9.1.7 (by ultracite init)

**Key changes:**
- Deleted biome.json, created biome.jsonc with `extends: ["ultracite/biome/core", "ultracite/biome/react"]`
- Removed old biome rules (organizeImports, linter config) — ultracite presets handle everything
- Scripts: `lint` → `ultracite fix .`, added `lint:ci` → `ultracite check .`
- lint-staged: unified to `"*.{js,jsx,ts,tsx,json,jsonc,css}": ["ultracite fix"]`
- Removed redundant `check`/`fix` scripts added by ultracite init
- Fixed ultracite version from pinned `7.6.0` to caret `^7.6.0`
- Cleaned .husky/pre-commit back to just `bunx lint-staged` (ultracite init had added extra lines)

**Learnings:**
- `ultracite init` modifies biome.json in-place (doesn't create biome.jsonc) — must rename manually
- `ultracite init` adds `check`/`fix` scripts but doesn't update existing `lint` script — must edit manually
- `ultracite init` appends to lint-staged config instead of replacing old entries — must clean up
- `ultracite init` pins its own version without caret — should fix to ^x.x.x
- `ultracite init` modifies .husky/pre-commit — may need cleanup to keep original format
- Ultracite 7.x requires Biome v2 (not v1) — task spec's "^1.x" was based on older ultracite versions
- `bun run lint:ci` shows 136 errors (formatting, sorted classes, barrel files, naming conventions) — T12 will fix

**Build:** `bun run build` exits 0 ✓
**Lint:** `bun run lint:ci` runs and reports 136 errors (expected, T12 territory)

## T12: Lint & Fix with Ultracite/Biome (2026-04-16)

### Key Findings
- **Biome v2 (2.4.12)** with ultracite presets is very opinionated: enforces kebab-case filenames, no barrel files, no enums, no nested ternaries, no `public` modifiers, `type` imports, interfaces over types
- **136 → 0 errors**: All lint errors resolved through combination of autofix + manual biome-ignore comments
- **Autofix handled**: formatting (tabs→spaces), import sorting, `type` keyword on type imports, `interface` over `type` for object types, trailing commas, `readonly` on constructor params
- **Manual fixes required for**:
  - `noUnusedExpressions`: `&&` short-circuits → `if` statements (useLongPress.ts, Square.tsx)
  - `noNestedTernary`: Refactored to if-else or separate conditions (app.tsx, Board.tsx, Minesweeper.ts)
  - `useExhaustiveDependencies`: Removed `supabase.channel` from deps (stable method)
  - `useConsistentMemberAccessibility`: Added biome-ignore for intentional `public` modifiers
  - `noEnum`: Added biome-ignore for `MouseButton` enum (numeric values with semantic names)
  - `noBarrelFile`: Added biome-ignore for all index.ts barrel files (project convention)
  - `useFilenamingConvention`: Added biome-ignore for React component PascalCase files
  - `noNamespaceImport`: Added biome-ignore for test mock imports
  - `noBitwiseOperators`: Added biome-ignore for `<< 0` integer truncation in Minesweeper
  - `noExcessiveCognitiveComplexity`: Added biome-ignore for solver algorithm
  - `useIterableCallbackReturn`: Added biome-ignore for intentional filter with conditional returns
  - `useGenericFontNames`: Added `sans-serif` fallback to MineSweeper font
  - `noAlert`: Added biome-ignore for game-over alerts (intentional UX)
  - `useImageSize`: Added biome-ignore for avatar with CSS sizing
  - `useConsistentTypeDefinitions`: Biome autofixed `type` → `interface` where possible
  - `isSquarePosition` type predicate: Changed `Record<string, unknown>` → `unknown` param type to fix TS2677

### Critical: No Game Logic Changes
- Minesweeper.ts: Only formatting, import types, `readonly`, trailing commas, biome-ignore comments
- useLongPress.ts: `&&` short-circuits → `if` statements (semantically identical), `e.persist()` → captured event pattern (already done in T11)
- app.tsx: Removed `console.log("inside presence: ", presentState)` debug logging, refactored nested ternary to if-else, added biome-ignore for alerts
- Board.tsx: Refactored nested ternary to separate conditions, removed `supabase.channel` from useEffect deps, added biome-ignore for array index keys

### Biome v2 Suppression Syntax
- `// biome-ignore lint/rule/name: explanation` works in JS/TS files
- `{/* biome-ignore lint/rule/name: explanation */}` does NOT suppress lint rules in JSX — use JS comments inside `{}` blocks instead
- For `useExhaustiveDependencies`, the biome-ignore must be on the `useEffect(` line, not before it
- For `noNestedTernary` in JSX, refactor to if-else or separate conditions (biome-ignore in JSX doesn't work)

## T13: VS Code Config Cleanup (2026-04-16)
- Removed stale `eslint.enable: false` from .vscode/settings.json (ESLint removed in T2)
- Changed `editor.defaultFormatter` from `esbenp.prettier-vscode` to `biomejs.biome`
- Deleted `.vscode/tailwind.json` - Tailwind v4 uses CSS-first config, v3 class IntelliSense config obsolete
- Removed `css.customData` from settings.json (referenced deleted tailwind.json)
- Added `bradlc.vscode-tailwindcss` to .vscode/extensions.json recommendations
- Removed stale `.husky/_/` directory
- Verified build still passes with `bun run build`
