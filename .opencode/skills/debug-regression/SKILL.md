---
name: debug-regression
description: Use when something that used to work now fails (failing tests, broken build, resolution errors) — diagnose by finding and reverting the change that caused it, before writing any fix.
---

# Debug a regression

A regression is caused by a change, not by a missing feature. Your job is to **find that change**, not to invent new code that compensates for it.

## Protocol

Follow in order. Do not skip ahead to step 4.

1. **Reproduce.** Run the failing command. Capture the exact error and the files in the stack trace.
2. **Find the change.** `git status`, `git diff`, `git log --oneline -15`, and `git log -p -3 -- <suspect file>`. The cause is almost always in the recent diff. Anything in the diff that *configures* the thing that broke is suspect number one.
3. **Revert to prove it.** Undo the suspect change (`git stash`, `git checkout -- <file>`, or delete the added lines) and re-run. Confirm the failure disappears before writing a single line of fix.
   - If the failure does not disappear, you had the wrong suspect — return to step 2.
4. **Fix.** Now that the cause is proven, choose the minimal fix. Usually that is keeping the revert.
5. **Verify.** Re-run the full failing command plus lint/typecheck. Report the cause, not just the fix.

## Forbidden while diagnosing

Until step 3 has proven the cause, you may **not**:

- add or bump a dependency, or change a lockfile;
- add config, aliases, overrides, `paths`, mocks or shims;
- re-declare something the framework or project already provides;
- change more than one thing between two runs.

If you find yourself adding things and the error merely changes shape, stop. You are guessing. Go back to step 2 and report what you know.

## Red flags that you have the cause

- The broken thing is configured in a file that appears in the recent diff.
- The error mentions a specifier, path or module the framework normally provides — someone likely overrode it.
- The task that preceded the breakage was supposed to *use* an existing mechanism, but the diff *redefines* it.
