export const PAGE_TEXT = {
  heroHeadline: "Tests, written\nwhile you watch.",
  /** Word that gets the ink-underline + italic terracotta treatment */
  heroAccentWord: "written",
  heroEyebrow: "Quality assurance, with a mind of its own.",
  heroSubtext:
    "QAMind AI generates, runs, and reasons about your tests — surfacing flaky cases and real bugs before your users do.",
  heroStats: ["10k+ test cases generated", "Playwright native", "No seat fees"],
  fallWords: [
    "calm",
    "intent",
    "empty",
    "plainly",
    "careful",
    "slowly",
    "deliberately",
    "written",
    "drafting",
    "running",
    "reading",
    "workspace",
    "quality",
  ],
  nav: {
    "how-it-works": "How it works",
    features: "Features",
    dashboard: "Dashboard",
    recorder: "Recorder",
    colophon: "About",
  },
  stillnessQuotes: [
    "A working desk for QA engineers who prefer a careful page over a noisy dashboard.",
    "The product is calm on purpose.",
    "One project deserves your full attention.",
    "Fair pricing is quiet pricing.",
  ],
  quote: {
    body: "We took the autoplay video off the homepage. Then we took the gradient off. Now the page is just words. We like it more.",
    attribution: "- Editor's note",
  },
  practice: {
    drafting: {
      title: "Drafting",
      placeholder: "Paste your requirement here...",
      description:
        "Paste a requirement document. We outline cases as plain rows you can edit, reorder, or throw away. No AI confidence badges.",
    },
    running: {
      title: "Running",
      idle: "Run Tests",
      running: "Running...",
      complete: "Complete",
      description:
        "Connect a runner when you're ready. Until then, the runs page sits empty - and that's fine. Empty is a state, not a failure.",
    },
    reading: {
      title: "Reading",
      description:
        "Reports come as documents, not stadium scoreboards. Two columns of prose, one chart if it earns its place.",
    },
  },
  features: {
    workspace: {
      label: "Workspace",
      desc: "One project at a time. No dashboards.",
    },
    format: {
      label: "Format",
      desc: "Plain text in. Cases out. Export anytime.",
    },
    pace: {
      label: "Pace",
      desc: "Runs are on-demand. Nothing fires blindly.",
    },
    cost: {
      label: "Cost",
      desc: "Pay per workspace, monthly. No seat fee.",
    },
    manifestos: {
      workspace: "One project deserves your full attention.",
      format: "Plain text is a feature, not a limitation.",
      pace: "Speed is a byproduct of clarity.",
      cost: "Fair pricing is quiet pricing.",
    },
  },

  // ─── Section skeletons (real copy added per module) ──────────────────
  howItWorks: {
    sectionMarker: "The problem",
    heading: "Manual QA is slow, noisy, and fragmented.",
    pains: [
      {
        title: "Bottlenecked Test Creation",
        pain: "Writing test cases from a spec is slow work. Most of the time goes to boilerplate, not to thinking about what might actually break.",
        fix: "Paste the spec or record the session. QAMind drafts the cases and you review them. The boilerplate is already written.",
      },
      {
        title: "High Flakiness",
        pain: "Flaky tests make it hard to trust your suite. Teams spend real time chasing failures that were never real bugs to begin with.",
        fix: "Any test that flips results across its last 10 runs gets flagged as flaky. It does not file a new bug. Your team only investigates real failures.",
      },
      {
        title: "Fragmented Tooling",
        pain: "Coverage lives in one tool, runs in another, bugs in a third. Getting a clear picture means opening four tabs and stitching it together yourself.",
        fix: "Suites, runs, and bugs share one workspace. One link takes you from a requirement all the way to the result.",
      },
      {
        title: "Opaque Quality Metrics",
        pain: "Nobody can answer what the quality of a release actually is without pulling data from several places first.",
        fix: "Pass rate, coverage, open bugs, and the last run are on one dashboard. The answer is one click away, not a ten-minute exercise.",
      },
      {
        title: "Stale Coverage",
        pain: "Test cases get written once and quietly go stale. They keep passing in CI long after they stopped covering what your users actually do.",
        fix: "The traceability matrix links each requirement to its tests. When something changes, you can see exactly which cases need a second look.",
      },
      {
        title: "Late QA Integration",
        pain: "Developers ship a feature update. QA finds out when tests start failing. By then the context is gone and the sprint is already behind.",
        fix: "Developers can draft test cases during development. QA reviews the output instead of writing from scratch when the branch is already merged.",
      },
    ],
    pipelineMarker: "How it works",
    pipelineHeading: "From spec to passing test in minutes.",
    pipeline: [
      {
        stage: "Input",
        heading: "Spec or Recording",
        items: ["Paste a requirement doc", "Record in Chrome"],
      },
      {
        stage: "AI",
        heading: "QAMind drafts",
        lifecycle: ["Draft", "Ready", "Approved"],
      },
      {
        stage: "Output",
        heading: "Runs & results",
        outcomes: ["Passed", "Failed", "Skipped"],
        note: "Failed cases file a bug automatically.",
      },
    ],
  },

  integrations: {
    sectionMarker: "Integrates with",
    heading: "Your stack, connected.",
    body: "QAMind plugs into the tools already in your pipeline. CI runs trigger suites automatically; failed tests file bugs without switching tabs.",
    items: [
      { name: "Jira", category: "Project management" },
      { name: "GitHub Actions", category: "CI/CD" },
      { name: "Slack", category: "Communication" },
      { name: "GitLab CI", category: "CI/CD" },
      { name: "Bitbucket", category: "CI/CD" },
      { name: "Azure DevOps", category: "CI/CD" },
      { name: "Zephyr Scale", category: "Test management" },
      { name: "TestRail", category: "Test management" },
      { name: "Playwright", category: "Automation" },
      { name: "Cypress", category: "Automation" },
      { name: "Jenkins", category: "CI/CD" },
    ],
  },

  featureHighlights: {
    sectionMarker: "Features",
    heading: "Built for everyone on the quality team.",
    roles: {
      qa: {
        label: "QA Engineer",
        features: [
          {
            id: "generate",
            name: "AI Test Generation",
            description: "Paste a spec. Get structured Playwright cases in seconds. No prompt engineering.",
          },
          {
            id: "recorder",
            name: "Chrome Recorder",
            description: "Record a browser session. QAMind converts clicks and assertions to runnable tests.",
          },
          {
            id: "suites",
            name: "Test Suites & Runs",
            description: "Organise by project and suite. Run everything or just the smoke tests.",
          },
          {
            id: "flaky",
            name: "Flaky Test Detection",
            description: "Tests that flip between pass and fail get flagged. Here's the last 10 runs.",
          },
        ],
      },
      dev: {
        label: "Developer",
        features: [
          {
            id: "fast",
            name: "Fast Test Creation",
            description: "No boilerplate. Point at a URL or OpenAPI spec, pick a test type, get cases.",
          },
          {
            id: "bugs",
            name: "Bug Tracker",
            description: "Failed runs create tracked bugs automatically. Linked to the exact test and run.",
          },
          {
            id: "trace",
            name: "Traceability Matrix",
            description: "Requirement → test case → run → bug. One click to any linked item.",
          },
        ],
      },
      pm: {
        label: "Project Manager",
        features: [
          {
            id: "sprints",
            name: "Sprint Management",
            description: "Sprints with start/end dates, assignees, and goals. Tied to your test cycle.",
          },
          {
            id: "analytics",
            name: "Analytics",
            description: "Pass rate trend, execution time, open bugs. One chart per question, not a stadium scoreboard.",
          },
          {
            id: "reports",
            name: "Reports",
            description: "Executive Summary, Test Case, Run History, Bug Report. Export to PDF or Excel.",
          },
        ],
      },
    },
  },

  dashboardPreview: {
    sectionMarker: "The dashboard",
    heading: "One screen. Everything that matters.",
    subtext: "Six cards. Real numbers. No noise.",
    cards: [
      { id: "total", label: "Total Test Cases", value: 247, type: "neutral" },
      { id: "passed", label: "Tests Passed", value: 231, subtext: "93.5% pass rate", type: "passed" },
      { id: "failed", label: "Tests Failed", value: 16, subtext: "6.5% fail rate", type: "failed" },
      { id: "lastRun", label: "Last Run", value: null, text: "Run #89 · Passed · 2 min ago", type: "neutral" },
      { id: "coverage", label: "Coverage", value: 73, subtext: "% of code covered", type: "neutral" },
      { id: "flaky", label: "Flaky Tests", value: 3, subtext: "flagged last 10 runs", type: "flaky" },
    ],
  },

  recorder: {
    sectionMarker: "Chrome extension",
    heading: "Record once. Tests follow.",
    body: "Install QA Recorder. Click through your app as a user would. QAMind AI converts the session — clicks, inputs, navigations, assertions — into runnable Playwright tests. No selectors written by hand.",
    statusSteps: ["Pending", "Processing", "Complete"],
    events: [
      "click #login-btn",
      'type "user@example.com"',
      "navigate /dashboard",
      "assert .welcome-msg visible",
    ],
  },

  finalCta: {
    sectionMarker: "Get started",
    tagline: "Quality assurance, with a mind of its own.",
    trust: [
      "Built by QA engineers who found every other tool either too loud or too limited.",
      "10,000+ test cases generated.",
      "Playwright native — the framework your team already uses.",
      "No seat fees. No per-user pricing. One workspace, one subscription.",
    ],
    colophonCredit: "Set in Bricolage Grotesque, Hanken Grotesk & IBM Plex Mono.",
  },

  faq: {
    sectionMarker: "Questions",
    heading: "Things people ask.",
    subtext: "Straight answers, no soft-selling.",
    items: [
      {
        question: "We already write our own Playwright tests. What does QAMind actually add?",
        answer:
          "Test generation is one part of it. The bug tracker, traceability matrix, flaky detection, sprint management, and analytics work independently of how tests get written. Import your existing .spec.ts files into a suite and QAMind tracks every run, flags regressions, and files bugs from failures — without changing how your team writes code.",
      },
      {
        question: "How reliable is the test generation? We've been burned by brittle AI output before.",
        answer:
          "Generated tests are grounded in what you give — a spec document, an OpenAPI definition, or a recorded session. The AI drafts structured steps and selectors from your actual content; there's no speculation from a generic prompt. You review and approve before anything runs. Nothing auto-executes without a human in the loop.",
      },
      {
        question: "How does flaky detection work?",
        answer:
          "QAMind tracks pass/fail outcomes across the last 10 runs for each test. A test that flips inconsistently is flagged flaky — not filed as a new bug. Your team investigates real failures instead of chasing false alarms.",
      },
      {
        question: "What does the Chrome recorder actually capture?",
        answer:
          "The QA Recorder captures click actions with element selectors, keyboard input, page navigations, network requests, and assertion points from a live browser session. Import the recording and QAMind converts it into structured Playwright test cases — no selector hunting, no boilerplate.",
      },
      {
        question: "What exactly is a token? Will the daily limit block us mid-sprint?",
        answer:
          "A token is a unit of AI compute. Generation and planning consume tokens proportional to input length — a short spec uses far fewer than a full requirements doc. The Standard plan refills daily and is designed for regular, focused work. If a sprint cycle needs sustained heavy generation, Premium removes the cap entirely.",
      },
      {
        question: "Can a developer use this without a dedicated QA team?",
        answer:
          "Yes. Point QAMind at a URL or an OpenAPI spec, pick a test type, and get structured Playwright cases without writing boilerplate. Failed runs create tracked bugs automatically — linked to the exact test and run. There's no separate dev view; if a QA team joins later, they see the same workspace.",
      },
    ],
  },
};
