# Plan: Toast Queue with Auto-Dismiss and Progress Bar

## Overview

Refactor the toast notification system from a single-toast singleton (`useState<ToastState | undefined>`) to an array-backed queue where each toast has its own unique id, countdown timer, and independent lifecycle. Toasts stack visually using DaisyUI's `toast` container, each showing a thin progress bar along its bottom edge that shrinks as the countdown runs. Hovering over a toast pauses both the countdown timer and the progress bar animation; moving away resumes them. A toast can still be dismissed manually by clicking the ✕ button at any time.

## Scope

**Included:**
- Refactor `useToast.ts` to manage a `ToastItem[]` queue via `useState`.
- Each toast has: unique id, type, message, duration (default 4 seconds), elapsed time tracked for pause/resume.
- `show()` pushes a new item; `close(id)` removes by id; timer auto-calls `close(id)` after duration.
- Refactor `ToastNotification.vue` to render a progress bar and emit hover events for pause/resume.
- Refactor `app.vue` to render all toasts in a DaisyUI `toast` stacking container using `v-for`.
- Update `app.page.ts` e2e page object to support querying multiple toasts by index.

**Out of scope:**
- Per-type or per-call-site custom durations (all toasts use the same 4 second default).
- Entry/exit animations for the toast cards themselves.
- Maximum stack cap (unlimited toasts can stack).
- Persisting toast state across page reloads.

## Design Decisions

