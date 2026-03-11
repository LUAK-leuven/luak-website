export function search(
  content: string,
  searchTerm: string | undefined,
): boolean {
  if (!searchTerm) return true;
  if (!content) return false;
  return content.toLowerCase().includes(searchTerm.toLowerCase());
}

export function fuzzySearch(
  content: string,
  searchTerm: string | undefined,
): number {
  if (!content) return 0;
  if (!searchTerm) return 1;
  content = content.toLowerCase();
  const searchTerms = searchTerm.toLowerCase().split(' ');
  const matches = searchTerms
    .map((term) => content.match(term))
    .filter((v) => v !== null);

  return matches.length == searchTerms.length ? 1 : 0;
}

export function matchAny<T extends string>(tags: T[], selected: T[]): boolean {
  return selected.some((it) => tags.includes(it));
}

export function matchOnFirstLetters(name: string, input: string) {
  return (
    input.toLowerCase() ===
    name
      .split(' ')
      .map((x) => x.at(0))
      .join('')
      .toLowerCase()
  );
}

export function searchInArray<T extends string>(
  tags: T[],
  searchTerm: string | undefined,
): T[] {
  if (!searchTerm) return [];
  return tags.filter((tag) => search(tag, searchTerm));
}
