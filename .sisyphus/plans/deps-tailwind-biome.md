# Dependency Updates + Tailwind v4 + Ultracite/Biome Setup

## TL;DR

> **Quick Summary**: Full-stack dependency modernization — upgrade Vite to v8, React to v19, Tailwind to v4 (CSS-first + Vite plugin), Vitest to v3, migrate deprecated Supabase auth to @supabase/ssr with custom auth UI, and replace manual Biome config with Ultracite.
> 
> **Deliverables**:
> - Git repo initialized and synced with GitHub remote
> - All deps updated to latest (Vite 8, React 19, Tailwind 4, Vitest 3, Husky 9)
> - Supabase auth migrated from deprecated auth-helpers to @supabase/ssr
> - Custom auth UI replacing broken @supabase/auth-ui-react
> - Tailwind v4 with @tailwindcss/vite (no PostCSS pipeline)
> - Ultracite + Biome linting the entire project
> - Clean config: no stale files, no unused deps, bun as PM
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: T1 → T5 → T6 → T10 → T12 → F1-F4

---

## Context

### Original Request
Update deps (especially Tailwind v4 and latest Vite), setup latest Ultracite (with Biome), and lint the project. Also pull latest changes from GitHub.

### Interview Summary
**Key Discussions**:
- Vite: Jump from 4.5 to v8 (aggressive) — user chose latest
- React: Upgrade 18 → 19 — user wants latest
- Supabase auth: Migrate to @supabase/ssr — user chose full migration when told auth-helpers is deprecated and broken with React 19
- @supabase/auth-ui-react: Must be replaced with custom UI (not maintained, broken with React 19)
- Tailwind v4: CSS-first config with @tailwindcss/vite plugin — no PostCSS
- Package manager: Standardize on Bun (already has bun.lockb)
- Lint strategy: Fix all autofixable issues at once
- Git: Init locally + add remote + pull

**Research Findings**:
- React 19 removed SyntheticEvent pooling → `e.persist()` is a no-op/may throw
- Vite 8 uses Rolldown/Oxc (esbuild compat layer exists but should migrate)
- @supabase/auth-ui-react is NOT maintained (last release 2+ years ago) and broken with React 19
- @supabase/ssr's `createBrowserClient` works for client-side SPAs — no provider wrapper needed
- Ultracite 7.6.0 uses extends pattern for biome.json
- Husky v9 simplified hook format (no more husky.sh wrapper)

### Metis Review
**Identified Gaps** (addressed):
- React 19 + Supabase auth incompatibility: Addressed by including Supabase migration in scope
- `e.persist()` in useLongPress.ts: Added to React upgrade task
- Package manager inconsistency (pnpm in scripts, npx in hooks): Added to cleanup task
- tsconfig.json moduleResolution "Node" → "bundler": Added as dedicated task
- package-lock.json coexists with bun.lockb: Added to cleanup task
- Deploy script uses pnpm not bun: Added to cleanup task

---

## Work Objectives

### Core Objective
Modernize all dependencies, migrate deprecated packages, and establish Ultracite/Biome as the linting/formatting toolchain — with zero behavioral regressions in the minesweeper game.

### Concrete Deliverables
- `.git/` directory with remote origin pointing to `github.com/lucas98sf/react-minesweeper`
- `package.json` with all deps at latest versions, no unused deps
- `bun.lockb` as sole lockfile (no package-lock.json)
- `vite.config.ts` using @tailwindcss/vite and plugin-react 6
- `src/lib/supabase.ts` — new Supabase client module
- `src/components/AuthForm.tsx` — custom auth UI replacing auth-ui-react
- `src/app.tsx` — updated to use @supabase/ssr pattern (no SessionContextProvider)
- `src/components/Board.tsx` — updated to use direct supabase client import
- `src/hooks/useLongPress.ts` — e.persist() removed
- `src/app.css` — `@import "tailwindcss"` replacing @tailwind directives
- `biome.json` — managed by Ultracite (extends pattern)
- No `postcss.config.cjs`, no `tailwind.config.cjs`, no `package-lock.json`

### Definition of Done
- [ ] `bun run build` exits 0 with no TypeScript errors
- [ ] `bun test --run` passes all tests
- [ ] `bun run dev` starts without errors
- [ ] `bun run lint` exits 0
- [ ] No stale config files (postcss, tailwind config, package-lock)
- [ ] Game plays identically to before (same UI, same logic)

### Must Have
- All deps at latest stable versions
- Tailwind v4 with @tailwindcss/vite (no PostCSS pipeline)
- Ultracite with Biome managing linting/formatting
- Supabase auth working with @supabase/ssr
- Custom auth UI for Google OAuth sign-in
- Bun as sole package manager
- Git repo connected to GitHub remote

### Must NOT Have (Guardrails)
- NO game logic changes during lint/format — only style fixes
- NO application behavior changes during dep upgrades
- NO upgrade of @supabase/supabase-js v2 → v3 (stays at v2 — separate breaking change)
- NO new features, refactoring, or "improvements" beyond what's needed for upgrades
- NO architectural changes to the project structure (keep src/ layout as-is)
- NO addition of a router library — auth callback handled in existing components
- NO removal of unplugin-fonts (custom MineSweeper font is used)
- NO removal of Supabase/Express packages (user wants them)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (vitest is configured)
- **Automated tests**: YES (Tests-after — fix broken tests after dep upgrades)
- **Framework**: Vitest 3 (upgraded from 0.29.8)
- **Existing tests**: `src/test/minesweeper.test.ts`

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) - Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) - Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun test) - Run tests, verify pass/fail
- **Build/Config**: Use Bash - Run build, check exit code and output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - foundation + cleanup):
├── Task 1: Git init + remote + pull [quick]
├── Task 2: Clean up deps + scripts + lockfiles [quick]
├── Task 3: Update tsconfig.json for Vite 8 [quick]
└── Task 4: Upgrade Husky 9 + lint-staged [quick]

Wave 2 (After Wave 1 - core dep upgrades, MAX PARALLEL):
├── Task 5: Upgrade Vite 8 + plugin-react 6 + update vite.config.ts [deep]
├── Task 6: Upgrade React 19 + types + fix React 19 compat issues [deep]
├── Task 7: Upgrade Vitest 3 [quick]
├── Task 8: Tailwind v4 full migration [deep]
└── Task 9: Upgrade remaining minor deps [quick]

Wave 3 (After Wave 2 - auth migration):
└── Task 10: Migrate Supabase auth to @supabase/ssr + custom auth UI [deep]

