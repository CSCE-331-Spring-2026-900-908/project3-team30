import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────
const MIN_SIZE = 8;
const MAX_SIZE = 24;
const DEFAULT_SIZE = 16;
const STEP = 2;

// ─── Styles ───────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  .a11y-toolbox * { box-sizing: border-box; margin: 0; padding: 0; }
  .a11y-toolbox { font-family: 'DM Sans', sans-serif; }

  .a11y-trigger {
    position: fixed; bottom: 28px; left: 28px;
    width: 60px; height: 60px; border-radius: 50%;
    background: #1a1f5e; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(26,31,94,0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    z-index: 9999;
  }
  .a11y-trigger:hover { transform: scale(1.07); box-shadow: 0 6px 28px rgba(26,31,94,0.45); }
  .a11y-trigger svg { width: 28px; height: 28px; fill: white; }

  .a11y-panel {
    position: fixed; bottom: 100px; left: 28px;
    background: #ffffff; border-radius: 20px;
    box-shadow: 0 16px 60px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06);
    width: 400px; overflow: hidden; z-index: 9998;
    animation: a11ySlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes a11ySlideUp {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .a11y-header {
    background: #1a1f5e; padding: 22px 24px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .a11y-header-left { display: flex; align-items: center; gap: 12px; }
  .a11y-header-left svg { width: 26px; height: 26px; fill: white; opacity: 0.9; }
  .a11y-header-title { color: white; font-size: 17px; font-weight: 600; letter-spacing: -0.3px; }
  .a11y-header-sub { color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 2px; }

  .a11y-close {
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px; width: 32px; height: 32px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 16px; transition: background 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .a11y-close:hover { background: rgba(255,255,255,0.22); }

  .a11y-body { padding: 20px 20px 8px; display: flex; flex-direction: column; gap: 10px; }

  /* ── Section card ── */
  .a11y-section {
    background: #f7f8fc; border: 1.5px solid #e8eaf2;
    border-radius: 14px; padding: 18px;
    display: flex; flex-direction: column; gap: 14px;
  }

  .a11y-section-header {
    display: flex; align-items: center; justify-content: space-between;
  }
  .a11y-section-left { display: flex; align-items: center; gap: 10px; }
  .a11y-section-icon {
    width: 36px; height: 36px; background: #e8eaf2;
    border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .a11y-section-icon svg { width: 18px; height: 18px; fill: #1a1f5e; }
  .a11y-section-title { font-size: 14px; font-weight: 600; color: #1a1f5e; }

  .a11y-toggle-section {
    width: 100%;
    cursor: pointer;
    text-align: left;
  }

  .a11y-toggle-section:hover {
    border-color: #4a52c8;
    background: #2b3b8b;
  }

  /* ── Text size controls ── */
  .a11y-size-controls { display: flex; align-items: center; gap: 10px; }
  .a11y-size-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: white; border: 1.5px solid #e8eaf2;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-weight: 600; color: #1a1f5e; font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.15s, background 0.15s;
    flex-shrink: 0;
  }
  .a11y-size-btn:hover:not(:disabled) { border-color: #4a52c8; background: #eef0fa; }
  .a11y-size-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .a11y-range-wrap { flex: 1; }
  .a11y-range {
    -webkit-appearance: none; width: 100%; height: 5px;
    border-radius: 4px; background: #d4d7eb; outline: none; cursor: pointer;
  }
  .a11y-range::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px;
    border-radius: 50%; background: #1a1f5e;
    box-shadow: 0 2px 6px rgba(26,31,94,0.3); cursor: pointer;
    transition: transform 0.1s;
  }
  .a11y-range::-webkit-slider-thumb:hover { transform: scale(1.15); }

  .a11y-size-meta {
    display: flex; align-items: center; justify-content: space-between;
  }
  .a11y-size-value {
    font-size: 12px; font-weight: 500; color: #6b7280;
    font-variant-numeric: tabular-nums;
  }
  .a11y-reset-link {
    font-size: 11px; font-weight: 500; color: #4a52c8;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; padding: 0; opacity: 0.8;
  }
  .a11y-reset-link:hover { opacity: 1; text-decoration: underline; }

  /* ── Coming soon badge ── */
  .a11y-coming-soon {
    font-size: 11px; font-weight: 600; color: #9ca3af;
    background: #f3f4f6; border: 1px solid #e5e7eb;
    border-radius: 6px; padding: 3px 8px; letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* ── Footer ── */
  .a11y-footer {
    border-top: 1px solid #eef0f5; padding: 13px 20px;
    display: flex; justify-content: center; gap: 24px;
  }
  .a11y-footer-link {
    font-size: 13px; font-weight: 500; color: #4a52c8;
    cursor: pointer; background: none; border: none;
    font-family: 'DM Sans', sans-serif; padding: 0;
  }
  .a11y-footer-link:hover { text-decoration: underline; }
  .a11y-footer-sep { color: #ccc; font-size: 13px; }
`;

export default function AccessibilityToolbox() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('a11y-font-size');
    return saved ? Number(saved) : DEFAULT_SIZE;
  });
  const toolboxRef = useRef(null);
  const location = useLocation();
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('a11y-high-contrast') === 'true';
  });


  if (location.pathname.startsWith('/menu-board')) return null;

  const percent = Math.round((fontSize / DEFAULT_SIZE) * 100);

  // Apply font size to <html> so all rem units scale
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('a11y-font-size', fontSize);
  }, [fontSize]);

  // Apply high contrast class
  useEffect(() => {
    document.body.classList.toggle('accessibility-high-contrast', highContrast);
    localStorage.setItem('a11y-high-contrast', highContrast);
  }, [highContrast]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolboxRef.current && !toolboxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="a11y-toolbox" ref={toolboxRef}>
      <style>{styles}</style>

      {/* Floating trigger button */}
      <button
        className="a11y-trigger"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
        aria-label="Accessibility options"
        title="Accessibility options"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm8 7h-5v13h-2v-6h-2v6H9V9H4V7h16v2z" />
        </svg>
      </button>

      {/* Expanding panel */}
      {open && (
        <div className="a11y-panel">

          {/* Header */}
          <div className="a11y-header">
            <div className="a11y-header-left">
              <svg viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm8 7h-5v13h-2v-6h-2v6H9V9H4V7h16v2z" />
              </svg>
              <div>
                <div className="a11y-header-title">Accessibility</div>
                <div className="a11y-header-sub">Customize your experience</div>
              </div>
            </div>
            <button className="a11y-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Body */}
          <div className="a11y-body">

            {/* ── Text Size (implemented) ── */}
            <div className="a11y-section">
              <div className="a11y-section-header">
                <div className="a11y-section-left">
                  <div className="a11y-section-icon">
                    <svg viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" /></svg>
                  </div>
                  <span className="a11y-section-title">Text Size</span>
                </div>
              </div>
              <div className="a11y-size-controls">
                <button
                  className="a11y-size-btn"
                  onClick={() => setFontSize((p) => Math.max(p - STEP, MIN_SIZE))}
                  disabled={fontSize <= MIN_SIZE}
                  aria-label="Decrease text size"
                >
                  A-
                </button>
                <div className="a11y-range-wrap">
                  <input
                    type="range"
                    className="a11y-range"
                    min={MIN_SIZE}
                    max={MAX_SIZE}
                    step={STEP}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    aria-label="Text size"
                  />
                </div>
                <button
                  className="a11y-size-btn"
                  onClick={() => setFontSize((p) => Math.min(p + STEP, MAX_SIZE))}
                  disabled={fontSize >= MAX_SIZE}
                  aria-label="Increase text size"
                >
                  A+
                </button>
              </div>
              <div className="a11y-size-meta">
                <span className="a11y-size-value">{percent}%</span>
                {fontSize !== DEFAULT_SIZE && (
                  <button className="a11y-reset-link" onClick={() => setFontSize(DEFAULT_SIZE)}>
                    Reset to default
                  </button>
                )}
              </div>
            </div>

            {/* ── Screen Reader (coming soon) ── */}
            <div className="a11y-section">
              <div className="a11y-section-header">
                <div className="a11y-section-left">
                  <div className="a11y-section-icon">
                    <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                  </div>
                  <span className="a11y-section-title">Screen Reader</span>
                </div>
              </div>
            </div>

            {/* ── Color Contrast (coming soon) ── */}
            <button
              type="button"
              className={`a11y-section a11y-clickable-section ${highContrast ? 'a11y-contrast-active' : ''}`}
              onClick={() => setHighContrast((prev) => !prev)}
            >
              <div className="a11y-section-header">
                <div className="a11y-section-left">
                  <div className="a11y-section-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                  </div>
                  <span className="a11y-section-title">Color Contrast</span>
                </div>
              </div>
            </button>

          </div>{/* end body */}


        </div>
      )}
    </div>
  );
}