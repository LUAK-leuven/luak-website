export default function getLuakYear(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Months are zero-based

    // If the current month is September or later, use the current year; otherwise, use the previous year.
    // This is because the Luak year starts in September.
    return currentMonth >= 9 ? currentYear : currentYear - 1;
}
