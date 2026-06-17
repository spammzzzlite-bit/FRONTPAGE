import type { TestCase } from "../store";

export function formatForXray(testCases: TestCase[]): string {
  // Xray CSV format requires Issue Type to be Test, and has specific step columns
  const headers = ["Issue Type", "Summary", "Description", "Step", "Action", "Expected Result"];
  
  const rows: string[] = [];
  
  testCases.forEach((tc) => {
    // Break down steps by newline for Xray multi-step mapping
    const actionSteps = tc.steps.split('\n').filter(s => s.trim().length > 0);
    
    if (actionSteps.length === 0) {
      // Single step case
      rows.push([
        '"Test"',
        `"${tc.title.replace(/"/g, '""')}"`,
        `"Imported from STLC AI"`,
        `"1"`,
        `"${tc.steps.replace(/"/g, '""')}"`,
        `"${tc.expected.replace(/"/g, '""')}"`
      ].join(','));
      return;
    }

    // Multi-step case
    actionSteps.forEach((stepStr, index) => {
      // Only the first step gets the summary/description to group them under one test issue
      const summary = index === 0 ? `"${tc.title.replace(/"/g, '""')}"` : '""';
      const desc = index === 0 ? `"Imported from STLC AI"` : '""';
      const expected = index === actionSteps.length - 1 ? `"${tc.expected.replace(/"/g, '""')}"` : '""';
      
      rows.push([
        '"Test"',
        summary,
        desc,
        `"${index + 1}"`,
        `"${stepStr.replace(/"/g, '""')}"`,
        expected
      ].join(','));
    });
  });

  return [headers.join(","), ...rows].join("\n");
}
