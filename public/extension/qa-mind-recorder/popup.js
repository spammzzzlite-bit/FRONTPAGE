const userGoalInput = document.getElementById("userGoalInput");
const projectSelect = document.getElementById("projectSelect");
const moduleInput = document.getElementById("moduleInput");
const debugDownloadInput = document.getElementById("debugDownloadInput");
const lightModeBtn = document.getElementById("lightModeBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const connectionHint = document.getElementById("connectionHint");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");

const statusText = document.getElementById("statusText");
const recordingDot = document.getElementById("recordingDot");
const recordingLabel = document.getElementById("recordingLabel");
const eventCount = document.getElementById("eventCount");

function setStatus(message) {
  statusText.textContent = message;
}

function setRecordingUi(isRecording, count = 0) {
  recordingDot.classList.toggle("on", isRecording);
  recordingDot.classList.toggle("off", !isRecording);

  recordingLabel.textContent = isRecording ? "Recording" : "Idle";
  eventCount.textContent = `${count} events`;

  startBtn.disabled = isRecording;
  stopBtn.disabled = !isRecording;
}

function applyTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";

  document.documentElement.dataset.theme = normalizedTheme;

  lightModeBtn.setAttribute("aria-pressed", String(normalizedTheme === "light"));
  darkModeBtn.setAttribute("aria-pressed", String(normalizedTheme === "dark"));
}

function saveTheme(theme) {
  applyTheme(theme);
  chrome.storage.local.set({ qaMindTheme: theme === "dark" ? "dark" : "light" });
}

function loadTheme() {
  chrome.storage.local.get(["qaMindTheme"], (result) => {
    applyTheme(result.qaMindTheme || "light");
  });
}

function getUserInputs() {
  const selectedOption = projectSelect.options[projectSelect.selectedIndex];

  return {
    userGoal: userGoalInput.value.trim(),
    projectId: projectSelect.value,
    project: selectedOption && selectedOption.dataset.projectName
      ? selectedOption.dataset.projectName
      : "",
    module: moduleInput.value.trim(),
    prdText: "",
    testPlanText: ""
  };
}

function saveFormValues() {
  chrome.storage.local.set({
    qaMindForm: {
      userGoal: userGoalInput.value,
      projectId: projectSelect.value,
      module: moduleInput.value,
      debugDownload: debugDownloadInput.checked
    }
  });
}

function loadFormValues() {
  chrome.storage.local.get(["qaMindForm"], (result) => {
    const form = result.qaMindForm || {};

    userGoalInput.value = form.userGoal || "";
    if (form.projectId) {
      projectSelect.value = form.projectId;
    }
    moduleInput.value = form.module || "";
    debugDownloadInput.checked = Boolean(form.debugDownload);
  });
}

function setProjectOptions(projects, selectedProjectId = "") {
  projectSelect.innerHTML = "";

  if (!Array.isArray(projects) || projects.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No synced projects";
    projectSelect.appendChild(option);
    projectSelect.disabled = true;
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select project";
  projectSelect.appendChild(placeholder);

  projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id || "";
    option.textContent = project.name || "Untitled project";
    option.dataset.projectName = project.name || "";
    projectSelect.appendChild(option);
  });

  projectSelect.disabled = false;
  projectSelect.value = selectedProjectId || "";
}

function formatSyncTime(isoString) {
  const parsed = Date.parse(isoString || "");
  if (!Number.isFinite(parsed)) return "";

  return new Date(parsed).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function loadAppConnection() {
  chrome.storage.local.get(["qaMindAppConnection", "qaMindForm"], (result) => {
    const connection = result.qaMindAppConnection || {};
    const form = result.qaMindForm || {};
    const projects = Array.isArray(connection.projects) ? connection.projects : [];

    setProjectOptions(projects, form.projectId || "");

    if (connection.connected && projects.length > 0) {
      const syncedAt = formatSyncTime(connection.syncedAt);
      connectionHint.textContent = `Connected to ${connection.userName || connection.userEmail || "QAMind AI"}${connection.workspaceName ? ` · ${connection.workspaceName}` : ""}${syncedAt ? ` · synced ${syncedAt}` : ""}.`;
    } else if (connection.connected) {
      connectionHint.textContent = "Connected to QAMind AI, but no projects were found for this workspace.";
    } else {
      connectionHint.textContent = "Open QAMind AI while signed in to sync your project list.";
    }
  });
}

function refreshAppConnection() {
  chrome.runtime.sendMessage({ type: "REFRESH_APP_CONNECTION" }, () => {
    chrome.runtime.lastError;
    setTimeout(loadAppConnection, 350);
  });
}

function getTimestampFilePart() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
}

function fallbackAnchorDownload(filename, jsonText) {
  const blob = new Blob([jsonText], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);
}

