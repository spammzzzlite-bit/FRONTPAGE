import type { TestCase } from "../store";

export function formatForZephyr(testCases: TestCase[]): string {
  // Zephyr Scale / Zephyr Squad Excel/CSV import format
  const headers = ["Name", "Objective", "Precondition", "Status", "Priority", "Step", "Test Data", "Expected Result"];
  
  const rows: string[] = [];
  
  testCases.forEach((tc) => {
    const actionSteps = tc.steps.split('\n').filter(s => s.trim().length > 0);
    
    if (actionSteps.length === 0) {
      rows.push([
        `"${tc.title.replace(/"/g, '""')}"`,
        `"Imported from STLC AI"`,
        `""`, // Precondition
        `"Draft"`,
        `"${tc.priority}"`,
        `"${tc.steps.replace(/"/g, '""')}"`,
        `""`, // Test Data
        `"${tc.expected.replace(/"/g, '""')}"`
      ].join(','));
      return;
    }

    actionSteps.forEach((stepStr, index) => {
      const name = index === 0 ? `"${tc.title.replace(/"/g, '""')}"` : '""';
      const objective = index === 0 ? `"Imported from STLC AI"` : '""';
      const precondition = '""';
      const status = index === 0 ? `"Draft"` : '""';
      const priority = index === 0 ? `"${tc.priority}"` : '""';
      const expected = index === actionSteps.length - 1 ? `"${tc.expected.replace(/"/g, '""')}"` : '""';
      
      rows.push([
        name,
        objective,
        precondition,
        status,
        priority,
        `"${stepStr.replace(/"/g, '""')}"`,
        `""`, // Test Data
        expected
      ].join(','));
    });
  });

  return [headers.join(","), ...rows].join("\n");
}
