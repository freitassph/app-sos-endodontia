# SOS Endo Clinical Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the SOS Endo frontend as a premium, responsive and accessibility-gated clinical command center and serve the verified result on localhost:3200.

**Architecture:** Keep the existing Vite/React application and real data, introduce focused pure-domain utilities for routing, persistence, calculation and timer behavior, then rebuild the app shell and screens over a local Tailwind build. UI state stays local but becomes schema-safe and URL-addressable.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Framer Motion, Lucide, Vitest, Testing Library, Playwright and axe-core.

**Spec:** `docs/superpowers/specs/2026-08-29-clinical-command-center-design.md`

## Global Constraints

- Do not change clinical source data beyond safety-oriented UI copy and presentation.
- Do not deploy, commit, push or activate analytics.
- Keep AI assistive, bounded and human-supervised.
- Use generated media only with archived prompt, source path and integrity receipt.
- Preserve both light and dark modes.
- Build must not rely on Tailwind CDN, import maps or remote decorative assets.

---

### Task 1: Test and build harness

**Files:** `package.json`, `tsconfig.json`, `vite.config.ts`, `index.css`, `tests/setup.ts`

**Produces:** `npm test`, `npm run typecheck`, deterministic local CSS compilation.

- [ ] Add Vitest, Testing Library, jsdom, axe-core and Playwright dependencies.
- [ ] Add test/typecheck scripts and Vitest jsdom configuration.
- [ ] Replace `include: ["."]` with explicit TypeScript globs.
- [ ] Remove runtime Tailwind CDN/importmap dependencies from `index.html`.
- [ ] Verify an empty harness run passes before behavior tests are added.

### Task 2: Domain utilities under TDD

**Files:** create `src/lib/appState.ts`, `src/lib/clinicalSession.ts`, `src/lib/timer.ts`, `src/lib/calculator.ts`, `src/lib/clipboard.ts`; tests under `tests/*.test.ts`.

**Produces:** typed pure functions consumed by React context and screens.

- [ ] Write failing tests for route parse/serialize and invalid-route recovery.
- [ ] Implement minimal route utilities and pass tests.
- [ ] Write failing tests for corrupt/migrated checklist storage.
- [ ] Implement schema-safe local session parsing and pass tests.
- [ ] Write failing tests for duration ranges and explicit timer selection.
- [ ] Implement structured duration parsing and pass tests.
- [ ] Write failing tests for calculator zero, hidden cost and invalid values.
- [ ] Implement calculator validation and pass tests.
- [ ] Write failing tests proving clipboard errors do not return success.
- [ ] Implement awaited clipboard result handling and pass tests.

### Task 3: Design tokens and responsive AppShell

**Files:** `tailwind.config.js`, `index.css`, `components/Layout.tsx`, create `components/BrandMark.tsx`, `components/ui/Surface.tsx`.

**Produces:** responsive shell at mobile/tablet/desktop, named navigation controls and reduced-motion support.

- [ ] Add visual regression expectations for shell roles and accessible navigation names.
- [ ] Implement mobile top bar/bottom navigation and accessible drawer.
- [ ] Implement tablet rail and desktop sidebar without body overflow.
- [ ] Add focus management, focus-visible styles and semantic landmarks.
- [ ] Verify 320/768/1440 shell screenshots.

### Task 4: Safe state and URL-addressable navigation

**Files:** `context/AppContext.tsx`, `App.tsx`, `types.ts`.

**Produces:** hash deep links, back/forward, safe clinical session, notices and exact reference destinations.

- [ ] Write failing integration tests for FAQ search destination and corrupt storage recovery.
- [ ] Replace unsafe JSON parsing with the tested session utility.
- [ ] Bind view/protocol/tab/item state to the URL hash.
- [ ] Add safe reset/new-session behavior and visible session status.
- [ ] Pass integration tests.

### Task 5: Screen redesign and clinical UX hardening

**Files:** `components/Hero.tsx`, `DiagnosisWizard.tsx`, `ProtocolView.tsx`, `PrescriptionList.tsx`, `ScriptList.tsx`, `ReferenceView.tsx`, `ManifestoView.tsx`, `components/ui/*`.

**Produces:** all audited screens rebuilt in the Clinical Command Center direction.

- [ ] Rebuild dashboard around next action, recent protocols and session status.
- [ ] Replace definitive diagnostic language and add answer review/sticky mobile actions.
- [ ] Make protocol cards semantic; separate informational and checkable content.
- [ ] Bind checklist progress and structured timer behavior.
- [ ] Add prescription acknowledgement, awaited copy and failure state.
- [ ] Add script copy/filter behavior and accessible feedback.
- [ ] Rebuild references tabs, tables, checklist session and calculator validation.
- [ ] Move manifesto into a compact method/about surface.

### Task 6: Generated brand assets

**Files:** `public/assets/sos-endo-mark.png`, favicon derivatives, `public/assets/sos-endo-og.png`, `index.html`, `docs/design-assets.md`.

**Produces:** project-bound favicon and Open Graph assets with provenance.

- [ ] Inspect generated masters and reject unsuitable candidate.
- [ ] Copy selected masters into the project without deleting originals.
- [ ] Export web sizes and verify alpha/dimensions.
- [ ] Update favicon, apple-touch and Open Graph metadata.
- [ ] Record final prompts, paths, hashes, dimensions, rights owner and disclosure decision.

### Task 7: Browser QA and localhost delivery

**Files:** test artifacts only outside source; no production mutation.

**Produces:** bounded browser evidence and live localhost:3200 process.

- [ ] Run unit/integration tests, typecheck and production build.
- [ ] Start a production-like local server on port 3200.
- [ ] Exercise search, triage, protocol, timer, prescription and calculator flows.
- [ ] Capture 320, 390, 768, 1024 and 1440px in light/dark.
- [ ] Run axe, keyboard and console/network checks.
- [ ] Repair at most three causal cycles and repeat affected evidence.
- [ ] Leave localhost:3200 running and report exact verification boundaries.

## Self-review

- Spec coverage: all audit blockers map to Tasks 2–7.
- Type contracts: pure utilities precede React consumers.
- External effects: localhost only; no deploy/analytics/commit.
- No placeholder implementation steps remain.
