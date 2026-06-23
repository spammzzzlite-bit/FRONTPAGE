const DEFAULT_QA_KEYWORDS = [
  "sign", "signin", "sign in", "signup", "sign up", "login", "logout",
  "register", "registration", "account", "email", "mobile", "phone",
  "password", "otp", "verify", "verification", "continue", "submit",
  "resend", "forgot", "passkey", "authentication", "required", "invalid",
  "error", "create", "confirm", "change", "session", "remember"
];

let eventWriteQueue = Promise.resolve();

function generateId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2);
}

function safeText(text, limit = 200) {
  if (!text) return "";
  return String(text).replace(/\s+/g, " ").trim().slice(0, limit);
}

function maskPII(text) {
  if (!text) return "";
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]")
    .replace(/\b(?:\+?\d[\d\s-]{8,}\d)\b/g, "[NUMBER]")
    .replace(/\b\d{4,8}\b/g, "[CODE]")
    .replace(/\s+/g, " ")
    .trim();
}

function storageGet(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

function storageSet(values) {
  return new Promise((resolve) => {
    chrome.storage.local.set(values, resolve);
  });
}

function cleanUrl(rawUrl) {
  try {
    const url = new URL(rawUrl || "");
    return {
      fullUrl: url.origin + url.pathname,
      origin: url.origin,
      path: url.pathname || "/",
      host: url.hostname
    };
  } catch {
    return {
      fullUrl: rawUrl || "",
      origin: "",
      path: rawUrl || "",
      host: ""
    };
  }
}

function extractKeywordsFromText(text) {
  const extra = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4 && word.length <= 18)
    .filter((word) => ![
      "should", "able", "using", "with", "from", "that", "this", "test",
      "user", "will", "when", "then", "there", "have", "into", "after"
    ].includes(word))
    .slice(0, 80);

  return Array.from(new Set([...DEFAULT_QA_KEYWORDS, ...extra]));
}

function buildKeywords(message) {
  return extractKeywordsFromText([
    message.project,
    message.module,
    message.userGoal,
    message.prdText,
    message.testPlanText
  ].join(" "));
}

function isNoisyResource(details) {
  const noisyTypes = [
    "image", "stylesheet", "font", "media", "script", "ping", "csp_report"
  ];

  if (noisyTypes.includes(details.type)) return true;

  const url = String(details.url || "").toLowerCase();
  const noisyPatterns = [
    "favicon", "doubleclick", "google-analytics", "googletagmanager",
    "facebook", "hotjar", "newrelic", "datadog", "clarity.ms",
    "creativecdn", "snapads", "adservice", "adsystem",
    "sentry", "segment", ".woff", ".woff2", ".ttf", ".png", ".jpg",
    ".jpeg", ".gif", ".webp", ".svg", ".mp4", ".css"
  ];

  return noisyPatterns.some((pattern) => url.includes(pattern));
}

function classifyApi(cleaned, details) {
  const path = cleaned.path.toLowerCase();
  const host = cleaned.host.toLowerCase();

  if (host.includes("accounts.google.com")) return "OAuth / Google Sign-In";
  if (host.includes("github.com") && path.includes("login")) return "GitHub Authentication";
  if (host.includes("login.microsoftonline.com")) return "Microsoft Authentication";
  if (path.includes("signin") || path.includes("login")) return "Authentication";
  if (path.includes("signup") || path.includes("register") || path.includes("registration")) return "Registration";
  if (path.includes("otp") || path.includes("verify") || path.includes("cvf")) return "OTP / Verification";
  if (path.includes("password")) return "Password Flow";
  if (path.includes("claim")) return "Account Claim / Identifier Submit";
  if (details.method && details.method !== "GET") return "Application API";

  return "Page / Navigation";
}

function shouldKeepNetworkEvent(details) {
  if (!details || isNoisyResource(details)) return false;

  const allowedTypes = ["main_frame", "sub_frame", "xmlhttprequest", "fetch"];
  if (!allowedTypes.includes(details.type)) return false;

  if (details.method && details.method !== "GET") return true;
  if (details.type === "main_frame") return true;

  const url = String(details.url || "").toLowerCase();
  const important = [
    "signin", "login", "signup", "register", "registration", "otp",
    "verify", "cvf", "claim", "auth", "account", "password", "oauth",
    "session", "token"
  ];

  return important.some((word) => url.includes(word));
}

function compactEvent(event) {
  return {
    eventId: event.eventId || generateId("event"),
    eventType: event.eventType || "unknown",
    timestamp: event.timestamp || new Date().toISOString(),
    page: event.page || {},
    target: event.target || null,
    data: event.data || {},
    ...(event.context ? { context: event.context } : {})
  };
}

async function appendEvent(event) {
  const result = await storageGet(["isRecording", "events", "sessionId"]);

  if (!result.isRecording) {
    return { success: false, reason: "Not recording" };
  }

  const events = Array.isArray(result.events) ? result.events : [];
  const finalEvent = {
    ...compactEvent(event),
    sessionId: result.sessionId || null,
    sequence: events.length + 1
  };

  events.push(finalEvent);
  await storageSet({ events });

  return { success: true, sequence: finalEvent.sequence };
}

