/** Single recorded browser event from the Chrome extension */
export type RecordingEvent = {
  type: "click" | "input" | "navigate" | "scroll" | "screenshot" | "network" | "assert" | "wait";
  timestamp: number;
  target?: {
    tagName: string;
    id?: string;
    cssSelector: string;
    xpath: string;
    innerText?: string;
    ariaLabel?: string;
    dataTestId?: string;
  };
  value?: string; // For input events
  url?: string; // For navigate events
  screenshotPath?: string; // For screenshot events
  networkInfo?: {
    // For network events
    method: string;
    url: string;
    status: number;
    duration: number;
    requestBody?: string;
    responseBody?: string;
  };
  metadata?: Record<string, unknown>;
};

/** A complete recorded session from the Chrome extension */
export type RecordingSession = {
  id: string;
  projectId: string;
  sessionName: string;
  url: string; // Starting URL
  viewport: { width: number; height: number };
  events: RecordingEvent[];
  startedAt: number;
  endedAt: number;
  duration: number; // ms
  status: "pending" | "processing" | "converted" | "failed";
  generatedTestCaseIds: string[]; // IDs of test cases created from this session
  generatedScenarioId?: string; // Optional link to scenario
  browserInfo: {
    name: string;
    version: string;
    os: string;
  };
  recordedBy?: string; // User/profile who recorded
  tags: string[];
};
