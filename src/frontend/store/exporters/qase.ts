import type { TestCase } from "../store";

export function formatForQase(testCases: TestCase[]): string {
  // Qase CSV/JSON format. Since we are doing string export, we'll do CSV or JSON.
  // Qase accepts CSV with specific columns.
  const headers = [
    "Title",
    "Description",
    "Severity",
    "Priority",
    "Behavior",
    "Type",
    "Step Action",
    "Step Expected Result",
  ];

  const rows: string[] = [];

  testCases.forEach((tc) => {
    const actionSteps = tc.steps.split("\n").filter((s) => s.trim().length > 0);

    // Qase priority mapping
    const priorityMap: Record<string, string> = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "High", // Qase standard priorities: Low, Medium, High
    };

    const severityMap: Record<string, string> = {
      low: "Minor",
      medium: "Normal",
      high: "Major",
      critical: "Critical",
    };

    if (actionSteps.length === 0) {
      rows.push(
        [
          `"${tc.title.replace(/"/g, '""')}"`,
          `""`,
          `"${severityMap[tc.priority] || "Normal"}"`,
          `"${priorityMap[tc.priority] || "Medium"}"`,
          `"Positive"`,
          `"Functional"`,
          `"${tc.steps.replace(/"/g, '""')}"`,
          `"${tc.expected.replace(/"/g, '""')}"`,
        ].join(","),
      );
      return;
    }

    actionSteps.forEach((stepStr, index) => {
      const title = index === 0 ? `"${tc.title.replace(/"/g, '""')}"` : '""';
      const severity = index === 0 ? `"${severityMap[tc.priority] || "Normal"}"` : '""';
      const priority = index === 0 ? `"${priorityMap[tc.priority] || "Medium"}"` : '""';
      const expected =
        index === actionSteps.length - 1 ? `"${tc.expected.replace(/"/g, '""')}"` : '""';

      rows.push(
        [
          title,
          `""`,
          severity,
          priority,
          index === 0 ? `"Positive"` : '""',
          index === 0 ? `"Functional"` : '""',
          `"${stepStr.replace(/"/g, '""')}"`,
          expected,
        ].join(","),
      );
    });
  });

  return [headers.join(","), ...rows].join("\n");
}