Wave 4 (After Wave 3 - linting + final cleanup):
├── Task 11: Setup Ultracite + Biome [quick]
├── Task 12: Lint and fix entire project [unspecified-high]
└── Task 13: Update .vscode settings + cleanup stale config files [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: T1 → T5 → T6 → T10 → T12 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1   | -         | T5-T9  | 1    |
| T2   | -         | T5-T9  | 1    |
| T3   | -         | T5-T9  | 1    |
| T4   | -         | T12    | 1    |
| T5   | T1,T2,T3  | T10    | 2    |
| T6   | T1,T2,T3  | T10    | 2    |
| T7   | T1,T2,T3  | F2     | 2    |
| T8   | T1,T2,T3  | T11,T12| 2    |
| T9   | T1,T2,T3  | -      | 2    |
| T10  | T5,T6     | T11,T12| 3    |
| T11  | T8,T10    | T12    | 4    |
| T12  | T4,T8,T10,T11 | F2 | 4    |
| T13  | T11       | -      | 4    |
| F1   | ALL       | -      | F    |
| F2   | ALL       | -      | F    |
| F3   | ALL       | -      | F    |
| F4   | ALL       | -      | F    |

### Agent Dispatch Summary

- **Wave 1**: **4** — T1→`quick`, T2→`quick`, T3→`quick`, T4→`quick`
- **Wave 2**: **5** — T5→`deep`, T6→`deep`, T7→`quick`, T8→`deep`, T9→`quick`
- **Wave 3**: **1** — T10→`deep`
- **Wave 4**: **3** — T11→`quick`, T12→`unspecified-high`, T13→`quick`
- **FINAL**: **4** — F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [x] 1. Git Init + Remote + Pull

  **What to do**:
  - Initialize git repo: `git init`
  - Add remote: `git remote add origin https://github.com/lucas98sf/react-minesweeper.git`
  - Fetch from remote: `git fetch origin`
  - Checkout main branch: `git checkout -b main origin/main`
  - Ensure .gitignore exists and covers node_modules, dist, .env, .env.local
  - Stage all local changes and commit if any differ from remote

  **Must NOT do**:
  - Do NOT force push
  - Do NOT overwrite local files without checking diffs first
  - Do NOT delete any local files that don't exist on remote

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple git operations, well-defined steps
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `git-master`: Overkill for basic init + remote + pull

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T3, T4)
  - **Parallel Group**: Wave 1
  - **Blocks**: T5, T6, T7, T8, T9
  - **Blocked By**: None

  **References**:
  - `.gitignore` — Check if exists, update if needed for bun/node/Vite patterns
  - Remote repo: `https://github.com/lucas98sf/react-minesweeper` (main branch)

  **Acceptance Criteria**:
  - [ ] `git status` shows clean or manageable working tree
  - [ ] `git remote -v` shows origin → github.com/lucas98sf/react-minesweeper
  - [ ] `git branch` shows main tracking origin/main

  **QA Scenarios**:

  ```
  Scenario: Git repo initialized and synced
    Tool: Bash
    Preconditions: Working directory is /home/lucas/Development/langs/js/react-minesweeper
    Steps:
      1. Run `git remote -v`
      2. Assert output contains "origin" and "github.com/lucas98sf/react-minesweeper"
      3. Run `git branch --show-current`
      4. Assert output is "main"
      5. Run `git log --oneline -1`
      6. Assert exit code is 0 (has commits)
    Expected Result: Git repo connected to GitHub remote on main branch
    Failure Indicators: "not a git repository", "remote origin not found", no commits
    Evidence: .sisyphus/evidence/task-1-git-sync.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `chore: init git repo and sync with remote`
  - Files: `.gitignore`, any git-related files
  - Pre-commit: `git status`

- [x] 2. Clean Up Deps + Scripts + Lockfiles

  **What to do**:
  - Remove unused devDependencies from package.json:
    - `@typescript-eslint/eslint-plugin` (not configured, Biome is the linter)
    - `@typescript-eslint/parser` (not configured)
    - `autoprefixer` (not needed with Tailwind v4 + @tailwindcss/vite)
    - `postcss` (not needed with @tailwindcss/vite)
  - Delete `package-lock.json` (standardize on bun.lockb)
  - Update package.json scripts to use `bun` instead of `pnpm`:
    - `"deploy": "pnpm run build && pnpm run deploy:pages"` → `"deploy": "bun run build && bun run deploy:pages"`
  - Update lint script to use bunx:
    - `"lint": "bunx @biomejs/biome check --apply-unsafe ./src"` (keep for now, will be updated by Ultracite task)
  - Update lint-staged config to use bunx:
    - `"*.{ts,tsx}": "bunx @biomejs/biome check --apply"`
    - `"*.{js,css,md}": "bunx @biomejs/biome check --apply"`
  - Run `bun install` after changes to update bun.lockb

  **Must NOT do**:
  - Do NOT remove @supabase/supabase-js (keeping at v2)
  - Do NOT remove express (user wants it)
  - Do NOT remove unplugin-fonts (used for MineSweeper font)
  - Do NOT delete bun.lockb

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple package.json edits and file deletions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1, T3, T4)
  - **Parallel Group**: Wave 1
  - **Blocks**: T5, T6, T7, T8, T9
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `package.json` — Current scripts and deps, update in place
  - `.husky/pre-commit` — Currently uses `npx lint-staged`, will be updated by T4

  **API/Type References**:
  - N/A

  **WHY Each Reference Matters**:
  - `package.json`: Must edit carefully — remove only the 4 unused deps, update scripts

  **Acceptance Criteria**:
  - [ ] `grep -c "@typescript-eslint" package.json` returns 0
  - [ ] `grep -c "autoprefixer" package.json` returns 0
  - [ ] `grep -c '"postcss"' package.json` returns 0 (as direct dep, not as plugin)
  - [ ] `test ! -f package-lock.json && echo "PASS"` returns PASS
  - [ ] `grep -c "pnpm" package.json` returns 0
  - [ ] `bun install` succeeds

  **QA Scenarios**:

  ```
  Scenario: Unused deps removed and scripts updated
    Tool: Bash
    Preconditions: package.json exists
    Steps:
      1. Run `grep "@typescript-eslint" package.json`
      2. Assert exit code is 1 (not found)
      3. Run `grep "autoprefixer" package.json`
      4. Assert exit code is 1 (not found)
      5. Run `test -f package-lock.json && echo "EXISTS" || echo "GONE"`
      6. Assert output is "GONE"
      7. Run `grep "pnpm" package.json`
      8. Assert exit code is 1 (not found)
      9. Run `bun install`
      10. Assert exit code is 0
    Expected Result: Clean package.json with bun-only scripts and no unused deps
    Failure Indicators: Unused deps still present, pnpm still in scripts, package-lock.json exists
    Evidence: .sisyphus/evidence/task-2-cleanup.txt

  Scenario: bun install succeeds after cleanup
    Tool: Bash
    Preconditions: Unused deps removed from package.json
    Steps:
      1. Run `bun install` 
      2. Assert exit code is 0
      3. Run `test -f bun.lockb && echo "EXISTS" || echo "MISSING"`
      4. Assert output is "EXISTS"
    Expected Result: bun.lockb updated, install succeeds
    Failure Indicators: Install fails, lockfile missing
    Evidence: .sisyphus/evidence/task-2-install.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `chore: remove unused deps and standardize on bun`
  - Files: `package.json`, `package-lock.json` (deleted)
  - Pre-commit: `bun install`