function saveEvent(event, sendResponse = null) {
  eventWriteQueue = eventWriteQueue
    .then(() => appendEvent(event))
    .then((response) => {
      if (sendResponse) sendResponse(response);
    })
    .catch((error) => {
      console.error("QA Mind event save failed:", error);
      if (sendResponse) sendResponse({ success: false, error: error.message });
    });
}

function canInjectIntoUrl(url) {
  return /^(https?:|file:)/i.test(String(url || ""));
}

function isQaMindAppUrl(rawUrl) {
  try {
    const url = new URL(rawUrl || "");
    const host = url.hostname.toLowerCase();

    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "qamind.ai" ||
      host === "www.qamind.ai"
    );
  } catch {
    return false;
  }
}

function tabsQuery(queryInfo) {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(Array.isArray(tabs) ? tabs : []);
    });
  });
}

function sendMessageToTab(tabId, message) {
  return new Promise((resolve) => {
    if (!tabId) {
      resolve({ success: false, error: "Missing tab id" });
      return;
    }

    chrome.tabs.sendMessage(tabId, message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        resolve({ success: false, error: error.message });
        return;
      }
      resolve({ success: true, response });
    });
  });
}

function executeContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["content.js"]
      },
      () => {
        const error = chrome.runtime.lastError;
        if (error) {
          resolve({ success: false, error: error.message });
          return;
        }
        resolve({ success: true });
      }
    );
  });
}

