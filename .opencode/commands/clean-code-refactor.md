Your task is to refactor the code according to the clean-code principles. Keep the refactor manageable and focused on addressing specific code smells. Follow these steps:

1. Pick a [code smell](https://refactoring.guru/refactoring/smells) that you want to address in the codebase.
  - The chosen code smell cannot be in the list of the 10 most recent code smells that were previously tackled, see `.tmp/code-smells.txt`.
  - If the last chosen code smell was only applied to a specific part of the codebase, continue addressing it in other parts where it occurs.
2. Explore the codebase to identify instances of the chosen code smell. Document the locations and context where the smell occurs.
3. Plan the refactoring steps needed to address the identified code smell. Break down the refactoring into small, manageable tasks that can be independently verified. If the refactoring is too large, limit it to a single module or component at a time.
4. Let the user review the plan.
5. Implement the refactoring steps as per the approved plan.
6. Verify that the refactoring has successfully addressed the code smell without introducing new issues. Run tests and perform code reviews as necessary.
7. Update `.tmp/code-smells.txt` to include the newly addressed code smell
  - Include the location if it was only applied to a specific part of the codebase.
  - If you applied the last code smell on other parts of the codebase, update the locations of that code smell (don't add a new entry for it).
  - Only keep track of the 10 most recent code smells, removing older entries as necessary.