function downloadJson(filename, data) {
  return new Promise((resolve, reject) => {
    try {
      const jsonText = JSON.stringify(data, null, 2);

      if (!jsonText || jsonText === "undefined") {
        reject(new Error("JSON data was empty or undefined."));
        return;
      }

      const blob = new Blob([jsonText], {
        type: "application/json"
      });

      const url = URL.createObjectURL(blob);

      if (!chrome.downloads || !chrome.downloads.download) {
        fallbackAnchorDownload(filename, jsonText);
        resolve();
        return;
      }

      chrome.downloads.download(
        {
          url,
          filename,
          saveAs: false,
          conflictAction: "uniquify"
        },
        (downloadId) => {
          const chromeError = chrome.runtime.lastError;

          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 10000);

          if (chromeError) {
            console.warn("downloads API failed, using fallback:", chromeError.message);
            fallbackAnchorDownload(filename, jsonText);
            resolve();
            return;
          }

          if (!downloadId) {
            console.warn("Download ID missing, using fallback.");
            fallbackAnchorDownload(filename, jsonText);
            resolve();
            return;
          }

          resolve(downloadId);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

function publishRecordingToApp(rawRecording, aiReadyRecording) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: "PUBLISH_RECORDING_TO_APP",
        recording: {
          rawRecording,
          aiReadyRecording,
          browserInfo: {
            name: "Chrome",
            version: "",
            os: navigator.platform || ""
          }
        }
      },
      (response) => {
        const chromeError = chrome.runtime.lastError;
        if (chromeError) {
          resolve({ success: false, error: chromeError.message });
          return;
        }
        resolve(response || { success: false });
      }
    );
  });
}

function getActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    callback(tabs[0]);
  });
}

function refreshState() {
  chrome.storage.local.get(["isRecording", "events"], (result) => {
    const isRecording = Boolean(result.isRecording);
    const count = (result.events || []).length;

    setRecordingUi(isRecording, count);
    setStatus(isRecording ? "Recording current tab journey." : "Ready.");
  });
}

startBtn.addEventListener("click", () => {
  const userInputs = getUserInputs();

  if (!userInputs.projectId) {
    setStatus("Select a synced QAMind project before recording.");
    return;
  }

  saveFormValues();

  getActiveTab((tab) => {
    if (!tab || !tab.id) {
      setStatus("No active tab found.");
      return;
    }

    chrome.runtime.sendMessage(
      {
        type: "START_RECORDING",
        tabId: tab.id,
        tabUrl: tab.url || "",
        tabTitle: tab.title || "",
        ...userInputs
      },
      (response) => {
        const chromeError = chrome.runtime.lastError;

        if (chromeError) {
          setStatus("Start failed: " + chromeError.message);
          return;
        }

        if (!response || !response.success) {
          setStatus("Could not start recording.");
          return;
        }

        if (response.warning) {
          setStatus("Recording started, but tab hook warning: " + response.warning);
        } else {
          setStatus("Recording started.");
        }
        refreshState();

        setTimeout(() => {
          window.close();
        }, 150);
      }
    );
  });
});

stopBtn.addEventListener("click", () => {
  saveFormValues();

  stopBtn.disabled = true;
  setStatus("Stopping recording and preparing JSON...");

  chrome.runtime.sendMessage({ type: "STOP_RECORDING" }, async (response) => {
    const chromeError = chrome.runtime.lastError;

    if (chromeError) {
      setStatus("Stop failed: " + chromeError.message);
      refreshState();
      return;
    }

    if (!response || !response.success) {
      setStatus("Could not stop recording.");
      refreshState();
      return;
    }

    try {
      if (typeof buildAiReadyRecording !== "function") {
        throw new Error("buildAiReadyRecording() not found. Check that processor.js is loaded before popup.js.");
      }

      const rawRecording = {
        session: response.session || {},
        events: response.events || []
      };

      const aiReadyRecording = buildAiReadyRecording(rawRecording);

      if (!aiReadyRecording || !aiReadyRecording.qwenPayload) {
        throw new Error("AI-ready recording was not generated correctly.");
      }

      const timestamp = getTimestampFilePart();

      await downloadJson(
        `qa-mind-ai-ready-recording-${timestamp}.json`,
        aiReadyRecording
      );

      if (debugDownloadInput.checked) {
        if (typeof buildDebugRecording !== "function") {
          throw new Error("buildDebugRecording() not found. Check processor.js.");
        }

        const debugRecording = buildDebugRecording(rawRecording);

        await downloadJson(
          `qa-mind-full-debug-recording-${timestamp}.json`,
          debugRecording
        );
      }

      const publishResult = await publishRecordingToApp(rawRecording, aiReadyRecording);

      if (publishResult && publishResult.success) {
        setStatus("Downloaded JSON and sent recording to QAMind.");
      } else {
        setStatus("Downloaded JSON. Open QAMind AI to receive recordings in the app.");
      }
    } catch (error) {
      console.error("QA Mind stop/download error:", error);
      setStatus("Error: " + error.message);
    }

    refreshState();
  });
});

clearBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "CLEAR_RECORDING" }, (response) => {
    const chromeError = chrome.runtime.lastError;

    if (chromeError) {
      setStatus("Clear failed: " + chromeError.message);
      return;
    }

    if (!response || !response.success) {
      setStatus("Could not clear recording.");
      return;
    }

    setStatus("Recording cleared.");
    refreshState();
  });
});

[
  userGoalInput,
  projectSelect,
  moduleInput,
  debugDownloadInput
].forEach((element) => {
  element.addEventListener("change", saveFormValues);
  element.addEventListener("input", saveFormValues);
});

lightModeBtn.addEventListener("click", () => {
  saveTheme("light");
});

darkModeBtn.addEventListener("click", () => {
  saveTheme("dark");
});

loadTheme();
loadFormValues();
loadAppConnection();
refreshAppConnection();
refreshState();

setInterval(refreshState, 1000);
