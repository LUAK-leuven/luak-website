# Research: timing flake in "Can sign up a new user"

## Summary

During the Step 3 verification, one of two full `yarn test` runs failed in `test/e2e/signup.spec.ts` "Can sign up a new user". The failure output was not kept. The subagent's description was that a success toast intercepted the logout button click. This was not reproduced in this investigation: 6 isolated runs and 1 full run all passed.

The code explains why the failure is possible. The success toast sits over the bottom-right of the viewport, and the logout button lies below the fold, so Playwright has to scroll it into view and it lands in the toast's area. Whether the toast is still visible at click time decides the outcome. That timing is not confirmed.

Confidence levels below are marked per point. The root cause is not confirmed.

---

## Evidence

### 1. The failing step

`test/e2e/signup.spec.ts` (after the email confirmation):

```ts
await navigateTo(page, confirmationLink);            // full page load
const profilePage = new ProfileOverviewPage(page);
await expect(profilePage.hiUserName).toContainText(newUser.firstName);
await expect(luakPage.toastMessage).toContainText('Email confirmed successfully');
await profilePage.logout();                          // clicks profile.logout
```

`ProfileOverviewPage.logout()` (`test/e2e/pages/profile/overview.page.ts:38`) calls `logoutButton.click()` with no timeout override. The click waits for the button to be actionable, bounded only by the test timeout (30 s default; `playwright.config.ts` sets no global test timeout). The `expect` timeouts are 2 s locally and 5 s on CI.

Confirmed: `expect` timeouts are not involved in the click. An intercepted click is retried until the test timeout, and then fails with a "intercepts pointer events" error.

### 2. The toast is fixed bottom-right and overlaps the button

- `app/app.vue:12-13`: toasts render in `toast toast-bottom toast-end z-50 w-[90%] mx-[5%] md:w-[80%] md:mx-[10%]`, a fixed-position stack at the bottom of the viewport with `z-50`.
- `app/composables/useToast.ts:8`: `TOAST_DURATION_MS = 5000`. A toast disappears 5 s after it is shown, counting only while it is not paused.
- `app/components/ToastNotification.vue`: `@mouseenter` emits `pause`, `@mouseleave` emits `resume`.
- `useToast.ts:86-100`: `pauseToast` clears the interval, so the toast timer stops while the pointer is over the toast.
- Measured at a 1280x720 viewport (generated user, overview page, no toast): the logout button is at `y ≈ 912`, below the 720 px viewport. `x ≈ 918-1012`. Playwright scrolls it into view before clicking, which places it near the bottom edge, inside the toast stack's area.

Confirmed: the toast and the logout button can occupy the same area after Playwright scrolls.

### 3. Possible hang mechanism (hypothesis, consistent with the symptom)

1. The confirmation page shows "Email confirmed successfully" (5 s timer starts).
2. The test clicks logout while the toast is still visible.
3. Playwright scrolls, the toast covers the button, and the click is intercepted.
4. Playwright moves the pointer over the toast. `mouseenter` fires, `pauseToast` stops the timer, and the toast never expires while the pointer stays on it.
5. Playwright keeps retrying until the test timeout (30 s), so the test fails.

Not verified: that step 4 happens in practice. Playwright's hover could also leave the pointer on the toast without triggering `mouseenter` if the toast was already under it. The shape of the failure (an interception that never clears) matches this. The alternative explanation is that the toast is visible at click time only sometimes, which depends on how long the page took to load.

### 4. Timing window

The time between the toast appearing and the logout click is the only variable. It is set by:

- the confirmation page load (cold dev server vs warm),
- `hiUserName` visibility,
- the toast assertion.

If these finish in under about 5 s, the toast is still on screen at click time. Typically they finish quickly, which would explain why the failure is intermittent rather than constant. This timing window has not been measured.

### 5. Reproduction attempts

| Run | Result |
|---|---|
| `yarn playwright test test/e2e/signup.spec.ts -g "Can sign up" --repeat-each=8` | 1 pass, then 7 fail at `toHaveURL('/')` (stayed on `/signup`). **Artifact, not the flake**: the test uses the fixed email `example@test.com`, and the DB is only cleaned once per run, so repeats 2-8 hit an existing user. |
| Same test, 6 separate invocations (fresh DB each time) | 6/6 pass |
| `yarn test` (full, after the Step 3 change) | 64/64 e2e pass |

Earlier in this session: one full run failed in the same test, and the rerun passed.

Probe attempt: a probe to measure whether the logout button is under the toast after a confirmation was not completed. The toast was already gone after a full page navigation, so the probe read no toast. The probe spec was deleted. No files besides this doc were changed.

### 6. Other observations

- `signup.spec.ts` uses the fixed address `example@test.com`. The test is only safe because `global.setup.ts` cleans the DB once per run. Any second signup in one run (for example `--repeat-each`) fails for an unrelated reason.
- The toast assertions use `luakPage.toastMessage` = `getByTestId('toast').first()`. Toasts stack, so `.first()` returns the oldest one. In this test the "Email confirmed" toast is the first visible toast, which is expected here but would be wrong if an earlier toast were still on screen.
- Other tests in the suite also click elements that the toast may cover. The mechanism is not specific to signup.

---

## Open questions

1. Is the toast actually visible at click time in the failing run? Only a failing trace can answer this. The trace for the failure was not kept, and `trace: 'on'` (non-CI) is set, so a future failure will leave one in `test-results/`.
2. Does the pointer really stay over the toast and freeze its timer (step 4 above)? Check the `mouseenter`/`pause` events in a failing trace.

## Possible fixes (not implemented)

- **Dismiss the toast before clicking** in the test: wait for the toast to be hidden, or click its close button (`toast-close-button`) first. Smallest change, test-only. It does not fix the app behaviour.
- **Scroll the logout button into view away from the toast** by making the test wait for the toast to disappear (`expect(luakPage.toastMessage).toBeHidden()`) before logging out. Adds about 5 s per such test.
- **App-level**: make the pause not freeze indefinitely, or move the toast stack above the bottom edge on desktop. This changes UI behaviour and is out of scope for a test flake.
- Whichever option is picked, add a guardrail: tests should assert on the visible toast and wait for it to clear before clicking elements it can cover (see the Step 8 testing guideline in `planning/flaky-e2e-tests/plan.md`).

Recommended next step: capture a failing trace (run the suite in a loop with `--repeat-each` on a non-duplicating test, or run the full suite a few times) and confirm steps 1-4 before choosing a fix.