- [x] 3. Update tsconfig.json for Vite 8

  **What to do**:
  - In `tsconfig.json`:
    - Change `"moduleResolution": "Node"` → `"moduleResolution": "bundler"` (required for Vite 8)
    - Add `"noUncheckedIndexedAccess": true` (recommended for strictness, optional — skip if it causes too many errors)
    - Keep paths aliases as-is (`~/*` → `src/*`)
    - Update `"types"` array if vitest v3 types path changed (check after install)
  - In `tsconfig.node.json`:
    - Change `"moduleResolution": "Node"` → `"moduleResolution": "bundler"`
  - Remove `tsconfig.node.json` if Vite 8 no longer needs it (Vite 8 uses a single tsconfig approach — verify this; if still referenced by tsconfig.json references array, keep it)

  **Must NOT do**:
  - Do NOT change `target`, `jsx`, `strict` settings
  - Do NOT add new path aliases
  - Do NOT remove the `references` array in tsconfig.json without verifying Vite 8 still needs it

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small targeted config changes
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1, T2, T4)
  - **Parallel Group**: Wave 1
  - **Blocks**: T5, T6, T7, T8, T9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `tsconfig.json` — Current config, update moduleResolution
  - `tsconfig.node.json` — Same moduleResolution update needed

  **External References**:
  - Vite 8 docs: https://vite.dev/guide/migration — tsconfig changes for Vite 8
  - TypeScript docs: moduleResolution "bundler" — what it means and why Vite needs it

  **WHY Each Reference Matters**:
  - `tsconfig.json`: Must change moduleResolution from Node to bundler — Vite 8 requires bundler resolution to properly resolve packages
  - `tsconfig.node.json`: Same change for consistency

  **Acceptance Criteria**:
  - [ ] `grep '"moduleResolution"' tsconfig.json` contains `"bundler"`
  - [ ] `grep '"moduleResolution"' tsconfig.node.json` contains `"bundler"`
  - [ ] `bun run build` (or `tsc --noEmit`) passes after changes

  **QA Scenarios**:

  ```
  Scenario: TypeScript config updated for Vite 8
    Tool: Bash
    Preconditions: tsconfig.json and tsconfig.node.json exist
    Steps:
      1. Run `grep '"moduleResolution"' tsconfig.json`
      2. Assert output contains "bundler"
      3. Run `grep '"moduleResolution"' tsconfig.node.json`
      4. Assert output contains "bundler"
    Expected Result: Both tsconfigs use bundler module resolution
    Failure Indicators: Still shows "Node" for moduleResolution
    Evidence: .sisyphus/evidence/task-3-tsconfig.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `chore: update tsconfig moduleResolution to bundler`
  - Files: `tsconfig.json`, `tsconfig.node.json`
  - Pre-commit: none

- [x] 4. Upgrade Husky 9 + lint-staged

  **What to do**:
  - `bun add -D husky@^9 lint-staged@^15`
  - Update `.husky/pre-commit` to Husky v9 format (no more husky.sh wrapper):
    ```sh
    bunx lint-staged
    ```
    (Just this one line — no shebang, no `. "$(dirname "$0")/_/husky.sh"` wrapper)
  - Delete `.husky/_/husky.sh` and `.husky/_/.gitignore` (Husky v9 doesn't use them)
  - Update `package.json` prepare script: `"prepare": "husky"` (Husky v9 simplified — no "husky install")
  - Run `bun run prepare` to re-initialize hooks

  **Must NOT do**:
  - Do NOT change the lint-staged config patterns (just update bunx path)
  - Do NOT add new hooks

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple dep upgrade with config format change
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1, T2, T3)
  - **Parallel Group**: Wave 1
  - **Blocks**: T12
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `.husky/pre-commit` — Current v8 format with husky.sh wrapper
  - `.husky/_/husky.sh` — To be deleted

  **External References**:
  - Husky v9 migration: https://github.com/typicode/husky/releases — v9 simplified hook format

  **WHY Each Reference Matters**:
  - `.husky/pre-commit`: Must rewrite to v9 format (just `bunx lint-staged`, no wrapper)
  - `.husky/_/`: Must delete — Husky v9 doesn't use this directory

  **Acceptance Criteria**:
  - [ ] `.husky/pre-commit` contains only `bunx lint-staged` (no husky.sh reference)
  - [ ] `.husky/_/` directory deleted
  - [ ] `grep '"husky"' package.json` shows version ^9
  - [ ] `bun run prepare` exits 0

  **QA Scenarios**:

  ```
  Scenario: Husky v9 hooks working
    Tool: Bash
    Preconditions: Husky v9 installed
    Steps:
      1. Run `cat .husky/pre-commit`
      2. Assert output is exactly "bunx lint-staged" (no husky.sh reference)
      3. Run `test -d .husky/_ && echo "EXISTS" || echo "GONE"`
      4. Assert output is "GONE"
      5. Run `bun run prepare`
      6. Assert exit code is 0
    Expected Result: Husky v9 format with clean hook
    Failure Indicators: husky.sh still referenced, _/ directory still exists
    Evidence: .sisyphus/evidence/task-4-husky.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `chore: upgrade husky v9 and lint-staged`
  - Files: `package.json`, `.husky/pre-commit`, `.husky/_/` (deleted)
  - Pre-commit: `bun run prepare`

