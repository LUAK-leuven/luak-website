Your task is to refactor the code according to the clean-code principles. Keep the refactor manageable and focused on addressing specific code smells. Follow these steps:

1. Choose a code smell **before reading any code**:
  - Fetch the catalog (https://refactoring.guru/refactoring/smells) with `webfetch` and choose only from its list.
  - Exclude the 10 most recent smells in `.tmp/code-smells.txt`. If the last smell was only applied to part of the codebase, continue it in the other parts instead.
  - State the chosen smell and why in 1–2 sentences.
2. Read through information about the chosen code smell on (https://refactoring.guru/refactoring/smells) to understand its characteristics and implications; how to refactor it effectively; and common pitfalls to avoid.
3. Delegate exploration to the `general` subagent (not `explore`). Pass the smell's page URL and instruct it to `webfetch` that page first, then find instances of **only that smell**, reporting locations, context and the page's matching treatment.
4. Plan the refactoring steps needed to address the identified code smell. Break down the refactoring into small, manageable tasks that can be independently verified. If the refactoring is too large, limit it to a single module or component at a time.
5. Show the plan to the user and wait for approval.
6. Implement the refactoring steps as per the approved plan.
7. Verify that the refactoring has successfully addressed the code smell without introducing new issues. Run tests and perform code reviews as necessary.
8. Update `.tmp/code-smells.txt` to include the newly addressed code smell
  - Include the location if it was only applied to a specific part of the codebase.
  - If you applied the last code smell on other parts of the codebase, update the locations of that code smell (don't add a new entry for it).
  - Only keep track of the 10 most recent code smells, removing older entries as necessary.
