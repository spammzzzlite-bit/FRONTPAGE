import { useEffect } from "react";
import { X, Download, Zap, Shield } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RecorderDownloadModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="rec-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Download QA Recorder"
    >
      <div className="rec-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="rec-modal-close" onClick={onClose} aria-label="Close">
          <X size={14} strokeWidth={2} />
        </button>

        {/* Animated record dot */}
        <div className="rec-modal-hero" aria-hidden="true">
          <div className="rec-modal-ring rec-modal-ring-3" />
          <div className="rec-modal-ring rec-modal-ring-2" />
          <div className="rec-modal-ring rec-modal-ring-1" />
          <div className="rec-modal-dot" />
        </div>

        <h2 className="rec-modal-title">Download QA Recorder</h2>
        <p className="rec-modal-sub">
          Record browser sessions. QAMind converts them to runnable Playwright tests.
          No selectors, no boilerplate.
        </p>

        <div className="rec-modal-bullets">
          <span className="rec-modal-bullet">
            <Zap size={11} strokeWidth={2} /> No code required
          </span>
          <span className="rec-modal-bullet">
            <Shield size={11} strokeWidth={2} /> Works with any web app
          </span>
        </div>

        <a
          href="/extension/qa-mind-recorder-extension-v2.1.3.zip"
          download
          className="rec-modal-btn-primary"
          onClick={onClose}
        >
          <Download size={15} strokeWidth={2} />
          Download for Chrome
        </a>
        <button className="rec-modal-btn-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