- [x] 5. Upgrade Vite 8 + plugin-react 6 + Update vite.config.ts

  **What to do**:
  - `bun add -D vite@^8 @vitejs/plugin-react@^6`
  - Update `vite.config.ts`:
    - Keep existing plugins (react, Unfonts)
    - Keep existing settings (base, resolve alias, server port)
    - The `path` import from `node:path` and `__dirname` still work in Vite 8
    - Note: Vite 8 uses Rolldown/Oxc internally. Existing `esbuild.*` config works via compat layer but should be migrated to `oxc.*` if present. Currently no esbuild config in vite.config.ts so no migration needed.
    - Add a comment noting Vite 8 uses Rolldown for bundling
  - Verify `unplugin-fonts` is compatible with Vite 8 (if not, update it in T9)
  - Run `bun run build` to verify

  **Must NOT do**:
  - Do NOT add @tailwindcss/vite plugin yet (that's T8)
  - Do NOT change the base path, resolve alias, or server port
  - Do NOT remove the Unfonts plugin
  - Do NOT add esbuild or oxc config that wasn't there before

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Vite 8 is a major version jump with internal bundler change; needs careful verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T6, T7, T8, T9)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10
  - **Blocked By**: T1, T2, T3

  **References**:

  **Pattern References**:
  - `vite.config.ts` — Current Vite 4 config, update in place

  **External References**:
  - Vite 8 migration: https://vite.dev/guide/migration — breaking changes from v4→v8
  - plugin-react 6: https://github.com/vitejs/vite-plugin-react/releases — requires Vite 8+

  **WHY Each Reference Matters**:
  - `vite.config.ts`: Must keep working with Vite 8. No esbuild config to migrate, but must verify Unfonts compat

  **Acceptance Criteria**:
  - [ ] `grep '"vite"' package.json` shows version ^8
  - [ ] `grep '"@vitejs/plugin-react"' package.json` shows version ^6
  - [ ] `bun run build` exits 0

  **QA Scenarios**:

  ```
  Scenario: Vite 8 build succeeds
    Tool: Bash
    Preconditions: Vite 8 + plugin-react 6 installed
    Steps:
      1. Run `bun run build`
      2. Assert exit code is 0
      3. Run `test -d dist && echo "EXISTS" || echo "MISSING"`
      4. Assert output is "EXISTS"
    Expected Result: Build succeeds with no TypeScript errors, dist/ created
    Failure Indicators: Build fails, TypeScript errors, missing dist/
    Evidence: .sisyphus/evidence/task-5-vite8-build.txt

  Scenario: Dev server starts on port 3000
    Tool: Bash
    Preconditions: Vite 8 installed
    Steps:
      1. Run `timeout 8 bun run dev --host 0.0.0.0 2>&1 || true`
      2. Assert output contains "Local:" or "localhost:3000" or "port 3000"
    Expected Result: Vite dev server starts successfully on port 3000
    Failure Indicators: Module resolution errors, port binding fails
    Evidence: .sisyphus/evidence/task-5-vite8-dev.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `chore: upgrade vite 8 and plugin-react 6`
  - Files: `package.json`, `vite.config.ts`
  - Pre-commit: `bun run build`

- [x] 6. Upgrade React 19 + Types + Fix React 19 Compat Issues

  **What to do**:
  - `bun add react@^19 react-dom@^19`
  - `bun add -D @types/react@^19 @types/react-dom@^19`
  - Fix `src/hooks/useLongPress.ts`:
    - Remove `e.persist()` on line 39 — React 19 removed SyntheticEvent pooling, persist() is now a no-op or may throw
    - The code does `e.persist(); const clonedEvent = { ...e };` — in React 19, spread of SyntheticEvent should work without persist(), but verify. If spread doesn't capture needed properties, restructure to capture `e.currentTarget`, `e.target`, `e.touches` etc. directly before the timeout.
  - Fix `src/main.tsx`:
    - `import React from "react"` — In React 19 with react-jsx transform, this import is unnecessary. However, it's used for `<React.StrictMode>`, so keep it or change to `import { StrictMode } from "react"`
    - `ReactDOM.createRoot` still works in React 19 — no change needed
  - Verify all components render correctly after React 19 upgrade
  - Run `bun run build` to check for type errors

  **Must NOT do**:
  - Do NOT change game logic
  - Do NOT refactor component patterns beyond what React 19 requires
  - Do NOT add React 19-specific features (actions, useOptimistic, etc.)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: React 19 has breaking changes that need careful handling in existing code
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T7, T8, T9)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10
  - **Blocked By**: T1, T2, T3

  **References**:

  **Pattern References**:
  - `src/hooks/useLongPress.ts:39` — The `e.persist()` call that must be removed
  - `src/main.tsx:1` — React import (keep for StrictMode)
  - `src/app.tsx` — Uses React hooks heavily, verify no breaking changes
  - `src/components/Board.tsx` — Uses React hooks, verify no breaking changes
  - `src/components/Square.tsx` — Verify React 19 compat

  **External References**:
  - React 19 upgrade guide: https://react.dev/blog/2024/04/25/react-19 — breaking changes
  - React 19 removed: SyntheticEvent.persist(), defaultProps, string refs

  **WHY Each Reference Matters**:
  - `useLongPress.ts:39`: `e.persist()` is the known breaking change — must remove and restructure the event handling
  - `main.tsx`: Verify React 19 compat with createRoot + StrictMode

  **Acceptance Criteria**:
  - [ ] `grep '"react"' package.json` shows version ^19 (not @types)
  - [ ] `grep "e.persist()" src/hooks/useLongPress.ts` returns exit code 1 (not found)
  - [ ] `bun run build` exits 0

  **QA Scenarios**:

  ```
  Scenario: React 19 build succeeds
    Tool: Bash
    Preconditions: React 19 installed
    Steps:
      1. Run `bun run build`
      2. Assert exit code is 0
      3. Run `grep "e.persist()" src/hooks/useLongPress.ts`
      4. Assert exit code is 1 (not found)
    Expected Result: Build succeeds with no TypeScript errors, e.persist() removed
    Failure Indicators: Build fails, e.persist() still present
    Evidence: .sisyphus/evidence/task-6-react19-build.txt

  Scenario: useLongPress still works without persist
    Tool: Bash
    Preconditions: e.persist() removed from useLongPress.ts
    Steps:
      1. Run `bun run build`
      2. Assert exit code is 0
      3. Read useLongPress.ts and verify event properties are captured before setTimeout
    Expected Result: Long press hook captures needed event data without persist()
    Failure Indicators: TypeScript errors about event access after timeout
    Evidence: .sisyphus/evidence/task-6-longpress-fix.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `chore: upgrade react 19 and fix compat issues`
  - Files: `package.json`, `src/hooks/useLongPress.ts`, `src/main.tsx`
  - Pre-commit: `bun run build`

