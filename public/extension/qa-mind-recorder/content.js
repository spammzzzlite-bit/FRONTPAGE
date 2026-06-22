if (!window.__qaMindRecorderContentLoaded) {
  window.__qaMindRecorderContentLoaded = true;

  let qaRecorderConfig = {
    isRecording: false,
    keywords: []
  };

  let lastUrl = window.location.href;
  let lastValidationSignature = "";
  let lastPageContextSignature = "";

  const DEFAULT_QA_KEYWORDS = [
    "sign", "signin", "sign in", "signup", "sign up", "login", "logout",
    "register", "registration", "account", "email", "mobile", "phone",
    "password", "otp", "verify", "verification", "continue", "submit",
    "resend", "forgot", "passkey", "authentication", "required", "invalid",
    "error", "create", "confirm", "change", "session", "remember"
  ];

  const NOISE_KEYWORDS = [
    "₹", "mrp", "m.r.p", "stars", "ratings", "sponsored", "add to cart",
    "deal", "multivitamin", "capsule", "fish oil", "delivery", "fashion",
    "electronics", "grocery", "beauty", "customer service", "bestsellers",
    "today's deals", "prime video", "advertisement"
  ];

  function generateId(prefix) {
    return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  }

  function safeText(text, limit = 160) {
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

  function cleanUrl(rawUrl = window.location.href) {
    try {
      const url = new URL(rawUrl);
      return {
        url: url.origin + url.pathname,
        path: url.pathname || "/",
        title: safeText(document.title, 120)
      };
    } catch {
      return {
        url: rawUrl || "",
        path: rawUrl || "",
        title: safeText(document.title, 120)
      };
    }
  }

  function getPageInfo() {
    return cleanUrl(window.location.href);
  }

  function getKeywords() {
    const configKeywords = qaRecorderConfig.keywords || [];
    return Array.from(new Set([...DEFAULT_QA_KEYWORDS, ...configKeywords]))
      .map((word) => String(word || "").toLowerCase())
      .filter(Boolean);
  }

  function textHasKeyword(text) {
    const lower = String(text || "").toLowerCase();
    return getKeywords().some((keyword) => lower.includes(keyword));
  }

  function isNoiseText(text) {
    const lower = String(text || "").toLowerCase();
    return NOISE_KEYWORDS.some((keyword) => lower.includes(keyword));
  }

  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      style &&
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function getElementText(element) {
    if (!element) return "";

    if (["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)) {
      return "";
    }

    const text = element.innerText || element.textContent || "";
    return safeText(maskPII(text), 140);
  }

  function getAccessibleLabel(element) {
    if (!element) return "";

    if (element.labels && element.labels.length > 0) {
      return safeText(maskPII(element.labels[0].innerText), 120);
    }

    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) return safeText(maskPII(ariaLabel), 120);

    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return safeText(maskPII(labelElement.innerText), 120);
    }

    const placeholder = element.getAttribute("placeholder");
    if (placeholder) return safeText(maskPII(placeholder), 120);

    const name = element.getAttribute("name");
    if (name) return safeText(maskPII(name), 120);

    const id = element.getAttribute("id");
    if (id) return safeText(maskPII(id.replace(/[-_]/g, " ")), 120);

    return "";
  }

  function getSelector(element) {
    if (!element) return "";

    const tag = element.tagName.toLowerCase();

    if (element.id) return "#" + element.id;

    const dataTestId =
      element.getAttribute("data-testid") ||
      element.getAttribute("data-test") ||
      element.getAttribute("data-cy");

    if (dataTestId) return `${tag}[data-testid="${dataTestId}"]`;

    const name = element.getAttribute("name");
    if (name) return `${tag}[name="${name}"]`;

    const className = typeof element.className === "string" ? element.className.trim() : "";
    if (className) {
      const classSelector = className
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(".");
      if (classSelector) return `${tag}.${classSelector}`;
    }

    return tag;
  }

  function getSection(element) {
    if (!element) return "";

    const container = element.closest(
      "form, section, main, article, dialog, [role='dialog'], [role='form'], [aria-label]"
    );

    if (!container) return "";

    const heading = container.querySelector("h1, h2, h3, h4, legend");
    if (heading) return safeText(maskPII(heading.innerText), 100);

    const ariaLabel = container.getAttribute("aria-label");
    if (ariaLabel) return safeText(maskPII(ariaLabel), 100);

    const id = container.getAttribute("id");
    if (id) return safeText(maskPII(id.replace(/[-_]/g, " ")), 100);

    return "";
  }

  function getNearbyText(element) {
    if (!element) return "";

    const container = element.closest("form, section, article, dialog, [role='dialog'], main, div");
    if (!container) return "";

    const text = safeText(maskPII(container.innerText || ""), 260);

    if (isNoiseText(text) && !textHasKeyword(text)) return "";

    return text;
  }

  function getTargetInfo(element) {
    if (!element) return null;

    return {
      tag: element.tagName.toLowerCase(),
      text: getElementText(element),
      label: getAccessibleLabel(element),
      selector: getSelector(element),
      role: element.getAttribute("role") || "",
      ariaLabel: safeText(maskPII(element.getAttribute("aria-label") || ""), 100),
      placeholder: safeText(maskPII(element.getAttribute("placeholder") || ""), 100),
      inputType: element.getAttribute("type") || "",
      section: getSection(element),
      nearbyText: getNearbyText(element)
    };
  }

  function maskValue(element) {
    if (!element) return "[VALUE]";

    const tag = element.tagName;
    const type = (element.getAttribute("type") || "").toLowerCase();

    if (tag === "SELECT") return "[SELECTED]";
    if (type === "password") return "[PASSWORD]";
    if (type === "email") return "[EMAIL]";
    if (type === "tel") return "[PHONE]";
    if (type === "number") return "[NUMBER]";
    if (type === "date") return "[DATE]";
    if (type === "file") return "[FILE]";

    return "[TEXT]";
  }

  function uniquePush(list, value, limit) {
    const cleaned = safeText(maskPII(value), 140);
    if (!cleaned) return;
    if (isNoiseText(cleaned) && !textHasKeyword(cleaned)) return;
    if (list.some((item) => item.toLowerCase() === cleaned.toLowerCase())) return;
    if (list.length >= limit) return;
    list.push(cleaned);
  }

  function collectTextFromElements(elements, limit = 12) {
    const result = [];

    for (const element of elements) {
      if (!isVisible(element)) continue;

      const text =
        getElementText(element) ||
        getAccessibleLabel(element) ||
        safeText(maskPII(element.getAttribute("value") || ""), 100);

      if (!text) continue;

      if (isNoiseText(text) && !textHasKeyword(text)) continue;

      if (textHasKeyword(text) || text.length <= 60) {
        uniquePush(result, text, limit);
      }

      if (result.length >= limit) break;
    }

    return result;
  }

  function getPageSnapshot() {
    return {
      title: safeText(maskPII(document.title), 120),
      path: window.location.pathname || "/",
      headings: collectTextFromElements(
        Array.from(document.querySelectorAll("h1, h2, h3, legend")),
        8
      ),
      buttons: collectTextFromElements(
        Array.from(document.querySelectorAll("button, input[type='button'], input[type='submit'], [role='button']")),
        12
      ),
      links: collectTextFromElements(
        Array.from(document.querySelectorAll("a")),
        12
      )
    };
  }

  function shouldKeepVisibleElement(element) {
    const text = [
      getElementText(element),
      getAccessibleLabel(element),
      element.getAttribute("placeholder") || "",
      element.getAttribute("name") || "",
      element.getAttribute("id") || "",
      element.getAttribute("type") || "",
      getSection(element)
    ].join(" ");

    if (!text.trim()) return false;
    if (isNoiseText(text) && !textHasKeyword(text)) return false;

    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role") || "";
    const type = element.getAttribute("type") || "";

    if (["input", "textarea", "select", "button"].includes(tag)) return true;
    if (["button", "link", "textbox", "checkbox", "radio"].includes(role)) return true;
    if (["submit", "button", "password", "email", "tel", "text"].includes(type)) return true;

    return textHasKeyword(text);
  }

  function getVisibleElements() {
    const selectors = [
      "button",
      "a",
      "input",
      "textarea",
      "select",
      "[role='button']",
      "[role='link']",
      "[role='textbox']",
      "[role='checkbox']",
      "[role='radio']"
    ];

    const elements = Array.from(document.querySelectorAll(selectors.join(",")));
    const result = [];
    const seen = new Set();

    for (const element of elements) {
      if (!isVisible(element)) continue;
      if (!shouldKeepVisibleElement(element)) continue;

      const item = {
        type:
          element.getAttribute("role") ||
          element.getAttribute("type") ||
          element.tagName.toLowerCase(),
        text: getElementText(element),
        label: getAccessibleLabel(element),
        placeholder: safeText(maskPII(element.getAttribute("placeholder") || ""), 100),
        selector: getSelector(element)
      };

      if (!item.text && !item.label && !item.placeholder) continue;

      const key = JSON.stringify(item).toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      result.push(item);

      if (result.length >= 50) break;
    }

    return result;
  }

  function getFieldMetadata() {
    const fields = Array.from(document.querySelectorAll("input, textarea, select"));
    const result = [];
    const seen = new Set();

    for (const field of fields) {
      if (!isVisible(field)) continue;

      const item = {
        field: getAccessibleLabel(field),
        tag: field.tagName.toLowerCase(),
        type: field.getAttribute("type") || field.tagName.toLowerCase(),
        required: Boolean(field.required || field.getAttribute("aria-required") === "true"),
        minLength: field.minLength > 0 ? field.minLength : null,
        maxLength: field.maxLength > 0 ? field.maxLength : null,
        min: field.getAttribute("min") || "",
        max: field.getAttribute("max") || "",
        pattern: field.getAttribute("pattern") || "",
        placeholder: safeText(maskPII(field.getAttribute("placeholder") || ""), 100),
        autocomplete: field.getAttribute("autocomplete") || "",
        disabled: Boolean(field.disabled),
        readonly: Boolean(field.readOnly),
        selector: getSelector(field)
      };

      const blob = JSON.stringify(item);
      if (!item.field && !item.placeholder && !textHasKeyword(blob)) continue;

      const key = `${item.field}|${item.type}|${item.selector}`.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      result.push(item);

      if (result.length >= 35) break;
    }

    return result;
  }

  function looksLikeRealValidationMessage(text) {
    if (!text) return false;

    const cleaned = safeText(maskPII(text), 180);
    const lower = cleaned.toLowerCase();

    if (cleaned.length < 8) return false;
    if (cleaned.length > 160) return false;

    const validationWords = [
      "required", "invalid", "incorrect", "error", "try again", "must",
      "at least", "minimum", "maximum", "not match", "expired", "enter",
      "missing", "please check", "please enter", "cannot", "failed"
    ];

    const hasValidationWord = validationWords.some((word) => lower.includes(word));
    if (!hasValidationWord) return false;

    const tooManyUiWords = [
      "conditions of use", "privacy notice", "help", "sign in with a passkey",
      "forgot password", "resend otp or", "copyright"
    ].some((word) => lower.includes(word));

    if (tooManyUiWords && cleaned.length > 80) return false;

    if (isNoiseText(cleaned) && !textHasKeyword(cleaned)) return false;

    return true;
  }

  function getValidationMessages() {
    const selectors = [
      "[role='alert']",
      "[aria-live]",
      ".error",
      ".errors",
      ".invalid",
      ".validation",
      ".warning",
      ".alert",
      ".a-alert-content",
      ".a-box-inner",
      ".a-form-error",
      ".a-alert-heading"
    ];

    const candidates = Array.from(document.querySelectorAll(selectors.join(",")));
    const result = [];
    const seen = new Set();

    for (const element of candidates) {
      if (!isVisible(element)) continue;

      const text = safeText(maskPII(element.innerText || element.textContent || ""), 180);
      if (!looksLikeRealValidationMessage(text)) continue;

      const key = text.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      result.push(text);

      if (result.length >= 10) break;
    }

    return result;
  }

  function getTimeMetrics() {
    const nav = performance.getEntriesByType("navigation")[0];

    if (!nav) {
      return {
        page: safeText(document.title, 100),
        path: window.location.pathname || "/",
        pageLoadTimeMs: null,
        domContentLoadedMs: null
      };
    }

    return {
      page: safeText(document.title, 100),
      path: window.location.pathname || "/",
      pageLoadTimeMs: Math.round(nav.loadEventEnd || nav.duration || 0),
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd || 0)
    };
  }

  function getCompactContext() {
    return {
      pageSnapshot: getPageSnapshot(),
      visibleElements: getVisibleElements(),
      fieldMetadata: getFieldMetadata(),
      validationMessages: getValidationMessages(),
      timeMetrics: getTimeMetrics()
    };
  }

  function sendEvent(eventType, target, data = {}, context = null) {
    if (!qaRecorderConfig.isRecording) return;

    const event = {
      eventId: generateId("event"),
      eventType,
      timestamp: new Date().toISOString(),
      page: getPageInfo(),
      target: target ? getTargetInfo(target) : null,
      data
    };

    if (context) {
      event.context = context;
    }

    try {
      chrome.runtime.sendMessage({ type: "LOG_EVENT", event }, () => {
        chrome.runtime.lastError;
      });
    } catch (error) {
      // The extension may have been reloaded while the page was open.
    }
  }

  function isTrustedQaMindOrigin(origin) {
    try {
      const url = new URL(origin);
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

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (!isTrustedQaMindOrigin(event.origin)) return;

    const message = event.data || {};
    if (message.type !== "QA_MIND_APP_CONTEXT") return;

    const payload = message.payload || {};
    const projects = Array.isArray(payload.projects)
      ? payload.projects
        .filter((project) => project && project.id && project.name)
        .map((project) => ({
          id: String(project.id),
          name: safeText(project.name, 160),
          status: safeText(project.status, 40),
          priority: safeText(project.priority, 40)
        }))
      : [];

    chrome.storage.local.set({
      qaMindAppConnection: {
        connected: true,
        syncedAt: new Date().toISOString(),
        origin: event.origin,
        userId: safeText(payload.userId, 120),
        userName: safeText(payload.userName, 160),
        userEmail: safeText(maskPII(payload.userEmail || ""), 180),
        workspaceId: safeText(payload.workspaceId, 120),
        workspaceName: safeText(payload.workspaceName, 160),
        projects
      }
    });
  });

  function logPageContext(action = "page_context") {
    const context = getCompactContext();
    const signature = JSON.stringify({
      path: window.location.pathname,
      title: document.title,
      headings: context.pageSnapshot.headings,
      fields: context.fieldMetadata.map((field) => field.field + field.type)
    });

    if (signature === lastPageContextSignature) return;
    lastPageContextSignature = signature;

    sendEvent("page_context", null, { action, url: window.location.href }, context);
  }

  function logValidationIfChanged(trigger = "validation_check") {
    const validationMessages = getValidationMessages();
    if (!validationMessages.length) return;

    const signature = validationMessages.join("|").toLowerCase();
    if (signature === lastValidationSignature) return;

    lastValidationSignature = signature;

    sendEvent("validation", null, { action: trigger }, {
      validationMessages,
      fieldMetadata: getFieldMetadata(),
      pageSnapshot: getPageSnapshot()
    });
  }

  function isRecordableElement(element) {
    if (!element) return false;

    return Boolean(
      element.closest(
        "button, a, input, textarea, select, [role='button'], [role='link'], [role='checkbox'], [role='radio'], [contenteditable='true']"
      )
    );
  }

  function getRecordableTarget(element) {
    if (!element) return null;

    return element.closest(
      "button, a, input, textarea, select, [role='button'], [role='link'], [role='checkbox'], [role='radio'], [contenteditable='true']"
    );
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = getRecordableTarget(event.target);
      if (!target) return;

      sendEvent("click", target, { action: "click" });

      setTimeout(() => {
        logValidationIfChanged("after_click");
      }, 500);
    },
    true
  );

  document.addEventListener(
    "change",
    (event) => {
      const target = event.target;
      if (!["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      sendEvent("input", target, {
        action: "change",
        value: maskValue(target),
        masked: true
      });

      setTimeout(() => {
        logValidationIfChanged("after_input");
      }, 500);
    },
    true
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter") return;

      const target = getRecordableTarget(event.target);
      if (!target) return;

      sendEvent("keyboard", target, {
        action: "press_key",
        key: "Enter"
      });

      setTimeout(() => {
        logValidationIfChanged("after_enter");
      }, 500);
    },
    true
  );

  window.addEventListener("error", (event) => {
    sendEvent("console_error", null, {
      message: safeText(maskPII(event.message), 250),
      source: safeText(event.filename, 180),
      line: event.lineno || null,
      column: event.colno || null
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    sendEvent("console_error", null, {
      message: safeText(maskPII(event.reason?.message || String(event.reason || "")), 250),
      type: "unhandledrejection"
    });
  });

  function logNavigation(action, extra = {}) {
    sendEvent("navigation", null, {
      action,
      url: window.location.href,
      ...extra
    });

    setTimeout(() => {
      logPageContext(action);
      logValidationIfChanged("after_navigation");
    }, 700);
  }

  logNavigation("page_load");

  function logUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl === lastUrl) return;

    const fromUrl = lastUrl;
    lastUrl = currentUrl;

    logNavigation("route_change", {
      fromUrl,
      toUrl: currentUrl
    });
  }

  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    setTimeout(logUrlChange, 0);
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    setTimeout(logUrlChange, 0);
  };

  window.addEventListener("popstate", () => {
    setTimeout(logUrlChange, 0);
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.type) return false;

    if (message.type === "QA_MIND_PING") {
      sendResponse({ success: true, loaded: true });
      return true;
    }

    if (message.type === "SET_QA_RECORDER_CONFIG") {
      qaRecorderConfig = {
        isRecording: Boolean(message.isRecording),
        keywords: Array.isArray(message.keywords) ? message.keywords : []
      };

      if (qaRecorderConfig.isRecording) {
        setTimeout(() => {
          logPageContext("config_received");
        }, 300);
      }

      sendResponse({ success: true });
      return true;
    }

    if (message.type === "CAPTURE_PAGE_CONTEXT") {
      if (qaRecorderConfig.isRecording) {
        logPageContext("manual_capture");
      }
      sendResponse({ success: true });
      return true;
    }

    if (message.type === "QA_MIND_REQUEST_APP_CONTEXT") {
      window.postMessage(
        {
          type: "QA_MIND_EXTENSION_REQUEST_CONTEXT"
        },
        window.location.origin
      );
      sendResponse({ success: true });
      return true;
    }

    if (message.type === "QA_MIND_RECORDING_READY") {
      window.postMessage(
        {
          type: "QA_MIND_EXTENSION_RECORDING_READY",
          payload: message.payload || {}
        },
        window.location.origin
      );
      sendResponse({ success: true });
      return true;
    }

    return false;
  });
}
