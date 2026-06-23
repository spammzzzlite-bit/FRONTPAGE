function processorSafeText(text, limit = 300) {
  if (!text) return "";
  return String(text).replace(/\s+/g, " ").trim().slice(0, limit);
}

function processorCleanUrl(rawUrl) {
  try {
    const url = new URL(rawUrl || "");
    return {
      url: url.origin + url.pathname,
      path: url.pathname || "/",
      host: url.hostname
    };
  } catch {
    return {
      url: rawUrl || "",
      path: rawUrl || "",
      host: ""
    };
  }
}

function normalizePage(page) {
  const cleaned = processorCleanUrl(page && page.url ? page.url : "");
  return {
    url: cleaned.url || processorSafeText(page && page.url, 240),
    path: (page && page.path) || cleaned.path || "",
    title: processorSafeText(page && page.title, 160)
  };
}

function dedupeByKey(items, getKey, limit = 100) {
  const output = [];
  const seen = new Set();

  for (const item of items || []) {
    const key = processorSafeText(getKey(item), 500).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
    if (output.length >= limit) break;
  }

  return output;
}

function eventSortValue(event) {
  if (typeof event.sequence === "number") return event.sequence;
  const parsed = Date.parse(event.timestamp || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function getEvents(rawRecording) {
  return [...(rawRecording && Array.isArray(rawRecording.events) ? rawRecording.events : [])]
    .sort((a, b) => eventSortValue(a) - eventSortValue(b));
}

function compactTarget(target) {
  if (!target) return null;

  const compact = {
    tag: processorSafeText(target.tag, 40),
    type: processorSafeText(target.inputType || target.type, 60),
    text: processorSafeText(target.text, 180),
    label: processorSafeText(target.label || target.ariaLabel, 180),
    placeholder: processorSafeText(target.placeholder, 160),
    selector: processorSafeText(target.selector, 220),
    section: processorSafeText(target.section, 160),
    nearbyText: processorSafeText(target.nearbyText, 320)
  };

  Object.keys(compact).forEach((key) => {
    if (!compact[key]) delete compact[key];
  });

  return Object.keys(compact).length ? compact : null;
}

function humanTargetName(target) {
  if (!target) return "page";
  return processorSafeText(
    target.text || target.label || target.placeholder || target.selector || target.tag || "element",
    120
  );
}

function buildProcessedJourney(events) {
  const journeyEvents = events.filter((event) => [
    "recording_state", "navigation", "page_context", "click", "input", "keyboard", "validation"
  ].includes(event.eventType));

  return journeyEvents.slice(0, 120).map((event, index) => {
    const target = compactTarget(event.target);
    const page = normalizePage(event.page || {});
    const base = {
      step: index + 1,
      source: "recording_observed",
      eventType: event.eventType,
      action: processorSafeText(event.data && event.data.action, 80) || event.eventType,
      timestamp: event.timestamp || "",
      page,
      target
    };

    if (event.eventType === "click") {
      base.summary = `Clicked ${humanTargetName(event.target)}`;
    } else if (event.eventType === "input") {
      base.summary = `Changed ${humanTargetName(event.target)} with masked value`;
      base.value = processorSafeText(event.data && event.data.value, 40) || "[MASKED]";
      base.masked = true;
    } else if (event.eventType === "keyboard") {
      base.summary = `Pressed ${processorSafeText(event.data && event.data.key, 40) || "key"} on ${humanTargetName(event.target)}`;
    } else if (event.eventType === "navigation") {
      base.summary = `Navigation: ${processorSafeText(event.data && event.data.action, 80)}`;
      if (event.data && event.data.fromUrl) base.fromUrl = processorCleanUrl(event.data.fromUrl).url;
      if (event.data && event.data.toUrl) base.toUrl = processorCleanUrl(event.data.toUrl).url;
    } else if (event.eventType === "validation") {
      base.summary = "Validation message observed";
      base.messages = ((event.context && event.context.validationMessages) || []).slice(0, 8);
    } else if (event.eventType === "page_context") {
      base.summary = `Captured page context: ${processorSafeText(page.title || page.path, 120)}`;
    } else {
      base.summary = processorSafeText(event.data && event.data.action, 120) || event.eventType;
    }

    Object.keys(base).forEach((key) => {
      if (base[key] === null || base[key] === "" || (Array.isArray(base[key]) && base[key].length === 0)) {
        delete base[key];
      }
    });

    return base;
  });
}

function buildObservedUiElements(events) {
  const items = [];

  for (const event of events) {
    const page = normalizePage(event.page || {});

    if (event.target) {
      const target = compactTarget(event.target);
      if (target) {
        items.push({
          source: "recording_observed",
          page,
          element: target
        });
      }
    }

    const context = event.context || {};

    for (const element of context.visibleElements || []) {
      const normalized = {
        type: processorSafeText(element.type, 60),
        text: processorSafeText(element.text, 180),
        label: processorSafeText(element.label, 180),
        placeholder: processorSafeText(element.placeholder, 160),
        selector: processorSafeText(element.selector, 220)
      };
      Object.keys(normalized).forEach((key) => {
        if (!normalized[key]) delete normalized[key];
      });
      items.push({ source: "recording_observed", page, element: normalized });
    }

    for (const field of context.fieldMetadata || []) {
      const normalized = {
        field: processorSafeText(field.field, 180),
        tag: processorSafeText(field.tag, 40),
        type: processorSafeText(field.type, 60),
        required: Boolean(field.required),
        minLength: field.minLength,
        maxLength: field.maxLength,
        min: processorSafeText(field.min, 40),
        max: processorSafeText(field.max, 40),
        pattern: processorSafeText(field.pattern, 120),
        placeholder: processorSafeText(field.placeholder, 160),
        autocomplete: processorSafeText(field.autocomplete, 80),
        disabled: Boolean(field.disabled),
        readonly: Boolean(field.readonly),
        selector: processorSafeText(field.selector, 220)
      };
      Object.keys(normalized).forEach((key) => {
        if (normalized[key] === "" || normalized[key] === null || normalized[key] === undefined) delete normalized[key];
      });
      items.push({ source: "recording_observed", page, element: normalized });
    }
  }

  return dedupeByKey(
    items,
    (item) => `${item.page.path}|${JSON.stringify(item.element)}`,
    60
  );
}

function buildNavigationFlow(events) {
  const navEvents = events.filter((event) => ["navigation", "network"].includes(event.eventType));

  return dedupeByKey(
    navEvents.map((event) => {
      const page = normalizePage(event.page || {});
      return {
        source: "recording_observed",
        type: event.eventType,
        action: processorSafeText(event.data && event.data.action, 80) || event.eventType,
        method: processorSafeText(event.data && event.data.method, 20),
        statusCode: event.data && event.data.statusCode ? event.data.statusCode : undefined,
        api: processorSafeText(event.data && event.data.api, 120),
        fromUrl: event.data && event.data.fromUrl ? processorCleanUrl(event.data.fromUrl).url : undefined,
        toUrl: event.data && event.data.toUrl ? processorCleanUrl(event.data.toUrl).url : undefined,
        page
      };
    }).map((item) => {
      Object.keys(item).forEach((key) => {
        if (item[key] === "" || item[key] === undefined || item[key] === null) delete item[key];
      });
      return item;
    }),
    (item) => `${item.type}|${item.action}|${item.method || ""}|${item.statusCode || ""}|${item.page.url}|${item.fromUrl || ""}|${item.toUrl || ""}`,
    40
  );
}

function buildNetworkObservations(events) {
  const networkEvents = events.filter((event) => ["network", "network_failure"].includes(event.eventType));

  return dedupeByKey(
    networkEvents.map((event) => ({
      source: "recording_observed",
      eventType: event.eventType,
      api: processorSafeText(event.data && event.data.api, 140),
      method: processorSafeText(event.data && event.data.method, 20),
      url: processorSafeText(event.data && event.data.url, 260),
      origin: processorSafeText(event.data && event.data.origin, 120),
      path: processorSafeText(event.data && event.data.path, 220),
      statusCode: event.data && event.data.statusCode ? event.data.statusCode : undefined,
      resourceType: processorSafeText(event.data && event.data.resourceType, 40),
      error: processorSafeText(event.data && event.data.error, 220)
    })).map((item) => {
      Object.keys(item).forEach((key) => {
        if (item[key] === "" || item[key] === undefined || item[key] === null) delete item[key];
      });
      return item;
    }),
    (item) => `${item.eventType}|${item.method}|${item.statusCode || ""}|${item.url}|${item.error || ""}`,
    30
  );
}

function buildValidationMessages(events) {
  const messages = [];

  for (const event of events) {
    const contextMessages = event.context && Array.isArray(event.context.validationMessages)
      ? event.context.validationMessages
      : [];

    for (const message of contextMessages) {
      messages.push({
        source: "recording_observed",
        page: normalizePage(event.page || {}),
        message: processorSafeText(message, 220)
      });
    }
  }

  return dedupeByKey(messages, (item) => `${item.page.path}|${item.message}`, 40);
}

function buildPageContextSummary(events) {
  const contexts = [];

  for (const event of events) {
    if (!event.context || !event.context.pageSnapshot) continue;

    const snapshot = event.context.pageSnapshot;
    const page = normalizePage(event.page || {});

    contexts.push({
      source: "recording_observed",
      page,
      title: processorSafeText(snapshot.title || page.title, 160),
      headings: (snapshot.headings || []).slice(0, 10),
      buttons: (snapshot.buttons || []).slice(0, 12),
      links: (snapshot.links || []).slice(0, 12),
      validationMessages: (event.context.validationMessages || []).slice(0, 8),
      fieldCount: Array.isArray(event.context.fieldMetadata) ? event.context.fieldMetadata.length : 0,
      visibleElementCount: Array.isArray(event.context.visibleElements) ? event.context.visibleElements.length : 0
    });
  }

  return dedupeByKey(contexts, (item) => `${item.page.path}|${item.title}|${item.headings.join("|")}|${item.fieldCount}`, 40);
}

function buildMissingInformation(events, session) {
  const missing = [];
  const hasInput = events.some((event) => event.eventType === "input");
  const hasClick = events.some((event) => event.eventType === "click");
  const hasValidation = events.some((event) => event.eventType === "validation" || (event.context && (event.context.validationMessages || []).length));
  const hasNetwork = events.some((event) => event.eventType === "network" || event.eventType === "network_failure");

  if (!hasClick) missing.push("No click actions were captured. The recording may not include a complete user journey.");
  if (!hasInput) missing.push("No input/change actions were captured. Typed values are intentionally masked, but field interactions should still appear.");
  if (!hasValidation) missing.push("No validation or error messages were observed during the recording.");
  if (!hasNetwork) missing.push("No relevant navigation/API/network observations were captured.");

  return missing;
}

function buildStats(events) {
  const counts = {};
  for (const event of events) {
    const type = event.eventType || "unknown";
    counts[type] = (counts[type] || 0) + 1;
  }

  return {
    totalEvents: events.length,
    eventTypeCounts: counts
  };
}

function buildAiReadyRecording(rawRecording) {
  const session = (rawRecording && rawRecording.session) || {};
  const events = getEvents(rawRecording);
  const stats = buildStats(events);

  const qwenPayload = {
    instruction: "Generate QA scenarios and manual QA test cases from this grounded recording. Do not invent UI, success messages, error messages, URLs, buttons, fields, or flows. Use recording_observed only for directly captured behavior. Use ui_inferred only for observed UI elements where the full flow was not performed. Use test_plan_inferred only for PRD/test-plan requirements not directly performed in the recording. Put unclear details in missingInformation.",
    productContext: {
      projectId: processorSafeText(session.projectId, 120),
      project: processorSafeText(session.project, 160),
      module: processorSafeText(session.module, 120),
      userGoal: processorSafeText(session.userGoal, 1000),
      prd: processorSafeText(session.prdText, 5000),
      testPlan: processorSafeText(session.testPlanText, 5000)
    },
    recordingMetadata: {
      sessionId: session.sessionId || "",
      startedAt: session.startedAt || "",
      endedAt: session.endedAt || "",
      startPage: session.startPage || {},
      stats
    },
    processedUserJourney: buildProcessedJourney(events),
    pageContextSummary: buildPageContextSummary(events),
    observedUiElements: buildObservedUiElements(events),
    navigationFlow: buildNavigationFlow(events),
    networkObservations: buildNetworkObservations(events),
    validationMessages: buildValidationMessages(events),
    missingInformation: buildMissingInformation(events, session)
  };

  return {
    schemaVersion: "qa-mind-ai-ready-recording/v2.1.3",
    generatedAt: new Date().toISOString(),
    compact: true,
    privacy: {
      inputValues: "masked",
      emailsPhonesNumbersOtps: "masked where detected"
    },
    qwenPayload
  };
}

function buildDebugRecording(rawRecording) {
  const events = getEvents(rawRecording);
  return {
    schemaVersion: "qa-mind-debug-recording/v2.1.3",
    generatedAt: new Date().toISOString(),
    compact: false,
    stats: buildStats(events),
    session: (rawRecording && rawRecording.session) || {},
    events
  };
}