- [x] 7. Upgrade Vitest 3

  **What to do**:
  - `bun add -D vitest@^3`
  - Check if test config needs updates:
    - Vitest 3 may use a different config file format (vitest.config.ts vs vite.config.ts test block)
    - Current config: vitest types in tsconfig.json `"types": ["vite/client", "vitest/globals"]` — verify v3 types path
    - Check if `vitest/globals` types path changed in v3
  - Run `bun test --run` to verify existing tests pass
  - Fix any API changes (e.g., `vi.mock()` path changes, assertion API changes)

  **Must NOT do**:
  - Do NOT change test assertions or test logic
  - Do NOT add new tests
  - Do NOT remove any test files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Vitest upgrade is usually straightforward — config might need minor tweaks
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T8, T9)
  - **Parallel Group**: Wave 2
  - **Blocks**: F2
  - **Blocked By**: T1, T2, T3

  **References**:

  **Pattern References**:
  - `src/test/minesweeper.test.ts` — Existing test file to verify passes
  - `tsconfig.json:5` — `"types": ["vite/client", "vitest/globals"]` — may need update

  **External References**:
  - Vitest 3 migration: https://vitest.dev/guide/migration.html — breaking changes from 0.x

  **WHY Each Reference Matters**:
  - `minesweeper.test.ts`: Must pass after upgrade — if API changes break it, fix the config/import
  - `tsconfig.json`: vitest/globals types path may have changed in v3

  **Acceptance Criteria**:
  - [ ] `grep '"vitest"' package.json` shows version ^3
  - [ ] `bun test --run` exits 0 (all tests pass)

  **QA Scenarios**:

  ```
  Scenario: Vitest 3 tests pass
    Tool: Bash
    Preconditions: Vitest 3 installed
    Steps:
      1. Run `bun test --run`
      2. Assert exit code is 0
      3. Assert output contains "Tests" and no "FAIL"
    Expected Result: All existing tests pass with Vitest 3
    Failure Indicators: Test runner crashes, API incompatibility errors
    Evidence: .sisyphus/evidence/task-7-vitest3.txt

  Scenario: Vitest types resolve correctly
    Tool: Bash
    Preconditions: vitest/globals in tsconfig types
    Steps:
      1. Run `bun run build` (tsc check)
      2. Assert exit code is 0 (no type errors from vitest)
    Expected Result: TypeScript finds vitest type definitions
    Failure Indicators: "Cannot find type definition file for 'vitest/globals'"
    Evidence: .sisyphus/evidence/task-7-vitest3-types.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `chore: upgrade vitest 3`
  - Files: `package.json`, `tsconfig.json` (if types path changed)
  - Pre-commit: `bun test --run`

- [x] 8. Tailwind v4 Full Migration

  **What to do**:
  - Install: `bun add -D tailwindcss@^4 @tailwindcss/vite`
  - Update `vite.config.ts` — add tailwindcss plugin:
    ```typescript
    import tailwindcss from "@tailwindcss/vite"
    // ...
    plugins: [
      react(),
      tailwindcss(),  // Add after react()
      Unfonts({ ... }),
    ]
    ```
  - Update `src/app.css`:
    - Replace lines 1-3 (`@tailwind base/components/utilities`) with: `@import "tailwindcss";`
    - Keep `@layer base { ... }` block — this still works in v4 as standard CSS cascade layer
    - Move `@font-face` OUT of `@layer base` — @font-face is a global at-rule, shouldn't be inside a layer (this is actually a bug in current code that Tailwind v3 tolerated but v4 may not)
    - Keep `@layer components { ... }` block with `@apply` directives — these still work in v4
  - Delete `postcss.config.cjs` — no longer needed
  - Delete `tailwind.config.cjs` — no longer needed (CSS-first config in v4)
  - Run `npx @tailwindcss/upgrade` if available to auto-check for class name renames
  - Check for Tailwind v4 utility renames in source files:
    - `shadow-sm` → may need `shadow-xs` (but only if using default scale)
    - `outline-none` → `outline-hidden` (if applicable)
    - `flex-shrink-*` / `flex-grow-*` → `shrink-*` / `grow-*` (old names still work as aliases)
  - Run `bun run build` and verify visually

  **Must NOT do**:
  - Do NOT add `@theme` block unless there are custom theme values (currently none — tailwind.config.cjs has empty `extend`)
  - Do NOT change any CSS class names in components unless they're confirmed renamed in v4
  - Do NOT remove `@apply` directives (still supported in v4)
  - Do NOT remove `@layer base` or `@layer components` blocks (still valid CSS)
  - Do NOT remove the Unfonts plugin or custom font handling

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Tailwind v4 is a major architectural change — CSS-first config, Vite plugin, file deletions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T7, T9)
  - **Parallel Group**: Wave 2
  - **Blocks**: T11, T12
  - **Blocked By**: T1, T2, T3

  **References**:

  **Pattern References**:
  - `vite.config.ts` — Add @tailwindcss/vite plugin
  - `src/app.css` — Replace @tailwind directives with @import "tailwindcss", restructure @font-face
  - `tailwind.config.cjs` — To be DELETED (v4 uses CSS-first config)
  - `postcss.config.cjs` — To be DELETED (v4 uses Vite plugin, no PostCSS)

  **External References**:
  - Tailwind v4 upgrade guide: https://tailwindcss.com/docs/upgrade-guide
  - Tailwind v4 Vite setup: https://tailwindcss.com/docs/installation/using-vite
  - Tailwind v4 CSS-first config: https://tailwindcss.com/blog/tailwindcss-v4

  **WHY Each Reference Matters**:
  - `vite.config.ts`: Must add tailwindcss() plugin — this replaces the entire PostCSS pipeline
  - `src/app.css`: The CSS directives are the primary migration point — @tailwind → @import
  - `tailwind.config.cjs` + `postcss.config.cjs`: Must delete — v4 doesn't use these files

  **Acceptance Criteria**:
  - [ ] `head -1 src/app.css` outputs `@import "tailwindcss";`
  - [ ] `grep "@tailwind" src/app.css` returns exit code 1 (not found)
  - [ ] `test ! -f postcss.config.cjs && echo "PASS"` returns PASS
  - [ ] `test ! -f tailwind.config.cjs && echo "PASS"` returns PASS
  - [ ] `bun run build` exits 0
  - [ ] Dev server renders with correct Tailwind styles

  **QA Scenarios**:

  ```
  Scenario: Tailwind v4 build and styles work
    Tool: Bash
    Preconditions: Tailwind v4 + @tailwindcss/vite installed
    Steps:
      1. Run `bun run build`
      2. Assert exit code is 0
      3. Run `head -1 src/app.css`
      4. Assert output is `@import "tailwindcss";`
      5. Run `test -f postcss.config.cjs && echo "EXISTS" || echo "GONE"`
      6. Assert output is "GONE"
      7. Run `test -f tailwind.config.cjs && echo "EXISTS" || echo "GONE"`
      8. Assert output is "GONE"
    Expected Result: Tailwind v4 working via Vite plugin, old config files deleted
    Failure Indicators: Build fails, CSS not processed, old config files still exist
    Evidence: .sisyphus/evidence/task-8-tailwind4.txt

  Scenario: Tailwind utility classes still render correctly
    Tool: Bash (curl)
    Preconditions: Dev server running on port 3000
    Steps:
      1. Start dev server: `bun run dev &`
      2. Wait 5 seconds for startup
      3. Run `curl -s http://localhost:3000 | grep -c "stylesheet"`
      4. Assert output is >= 1 (CSS is being served)
      5. Kill dev server
    Expected Result: CSS is generated and served by Tailwind v4
    Failure Indicators: No stylesheet link in HTML, 404 for CSS
    Evidence: .sisyphus/evidence/task-8-tailwind4-styles.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `chore: migrate tailwind v4 with vite plugin`
  - Files: `package.json`, `vite.config.ts`, `src/app.css`, `postcss.config.cjs` (deleted), `tailwind.config.cjs` (deleted)
  - Pre-commit: `bun run build`