async function ensureContentScriptAndSend(tabId, tabUrl, message) {
  let firstTry = await sendMessageToTab(tabId, { type: "QA_MIND_PING" });

  if (!firstTry.success && canInjectIntoUrl(tabUrl)) {
    await executeContentScript(tabId);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  return sendMessageToTab(tabId, message);
}

async function sendRecorderConfigToTab(tabId, tabUrl, isRecording, keywords) {
  if (!tabId) return { success: false, error: "Missing tab id" };

  return ensureContentScriptAndSend(tabId, tabUrl, {
    type: "SET_QA_RECORDER_CONFIG",
    isRecording,
    keywords: Array.isArray(keywords) ? keywords : []
  });
}

async function capturePageContext(tabId, tabUrl) {
  if (!tabId) return { success: false, error: "Missing tab id" };

  return ensureContentScriptAndSend(tabId, tabUrl, {
    type: "CAPTURE_PAGE_CONTEXT"
  });
}

async function startRecording(message) {
  const sessionId = "session_" + Date.now();
  const keywords = buildKeywords(message);

  const session = {
    sessionId,
    startedAt: new Date().toISOString(),
    endedAt: null,
    projectId: safeText(message.projectId || "", 120),
    project: safeText(message.project || "", 160),
    module: safeText(message.module || "", 120),
    userGoal: safeText(maskPII(message.userGoal || ""), 1000),
    prdText: safeText(maskPII(message.prdText || ""), 5000),
    testPlanText: safeText(maskPII(message.testPlanText || ""), 5000),
    keywords,
    startPage: {
      url: message.tabUrl || "",
      title: safeText(message.tabTitle || "", 200)
    },
    recordingTabId: message.tabId
  };

  await storageSet({
    isRecording: true,
    sessionId,
    session,
    recordingTabId: message.tabId,
    recordingTabUrl: message.tabUrl || "",
    keywords,
    events: []
  });

  await appendEvent({
    eventId: generateId("event"),
    eventType: "recording_state",
    timestamp: new Date().toISOString(),
    page: {
      url: cleanUrl(message.tabUrl || "").fullUrl,
      path: cleanUrl(message.tabUrl || "").path,
      title: safeText(message.tabTitle || "", 200)
    },
    target: null,
    data: {
      action: "recording_started"
    }
  });

  const configResult = await sendRecorderConfigToTab(message.tabId, message.tabUrl || "", true, keywords);

  setTimeout(() => {
    capturePageContext(message.tabId, message.tabUrl || "");
  }, 500);

  return {
    success: true,
    sessionId,
    warning: configResult.success ? "" : configResult.error || "Content script could not be contacted. Reload the tab and start again."
  };
}

async function stopRecording() {
  const before = await storageGet(["recordingTabId", "recordingTabUrl"]);

  if (before.recordingTabId) {
    await capturePageContext(before.recordingTabId, before.recordingTabUrl || "");
    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  const result = await storageGet(["events", "session", "recordingTabId", "recordingTabUrl", "keywords"]);
  const session = result.session || {};
  session.endedAt = new Date().toISOString();

  await storageSet({
    isRecording: false,
    recordingTabId: null,
    recordingTabUrl: "",
    session
  });

  await sendRecorderConfigToTab(
    result.recordingTabId,
    result.recordingTabUrl || "",
    false,
    result.keywords || []
  );

  return {
    success: true,
    session,
    events: Array.isArray(result.events) ? result.events : []
  };
}

async function clearRecording() {
  const result = await storageGet(["recordingTabId", "recordingTabUrl", "keywords"]);

  await storageSet({
    isRecording: false,
    sessionId: null,
    session: null,
    recordingTabId: null,
    recordingTabUrl: "",
    keywords: [],
    events: []
  });

  await sendRecorderConfigToTab(
    result.recordingTabId,
    result.recordingTabUrl || "",
    false,
    result.keywords || []
  );

  return { success: true };
}

async function publishRecordingToApp(message) {
  const tabs = await tabsQuery({});
  const appTabs = tabs.filter((tab) => tab && tab.id && isQaMindAppUrl(tab.url || ""));
  let delivered = 0;

  for (const tab of appTabs) {
    const result = await ensureContentScriptAndSend(tab.id, tab.url || "", {
      type: "QA_MIND_RECORDING_READY",
      payload: message.recording || {}
    });

    if (result.success) {
      delivered += 1;
      break;
    }
  }

  return {
    success: delivered > 0,
    delivered
  };
}

async function refreshAppConnection() {
  const tabs = await tabsQuery({});
  const appTabs = tabs.filter((tab) => tab && tab.id && isQaMindAppUrl(tab.url || ""));
  let requested = 0;

  for (const tab of appTabs) {
    const result = await ensureContentScriptAndSend(tab.id, tab.url || "", {
      type: "QA_MIND_REQUEST_APP_CONTEXT"
    });

    if (result.success) {
      requested += 1;
    }
  }

  return {
    success: requested > 0,
    requested
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return false;

  if (message.type === "START_RECORDING") {
    startRecording(message)
      .then(sendResponse)
      .catch((error) => {
        console.error("QA Mind start failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (message.type === "STOP_RECORDING") {
    stopRecording()
      .then(sendResponse)
      .catch((error) => {
        console.error("QA Mind stop failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (message.type === "CLEAR_RECORDING") {
    clearRecording()
      .then(sendResponse)
      .catch((error) => {
        console.error("QA Mind clear failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (message.type === "PUBLISH_RECORDING_TO_APP") {
    publishRecordingToApp(message)
      .then(sendResponse)
      .catch((error) => {
        console.error("QA Mind app publish failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (message.type === "REFRESH_APP_CONNECTION") {
    refreshAppConnection()
      .then(sendResponse)
      .catch((error) => {
        console.error("QA Mind app refresh failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (message.type === "LOG_EVENT") {
    saveEvent(message.event, sendResponse);
    return true;
  }

  return false;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  chrome.storage.local.get(["isRecording", "recordingTabId", "keywords"], async (result) => {
    if (!result.isRecording) return;
    if (tabId !== result.recordingTabId) return;

    const tabUrl = tab && tab.url ? tab.url : "";
    await storageSet({ recordingTabUrl: tabUrl });
    await sendRecorderConfigToTab(tabId, tabUrl, true, result.keywords || []);

    setTimeout(() => {
      capturePageContext(tabId, tabUrl);
    }, 800);
  });
});

chrome.webRequest.onCompleted.addListener(
  (details) => {
    chrome.storage.local.get(["isRecording", "recordingTabId"], (result) => {
      if (!result.isRecording) return;
      if (details.tabId !== result.recordingTabId) return;
      if (!shouldKeepNetworkEvent(details)) return;

      const cleaned = cleanUrl(details.url);
      const event = {
        eventId: generateId("event"),
        eventType: "network",
        timestamp: new Date(details.timeStamp).toISOString(),
        page: {
          url: cleaned.fullUrl,
          path: cleaned.path,
          title: ""
        },
        target: null,
        data: {
          action: "request_completed",
          api: classifyApi(cleaned, details),
          method: details.method || "GET",
          url: cleaned.fullUrl,
          origin: cleaned.origin,
          path: cleaned.path,
          statusCode: details.statusCode || null,
          resourceType: details.type || "",
          fromCache: details.fromCache || false
        }
      };

      saveEvent(event);
    });
  },
  { urls: ["<all_urls>"] }
);

chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    chrome.storage.local.get(["isRecording", "recordingTabId"], (result) => {
      if (!result.isRecording) return;
      if (details.tabId !== result.recordingTabId) return;
      if (isNoisyResource(details)) return;

      const cleaned = cleanUrl(details.url);
      const event = {
        eventId: generateId("event"),
        eventType: "network_failure",
        timestamp: new Date(details.timeStamp).toISOString(),
        page: {
          url: cleaned.fullUrl,
          path: cleaned.path,
          title: ""
        },
        target: null,
        data: {
          action: "request_failed",
          api: classifyApi(cleaned, details),
          method: details.method || "GET",
          url: cleaned.fullUrl,
          origin: cleaned.origin,
          path: cleaned.path,
          resourceType: details.type || "",
          error: details.error || "Network request failed"
        }
      };

      saveEvent(event);
    });
  },
  { urls: ["<all_urls>"] }
);