1. **Duration**: All toast types auto-dismiss after 4 seconds. No per-type exceptions; manual close via ✕ is available for all types.
2. **Stack limit**: Unlimited. Every `show()` call adds a new toast; older toasts continue counting down independently.
3. **Progress bar position**: Thin bar along the bottom edge of each toast card, shrinking from full-width to zero left-to-right over the toast's duration.
4. **Hover pause**: Hovering over a toast pauses both the JS dismiss timer and the CSS progress bar animation. Moving the cursor away resumes both from where they left off (not restarted from full duration).
5. **Timer implementation**: Plain `setTimeout`/`clearTimeout` at module scope (not tied to any component's lifecycle), guarded with `import.meta.client` for SSR safety. Each toast id maps to its own timeout handle.
6. **Progress bar animation**: CSS `animation` with `animation-play-state` toggled between `running` and `paused` via a reactive boolean prop/data property. The animation duration matches the toast duration (4s).
7. **Backward compatibility**: The `show(type, message)` signature is unchanged — all 9 existing call sites require no edits. Only `app.vue` changes its consumption of the composable (`state` → `toasts`, `close()` → `close(id)`).
8. **`ToastNotification.vue` positioning**: Remove the fixed-positioning Tailwind classes from the component; positioning is delegated to the DaisyUI `toast` wrapper in `app.vue`.

## Prerequisites

- No database migrations or config changes required.
- `@vueuse/core` is already installed (not needed for this plan, but confirmed present for context).
- DaisyUI `toast` container class is already available via the existing DaisyUI dependency.

## Steps

### ~~Step 1 — Add component and unit tests for the current implementation~~ DONE

**Goal**: Establish a test baseline for `ToastNotification.vue` and `useToast.ts` in their current form before any refactoring begins.

**TDD**: Write tests that cover the existing behaviour:
- `ToastNotification.vue` renders the correct DaisyUI alert class for each `type` value (`alert-info`, `alert-success`, `alert-warning`, `alert-error`).
- `ToastNotification.vue` renders the slotted message content.
- `ToastNotification.vue` emits `close` when the ✕ button is clicked.
- `useToast`: `show(type, message)` sets `state` to the correct `{ type, message }` object.
- `useToast`: `close()` sets `state` to `undefined`.

**Acceptance criteria**:
- All new tests pass against the unchanged source files.
- No source files are modified in this step.

**Notes**: These tests serve as a regression safety net for the refactoring steps that follow. Use `@vue/test-utils` for the component tests, consistent with any existing component test patterns in the project.

---

### Step 2 — Define the `ToastItem` type and refactor `useToast.ts` to a queue

**Goal**: Replace the singleton `useState<ToastState | undefined>` with a `useState<ToastItem[]>` queue, with `show()` pushing new items and `close(id)` removing by id. No timers yet.

**TDD**: Update the unit tests from Step 1 to cover the new queue behaviour:
- `show()` adds a `ToastItem` with a unique id, the correct type, and the correct message to the `toasts` array.
- Calling `show()` twice results in two independent items in the array.
- `close(id)` removes only the item with the matching id, leaving other items intact.
- Calling `close()` with an unknown id logs a `console.warn` and leaves the array unchanged (no error thrown).

**Acceptance criteria**:
- `useToast()` returns `{ show, close, toasts }` (readonly array) instead of `{ show, close, state }`.
- Each `ToastItem` has: `id` (unique string), `type`, `message`.
- Multiple `show()` calls accumulate in `toasts`; each `close(id)` removes exactly one item.
- Calling `close()` with an unknown id emits a `console.warn` and does not modify the array.
- The `state` export is removed.

**Notes**: `id` can be generated with `crypto.randomUUID()`, which is available in the browser and Nuxt's server runtime. The existing exported type for toast type (`'success' | 'warning' | 'error' | 'info'`) should be extracted as a named type alias (`ToastType`) to avoid repetition in the new `ToastItem` interface.

---

### Step 3 — Update `app.vue` to render the toast queue

**Goal**: Replace the single `<ToastNotification v-if="state !== undefined">` with a `v-for` loop inside a DaisyUI `toast` stacking container, consuming `toasts` and `close(id)` from `useToast()`, and update the e2e page object so existing toast tests continue to pass.

**Acceptance criteria**:
- `app.vue` renders a `<div class="toast toast-bottom toast-end z-50">` wrapper containing one `<ToastNotification>` per item in `toasts`, each with `:key="toast.id"`.
- Each `ToastNotification` receives `:type="toast.type"` and `@close="close(toast.id)"`.
- When `toasts` is empty, the wrapper renders nothing (using `v-if` or an empty `v-for` — either is acceptable).
- Multiple simultaneous toasts render stacked (visual spot-check).
- The `state` import and the old `v-if` block are removed.
- `AppPage.toastMessage` in `test/e2e/pages/app.page.ts` uses `.first()` so that tests asserting on a single toast do not fail when more than one is visible.
- `AppPage` exposes a `toastAt(index: number)` accessor for tests that need to target a specific toast in a stack.
- Existing e2e tests that reference `toastMessage` (e.g. `signup.spec.ts`) continue to pass.

**Notes**: DaisyUI's `toast toast-bottom toast-end` positions the container fixed at bottom-right and stacks children vertically. Remove the fixed-positioning classes (`fixed z-50 w-[90%] mx-[5%] ...`) from `ToastNotification.vue`'s root element in this step, since `app.vue`'s wrapper now owns positioning. The `data-testid="toast"` attribute on `ToastNotification.vue` remains unchanged — only the selector chaining in the page object changes.

---

### Step 4 — Add auto-dismiss timers to `useToast.ts`

**Goal**: Each toast starts a `setTimeout` when added that calls `close(id)` after 4 seconds, automatically clearing itself when `close(id)` is called manually before the timeout fires.

**TDD**: Extend the unit tests from Step 2 using fake timers (`vi.useFakeTimers()`):
- After 4000ms, a toast is automatically removed from `toasts`.
- If `close(id)` is called before 4000ms, the toast is removed immediately and no second removal occurs after 4000ms.
- Calling `show()` twice starts two independent timers; each toast is removed at its own deadline, independently of the other.
- `import.meta.client` guard: timers are not scheduled during SSR (test by simulating a non-browser environment if the test setup allows, or document as manual verification).

**Acceptance criteria**:
- Each call to `show()` registers a `setTimeout` of 4000ms that calls `close(id)`.
- `close(id)` calls `clearTimeout` for that toast's handle before removing it (no stray timer).
- A map of `id → timeoutHandle` is maintained at module scope (not inside the composable function body) so it is shared across all `useToast()` invocations.
- `import.meta.client` guards all `setTimeout`/`clearTimeout` calls.
- After 4000ms (fake timers), a toast is automatically removed.
- Manual `close(id)` before timeout prevents any later auto-removal.
- Two toasts started at different times each auto-dismiss at their own 4-second deadline independently.

**Notes**: The timer handle map must live outside the `useToast()` function body so it is shared across all components that call `useToast()`. This is the same reason `useState` is used for the reactive array — both the state and the timers must be singletons.

---

### Step 5 — Add progress bar to `ToastNotification.vue`

**Goal**: Render a thin progress bar along the bottom edge of each toast card that shrinks from full-width to zero over 4 seconds using a CSS animation, and expose a `paused` prop that halts the animation mid-progress when `true`.

**Acceptance criteria**:
- A thin (e.g. `h-1`) bar element is rendered inside `ToastNotification.vue`, visually at the bottom of the card.
- The bar uses a CSS `animation` (or Tailwind `animate-` with a custom keyframe in `main.scss`) that transitions its width (or `scaleX` transform) from 100% to 0% over exactly 4 seconds with a linear easing.
- The component accepts a `paused` prop (boolean, default `false`). When `paused` is `true`, the bar's `animation-play-state` is set to `paused`; when `false`, it is `running`.
- The bar's color matches or complements the toast type's DaisyUI alert color (use `bg-current` or an appropriate opacity so it is visible but not distracting).
- The fixed-positioning classes removed in Step 3 are not re-added here.
- Progress bar animation starts at 100% width and reaches 0% at the 4-second mark (visual check / Playwright assertion on computed style if feasible).
- Progress bar animation is paused when `paused` prop is `true` and running when `false` (visual check).

**Notes**: The 4-second duration is hardcoded in the CSS animation definition. If per-call durations are ever added (out of scope), the animation duration would need to become an inline style; for now, a class-based CSS animation is sufficient. Define the keyframe in `app/assets/css/main.scss` using `@keyframes` so it is globally available, consistent with the project's pattern of keeping global styles in that file.

---

### Step 6 — Implement hover pause/resume

**Goal**: Hovering over a `ToastNotification` card pauses the progress bar animation and the JS dismiss timer; moving the cursor away resumes both from where they left off.

**Acceptance criteria**:
- `ToastNotification.vue` emits `pause` on `mouseenter` and `resume` on `mouseleave`.
- `app.vue` handles these events: on `pause`, records the remaining duration for that toast's timer and cancels the `setTimeout`; on `resume`, starts a new `setTimeout` for the remaining duration.
- The progress bar's `paused` prop is set to `true` on `pause` and `false` on `resume`.
- If the toast is dismissed (manually or by timer) while paused, no error occurs.
- A toast that was never hovered dismisses after exactly 4 seconds as before (Step 4 tests remain green).
- `pauseToast(id)` cancels the running timer.
- `resumeToast(id)` after pause starts a new timer for the remaining duration.
- A toast dismissed while paused does not throw or cause stale timers.

**Notes**: Remaining duration must be tracked per-toast-id in `useToast.ts`. At the moment `show()` is called, `startTime` is recorded. When `pause` fires, elapsed = `Date.now() - startTime`; remaining = `4000 - elapsed`. `clearTimeout` the current handle, store `remaining` alongside the toast, clear `startTime`. When `resume` fires, set a new `startTime = Date.now()`, start a new `setTimeout(remaining)`, update the handle. Expose `pauseToast(id)` and `resumeToast(id)` from `useToast()` for `app.vue` to call. The progress bar animation `animation-delay` approach (negative delay to resume from mid-point) may be fragile; instead, on resume, use an inline `animation-duration` style equal to the remaining duration so the CSS animation duration matches the new JS timer. This requires `ToastNotification.vue` to accept a `remainingDuration` prop (number, default 4000) that sets the animation duration via an inline style.