- [x] 9. Upgrade Remaining Minor Deps

  **What to do**:
  - `bun add -D gh-pages@^6 typescript@^5.8`
  - `bun add unplugin-fonts@^1` (verify Vite 8 compatibility — if broken, find alternative or pin)
  - Keep `@supabase/supabase-js` at v2 (per guardrail — v3 is a separate breaking change)
  - Keep `express` at current version (user wants it, not upgrading to v5)
  - Keep `@supabase/auth-helpers-react`, `@supabase/auth-ui-react`, `@supabase/auth-ui-shared` for now — they'll be removed in T10
  - Run `bun run build` to verify

  **Must NOT do**:
  - Do NOT upgrade @supabase/supabase-js to v3
  - Do NOT upgrade express to v5
  - Do NOT remove Supabase auth packages (handled by T10)
  - Do NOT add new packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple version bumps, no complex migration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T7, T8)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: T1, T2, T3

  **References**:

  **Pattern References**:
  - `package.json` — Current dep versions

  **External References**:
  - gh-pages changelog: https://github.com/tschaub/gh-pages/releases
  - unplugin-fonts: https://github.com/unplugin/unplugin-fonts — verify Vite 8 compat

  **WHY Each Reference Matters**:
  - `package.json`: Update versions in place
  - unplugin-fonts: Must verify Vite 8 compat — if broken, need alternative approach for MineSweeper font

  **Acceptance Criteria**:
  - [ ] `grep '"gh-pages"' package.json` shows version ^6
  - [ ] `bun run build` exits 0

  **QA Scenarios**:

  ```
  Scenario: Minor dep upgrades don't break build
    Tool: Bash
    Preconditions: All minor deps updated
    Steps:
      1. Run `bun run build`
      2. Assert exit code is 0
    Expected Result: Build succeeds with updated deps
    Failure Indicators: Build fails, type errors, missing modules
    Evidence: .sisyphus/evidence/task-9-minor-deps.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `chore: upgrade minor deps`
  - Files: `package.json`
  - Pre-commit: `bun run build`

- [x] 10. Migrate Supabase Auth to @supabase/ssr + Custom Auth UI

  **What to do**:
  This is the most complex task. It migrates from deprecated `@supabase/auth-helpers-react` + `@supabase/auth-ui-react` to `@supabase/ssr` with a custom auth form.

  **Step 1: Install new packages and remove old ones**
  ```bash
  bun remove @supabase/auth-helpers-react @supabase/auth-ui-react @supabase/auth-ui-shared
  bun add @supabase/ssr
  ```
  Note: Keep `@supabase/supabase-js` at v2 — `@supabase/ssr` works with it.

  **Step 2: Create Supabase client module** (`src/lib/supabase.ts`)
  ```typescript
  import { createBrowserClient } from "@supabase/ssr"

  export const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
  )
  ```
  This replaces the inline `createClient` call in `app.tsx` and provides a singleton that can be imported by any component.

  **Step 3: Create custom AuthForm component** (`src/components/AuthForm.tsx`)
  Replace the broken `@supabase/auth-ui-react` `<Auth>` component with a custom form:
  - Google OAuth sign-in button using `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + import.meta.env.BASE_URL } })`
  - Minimal styling to match existing Tailwind-based UI (dark buttons, white text)
  - Same container width (minWidth: 300px) as the old Auth component
  - The component should accept a `supabaseClient` prop or import from `~/lib/supabase`

  **Step 4: Update `src/app.tsx`**
  - Remove imports: `SessionContextProvider` from `@supabase/auth-helpers-react`, `Auth` from `@supabase/auth-ui-react`, `ThemeSupa` from `@supabase/auth-ui-shared`, `createClient` from `@supabase/supabase-js`
  - Add import: `supabase` from `~/lib/supabase`, `AuthForm` from `~/components/AuthForm`
  - Remove inline `const supabase = createClient(...)` — now imported from `~/lib/supabase`
  - Remove `<SessionContextProvider supabaseClient={supabase}>` wrapper — no longer needed
  - Replace `<Auth supabaseClient={supabase} appearance={...} providers={["google"]} />` with `<AuthForm />`
  - Session state management stays the same: `supabase.auth.getSession()` + `onAuthStateChange` still work
  - The `Container` component stays the same (uses session prop, not hooks)
  - All Supabase channel operations stay the same (using `supabase.channel()`)

  **Step 5: Update `src/components/Board.tsx`**
  - Remove imports: `useSession`, `useSupabaseClient` from `@supabase/auth-helpers-react`
  - Add import: `supabase` from `~/lib/supabase`
  - Replace `const client = useSupabaseClient()` with direct `supabase` import
  - Replace `const session = useSession()` with receiving `session` as a prop from `app.tsx` OR calling `supabase.auth.getSession()` directly
  - Preferred approach: Pass `session` as a prop from `app.tsx` to `Board` (already has `userEmail` prop, add `session` prop)
  - Replace all `client.channel(...)` with `supabase.channel(...)`

  **Must NOT do**:
  - Do NOT change game logic in Board.tsx
  - Do NOT change the Realtime channel subscription logic — just change the client reference
  - Do NOT add a router for auth callback — handle inline in existing components
  - Do NOT upgrade @supabase/supabase-js to v3
  - Do NOT change the signOut logic (still works the same way)
  - Do NOT change the Realtime Presence logic

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Auth migration touches multiple files with complex state management and Realtime integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (sole task in Wave 3)
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: T11, T12
  - **Blocked By**: T5, T6 (need Vite 8 + React 19 working first)

  **References**:

  **Pattern References**:
  - `src/app.tsx:4-6` — Old Supabase auth imports to replace
  - `src/app.tsx:16-19` — Inline supabase client creation → move to `src/lib/supabase.ts`
  - `src/app.tsx:195-207` — `<Auth>` component usage → replace with `<AuthForm />`
  - `src/app.tsx:215` — `<SessionContextProvider>` wrapper → remove
  - `src/components/Board.tsx:11` — `useSession`, `useSupabaseClient` imports → replace with direct import
  - `src/components/Board.tsx:37-38` — Hook usage → replace with supabase import + session prop

  **API/Type References**:
  - `@supabase/ssr` `createBrowserClient` — New client creation API
  - `@supabase/supabase-js` `Session` type — Still used for session state

  **External References**:
  - Supabase SSR migration: https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers
  - Supabase React quickstart: https://supabase.com/docs/guides/auth/quickstarts/react
  - @supabase/ssr GitHub: https://github.com/supabase/ssr

  **WHY Each Reference Matters**:
  - `app.tsx:4-6`: These are the imports that will break when packages are removed
  - `app.tsx:16-19`: The inline client must become a singleton module for Board.tsx to import
  - `app.tsx:195-207`: The Auth UI is the most complex replacement — need custom Google OAuth button
  - `Board.tsx:11,37-38`: These hooks disappear when auth-helpers is removed

  **Acceptance Criteria**:
  - [ ] `grep "@supabase/auth-helpers" src/app.tsx src/components/Board.tsx` returns exit code 1 (not found)
  - [ ] `grep "@supabase/auth-ui" src/app.tsx` returns exit code 1 (not found)
  - [ ] `test -f src/lib/supabase.ts && echo "EXISTS"` returns EXISTS
  - [ ] `test -f src/components/AuthForm.tsx && echo "EXISTS"` returns EXISTS
  - [ ] `bun run build` exits 0
  - [ ] `bun test --run` exits 0

  **QA Scenarios**:

  ```
  Scenario: Supabase auth migration compiles
    Tool: Bash
    Preconditions: Old auth packages removed, new code written
    Steps:
      1. Run `bun run build`
      2. Assert exit code is 0
      3. Run `grep "@supabase/auth-helpers" src/app.tsx src/components/Board.tsx 2>/dev/null`
      4. Assert exit code is 1 (not found)
      5. Run `test -f src/lib/supabase.ts && echo "EXISTS" || echo "MISSING"`
      6. Assert output is "EXISTS"
      7. Run `test -f src/components/AuthForm.tsx && echo "EXISTS" || echo "MISSING"`
      8. Assert output is "EXISTS"
    Expected Result: No old auth imports, new modules exist, build succeeds
    Failure Indicators: Build fails, old imports still present, new files missing
    Evidence: .sisyphus/evidence/task-10-supabase-build.txt

  Scenario: Board.tsx uses direct supabase import
    Tool: Bash
    Preconditions: Board.tsx migrated
    Steps:
      1. Run `grep "useSupabaseClient\|useSession" src/components/Board.tsx`
      2. Assert exit code is 1 (not found)
      3. Run `grep "from \"~/lib/supabase\"" src/components/Board.tsx`
      4. Assert exit code is 0 (found)
    Expected Result: Board uses direct supabase import instead of hooks
    Failure Indicators: Old hooks still imported
    Evidence: .sisyphus/evidence/task-10-board-migration.txt

  Scenario: No SessionContextProvider wrapper
    Tool: Bash
    Preconditions: app.tsx migrated
    Steps:
      1. Run `grep "SessionContextProvider" src/app.tsx`
      2. Assert exit code is 1 (not found)
    Expected Result: No provider wrapper in app.tsx
    Failure Indicators: SessionContextProvider still present
    Evidence: .sisyphus/evidence/task-10-no-provider.txt
  ```

  **Commit**: YES (separate commit — significant change)
  - Message: `feat: migrate supabase auth to @supabase/ssr with custom auth UI`
  - Files: `package.json`, `src/lib/supabase.ts` (new), `src/components/AuthForm.tsx` (new), `src/app.tsx`, `src/components/Board.tsx`
  - Pre-commit: `bun run build && bun test --run`

- [x] 11. Setup Ultracite + Biome

  **What to do**:
  - `bun add -D ultracite@^7 @biomejs/biome@^1`
  - Run `npx ultracite init --linter biome --frameworks react --pm bun --editors vscode`
    - This will generate a new `biome.json` with extends pattern
    - The extends will include `ultracite/biome/core` and `ultracite/biome/react`
  - The old `biome.json` will be overwritten by ultracite init
  - Add scripts to `package.json`:
    ```json
    {
      "lint": "ultracite check --write .",
      "lint:ci": "ultracite check .",
      "format": "ultracite format --write ."
    }
    ```
  - Update lint-staged config in package.json:
    ```json
    {
      "*.{ts,tsx}": "ultracite check --write",
      "*.{js,css,md}": "ultracite check --write"
    }
    ```
  - Update `.husky/pre-commit` to use ultracite:
    ```
    bunx lint-staged
    ```
    (lint-staged already calls ultracite via the config above)

  **Must NOT do**:
  - Do NOT run lint yet (that's T12)
  - Do NOT add custom Biome rules beyond what Ultracite provides
  - Do NOT remove the biome.json that Ultracite generates

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Ultracite init handles most of the setup automatically
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T13 — but T12 depends on this)
  - **Parallel Group**: Wave 4
  - **Blocks**: T12
  - **Blocked By**: T8, T10

  **References**:

  **Pattern References**:
  - `biome.json` — Current config, will be replaced by Ultracite's generated config
  - `package.json` — Scripts to update

  **External References**:
  - Ultracite docs: https://docs.ultracite.ai/
  - Ultracite init flags: `--linter biome --frameworks react --pm bun --editors vscode`

  **WHY Each Reference Matters**:
  - `biome.json`: Will be overwritten — Ultracite manages the config
  - `package.json`: Need to update lint scripts to use ultracite CLI

  **Acceptance Criteria**:
  - [ ] `grep "ultracite" package.json` finds the dependency
  - [ ] `test -f biome.json && echo "EXISTS"` returns EXISTS
  - [ ] `grep "extends" biome.json` finds Ultracite presets
  - [ ] `bun run lint:ci` exits 0 (or shows lint issues to fix)

  **QA Scenarios**:

  ```
  Scenario: Ultracite setup with Biome
    Tool: Bash
    Preconditions: Ultracite + Biome installed
    Steps:
      1. Run `grep "ultracite" package.json`
      2. Assert output contains ultracite dependency
      3. Run `grep "extends" biome.json`
      4. Assert output contains "ultracite/biome"
      5. Run `bun run lint:ci 2>&1 | head -20`
      6. Assert it runs (may show errors, that's OK — T12 will fix them)
    Expected Result: Ultracite configured with Biome extends pattern
    Failure Indicators: biome.json missing extends, ultracite not installed
    Evidence: .sisyphus/evidence/task-11-ultracite.txt
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `chore: setup ultracite with biome`
  - Files: `package.json`, `biome.json`
  - Pre-commit: none

- [x] 12. Lint and Fix Entire Project

  **What to do**:
  - Run `bun run lint` (which executes `ultracite check --write .`)
  - This will autofix all issues: formatting, import sorting, unused imports, lint violations
  - Review the changes — ensure no game logic was altered by lint fixes
  - If there are unfixable errors, decide per-case:
    - If it's a legitimate code smell → fix manually
    - If it's a false positive or overly strict rule → add override in biome.json
    - If it's in the Supabase Realtime code (complex async patterns) → add `// biome-ignore` with explanation
  - Key files to watch for over-fixing:
    - `src/core/Minesweeper.ts` (609 lines of game logic) — ensure no behavioral changes
    - `src/hooks/useLongPress.ts` — ensure the restructured event handling isn't further modified
    - `src/app.tsx` — ensure Supabase channel logic isn't broken by formatting

  **Must NOT do**:
  - Do NOT change game logic — only style/formatting fixes
  - Do NOT add `biome-ignore` comments unless truly needed for false positives
  - Do NOT change application behavior
  - Do NOT refactor code structure beyond what the linter suggests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Need to carefully review autofix results across many files
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T11)
  - **Parallel Group**: Wave 4 (sequential after T11)
  - **Blocks**: F2
  - **Blocked By**: T4, T8, T10, T11

  **References**:

  **Pattern References**:
  - All `src/**/*.ts` and `src/**/*.tsx` files — Will be linted
  - `src/core/Minesweeper.ts` — Most complex file, watch for logic changes
  - `biome.json` — Ultracite config, may need overrides for false positives

  **WHY Each Reference Matters**:
  - `Minesweeper.ts`: 609 lines of complex game logic — must ensure lint doesn't change behavior
  - All source files: Will receive formatting + import sorting changes

  **Acceptance Criteria**:
  - [ ] `bun run lint` exits 0
  - [ ] `bun run build` exits 0 after lint fixes
  - [ ] `bun test --run` exits 0 after lint fixes

  **QA Scenarios**:

  ```
  Scenario: Lint passes with zero errors
    Tool: Bash
    Preconditions: Ultracite configured, all code migrated
    Steps:
      1. Run `bun run lint:ci`
      2. Assert exit code is 0
    Expected Result: Zero lint errors across entire project
    Failure Indicators: Lint errors remain, exit code non-zero
    Evidence: .sisyphus/evidence/task-12-lint-pass.txt

  Scenario: Build still works after lint fixes
    Tool: Bash
    Preconditions: Lint applied
    Steps:
      1. Run `bun run build`
      2. Assert exit code is 0
      3. Run `bun test --run`
      4. Assert exit code is 0
    Expected Result: Build and tests pass after lint formatting
    Failure Indicators: Build breaks, tests fail
    Evidence: .sisyphus/evidence/task-12-post-lint-build.txt
  ```

  **Commit**: YES (separate commit — significant formatting changes)
  - Message: `style: lint and format entire project with ultracite/biome`
  - Files: All modified source files
  - Pre-commit: `bun run lint:ci && bun run build && bun test --run`

