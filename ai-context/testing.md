## Avoid trivial/useless tests

Do not write tests that only verify framework or template mechanics rather than actual logic or behaviour. A test is trivial/useless if it would only fail because Vue/Vitest itself is broken, not because of a bug in the component's own code.

Examples of trivial tests to avoid:

- Asserting that a prop value is reflected as a CSS class via a simple `:class="{ 'foo-bar': prop === 'foo-bar' }"` binding (this just re-tests Vue's class binding, not any logic written by the developer).
- Asserting that slot content is rendered (this just re-tests Vue's `<slot />`, not any logic written by the developer).

Instead, focus tests on behaviour that involves actual logic: conditional rendering based on computed state, event emission, data transformation, side effects (timers, API calls), and edge cases.

When in doubt, ask: "if I deleted the component-specific logic here and just left a static template, would this test still fail?" If not, the test is not worth writing.
