import type { TestCase } from "../store";

export function formatForJira(testCases: TestCase[]): string {
  // Jira CSV format for test issues
  const headers = ["Summary", "Description", "Issue Type", "Priority", "Labels"];
  const rows = testCases.map((tc) => {
    const summary = tc.title;
    const description = `*Steps:*\n${tc.steps}\n\n*Expected Result:*\n${tc.expected}`;
    const priority = tc.priority.charAt(0).toUpperCase() + tc.priority.slice(1);
    const labels = tc.tags.join(" ");

    return [
      `"${summary.replace(/"/g, '""')}"`,
      `"${description.replace(/"/g, '""')}"`,
      '"Test"',
      `"${priority}"`,
      `"${labels}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