- [x] 13. Update .vscode Settings + Cleanup Stale Config Files

  **What to do**:
  - Update `.vscode/settings.json`:
    - Update `editor.codeActionsOnSave` to use ultracite/biome commands
    - Add `"editor.defaultFormatter": "biomejs.biome"` at top level (already partially set)
    - Remove `"eslint.enable": false` (ESLint is gone, no need to disable)
    - Update CSS custom data path if needed for Tailwind v4
    - Keep existing format-on-save and import organization settings
  - Delete `.vscode/tailwind.json` if it was only for Tailwind v3 IntelliSense (v4 may not need it, or Tailwind VS Code extension handles it)
  - Update `.vscode/extensions.json`:
    - Keep `biomejs.biome`
    - Remove `eliostruyf.vscode-typescript-exportallmodules` if no longer needed
    - Consider adding Tailwind CSS IntelliSense extension if not present
  - Verify no stale config files remain:
    - `postcss.config.cjs` — should already be deleted by T8
    - `tailwind.config.cjs` — should already be deleted by T8
    - `package-lock.json` — should already be deleted by T2
    - `.husky/_/` — should already be deleted by T4

  **Must NOT do**:
  - Do NOT add new VS Code extensions that weren't there before (except Tailwind if needed)
  - Do NOT change editor preferences (font, tab size, etc.)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple config file updates and cleanup verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11, but must be after T8)
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: T11

  **References**:

  **Pattern References**:
  - `.vscode/settings.json` — Current VS Code settings
  - `.vscode/extensions.json` — Current recommended extensions
  - `.vscode/tailwind.json` — CSS custom data for Tailwind

  **WHY Each Reference Matters**:
  - `.vscode/settings.json`: Must update formatter config for Ultracite/Biome
  - `.vscode/tailwind.json`: May be obsolete with Tailwind v4

  **Acceptance Criteria**:
  - [ ] `grep "eslint.enable" .vscode/settings.json` returns exit code 1 (not found)
  - [ ] `grep "biomejs.biome" .vscode/settings.json` finds the formatter config
  - [ ] No stale config files exist (postcss, tailwind config, package-lock)

  **QA Scenarios**:

  ```
  Scenario: VS Code settings cleaned up
    Tool: Bash
    Preconditions: All previous tasks complete
    Steps:
      1. Run `grep "eslint.enable" .vscode/settings.json`
      2. Assert exit code is 1 (not found)
      3. Run `grep "biomejs.biome" .vscode/settings.json`
      4. Assert exit code is 0 (found)
      5. Run `test -f postcss.config.cjs && echo "STALE" || echo "CLEAN"`
      6. Assert output is "CLEAN"
      7. Run `test -f tailwind.config.cjs && echo "STALE" || echo "CLEAN"`
      8. Assert output is "CLEAN"
      9. Run `test -f package-lock.json && echo "STALE" || echo "CLEAN"`
      10. Assert output is "CLEAN"
    Expected Result: VS Code settings updated, no stale config files
    Failure Indicators: ESLint reference still present, stale files exist
    Evidence: .sisyphus/evidence/task-13-vscode-cleanup.txt
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `chore: update vscode settings and cleanup stale config`
  - Files: `.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/tailwind.json` (maybe deleted)
  - Pre-commit: none

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `bun run build` + `bun run lint` + `bun test --run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (game + auth + realtime). Test edge cases: empty state, no session, rapid clicks. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `chore: init git + clean up deps and scripts` - .gitignore, package.json, tsconfig.json
- **Wave 2**: `chore: upgrade core deps (vite 8, react 19, tailwind 4, vitest 3)` - package.json, vite.config.ts, src/app.css, src/hooks/useLongPress.ts
- **Wave 3**: `feat: migrate supabase auth to @supabase/ssr` - src/lib/supabase.ts, src/components/AuthForm.tsx, src/app.tsx, src/components/Board.tsx
- **Wave 4**: `chore: setup ultracite + biome + lint project` - biome.json, .vscode/settings.json, all linted files

---

## Success Criteria

### Verification Commands
```bash
bun run build            # Expected: exits 0, no TS errors, dist/ created
bun test --run           # Expected: all tests pass
bun run dev --host 0.0.0.0 & sleep 3 && curl -s http://localhost:3000 | head -5  # Expected: HTML response
bun run lint             # Expected: exits 0, no errors
test ! -f postcss.config.cjs && echo "PASS" || echo "FAIL"  # Expected: PASS
test ! -f tailwind.config.cjs && echo "PASS" || echo "FAIL" # Expected: PASS
test ! -f package-lock.json && echo "PASS" || echo "FAIL"   # Expected: PASS
grep '"moduleResolution"' tsconfig.json  # Expected: contains "bundler"
head -1 src/app.css      # Expected: @import "tailwindcss";
git remote -v            # Expected: origin → github.com/lucas98sf/react-minesweeper
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Dev server starts
- [ ] Lint passes
- [ ] No stale config files
- [ ] Game plays identically
