:root {
    --deep: #0b3d5c;
    --navy: #0a2a43;
    --teal: #1f7a6c;
    --aqua: #4fd1c5;
    --sky: #a8dadc;
    --white: #fafcfc;
    --mist: #e8f1f2;

    --bg: linear-gradient(160deg, #f3f9fa 0%, #eaf3f4 40%, #e3eef0 100%);
    --surface: #ffffff;
    --surface-2: #f4f9fa;
    --text: #0a2a43;
    --text-dim: #4b6579;
    --border: rgba(10, 42, 67, 0.09);
    --shadow: 0 8px 28px rgba(11, 61, 92, 0.08);
    --accent: var(--teal);
    --accent-2: var(--aqua);
    --danger: #c0574a;
    --priority-low: #4fa3d1;
    --priority-med: #d1a24f;
    --priority-high: #c0574a;
    --radius: 18px;
    --radius-sm: 12px;
  }

  [data-theme="dark"] {
    --bg: linear-gradient(160deg, #071a2a 0%, #0a2338 45%, #0c2b40 100%);
    --surface: #0f2c42;
    --surface-2: #0b2437;
    --text: #eaf3f4;
    --text-dim: #9fb8c6;
    --border: rgba(168, 218, 220, 0.12);
    --shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    --accent: #56c2b0;
    --accent-2: #6fe0d1;
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    transition: background 0.4s ease, color 0.4s ease;
  }
  h1, h2, h3, .display { font-family: 'Manrope', sans-serif; }
  button { font-family: inherit; cursor: pointer; }
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 6px;
  }
  ::selection { background: var(--accent-2); color: var(--navy); }

  /* Layout */
  .app { display: flex; min-height: 100vh; }

  .sidebar {
    width: 236px;
    flex-shrink: 0;
    padding: 28px 18px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
  }
  .logo {
    font-family: 'Manrope', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 28px;
    color: var(--navy);
  }
  [data-theme="dark"] .logo { color: var(--white); }
  .nav { display: flex; flex-direction: column; gap: 4px; }
  .nav-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    color: var(--text-dim);
    font-size: 0.95rem;
    font-weight: 600;
    text-align: left;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .nav-btn:hover { background: var(--surface-2); color: var(--text); }
  .nav-btn.active {
    background: var(--accent);
    color: #fff;
  }
  .nav-btn svg { flex-shrink: 0; }
  .sidebar-footer {
    margin-top: auto;
    font-size: 0.8rem;
    color: var(--text-dim);
    padding: 12px 14px 4px;
    font-style: italic;
    border-top: 1px solid var(--border);
    padding-top: 18px;
  }

  .main {
    flex: 1;
    padding: 34px 40px 100px;
    max-width: 980px;
  }
  .view { display: none; }
  .view.active { display: block; animation: fadeIn 0.35s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  .greeting h1 { font-size: 1.7rem; margin: 0 0 4px; }
  .greeting p { margin: 0; color: var(--text-dim); font-size: 0.98rem; }

  /* Timer */
  .timer-card {
    margin-top: 26px;
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    padding: 36px 24px 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .mode-tabs {
    display: flex;
    gap: 6px;
    background: var(--surface-2);
    padding: 5px;
    border-radius: 999px;
    margin-bottom: 26px;
  }
  .mode-tab {
    border: none;
    background: transparent;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-dim);
  }
  .mode-tab.active { background: var(--accent); color: #fff; }

  .ring-wrap { position: relative; width: 260px; height: 260px; }
  .ring-wrap svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: var(--surface-2); stroke-width: 10; }
  .ring-progress {
    fill: none;
    stroke: url(#tideGradient);
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s linear;
  }
  .ring-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .time-display { font-size: 2.9rem; font-weight: 800; font-family: 'Manrope', sans-serif; letter-spacing: -1px; }
  .time-label { font-size: 0.85rem; color: var(--text-dim); font-weight: 600; margin-top: 4px; }
  .current-task-tag {
    margin-top: 6px;
    font-size: 0.78rem;
    color: var(--accent);
    font-weight: 600;
    max-width: 190px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .timer-controls { display: flex; gap: 12px; margin-top: 28px; }
  .btn {
    border: none;
    border-radius: var(--radius-sm);
    padding: 12px 22px;
    font-weight: 700;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
  }
  .btn:active { transform: scale(0.96); }
  .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 6px 16px rgba(31,122,108,0.28); }
  .btn-primary:hover { background: var(--teal); box-shadow: 0 8px 20px rgba(31,122,108,0.35); }
  .btn-ghost { background: var(--surface-2); color: var(--text); }
  .btn-ghost:hover { background: var(--mist); }
  [data-theme="dark"] .btn-ghost:hover { background: #123249; }
  .btn-danger { background: transparent; color: var(--danger); border: 1px solid rgba(192,87,74,0.3); }
  .btn-danger:hover { background: rgba(192,87,74,0.08); }
  .btn-sm { padding: 8px 14px; font-size: 0.8rem; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .auto-start-row {
    margin-top: 18px;
    font-size: 0.8rem;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Sections */
  .section { margin-top: 40px; }
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .section-head h2 { font-size: 1.15rem; margin: 0; }

  /* Stats */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 18px;
    box-shadow: var(--shadow);
  }
  .stat-value { font-size: 1.5rem; font-weight: 800; font-family: 'Manrope', sans-serif; }
  .stat-label { font-size: 0.78rem; color: var(--text-dim); margin-top: 2px; font-weight: 600; }

  /* Task list */
  .task-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    margin-bottom: 10px;
    box-shadow: var(--shadow);
    transition: opacity 0.3s ease, transform 0.2s ease;
  }
  .task-card.completed { opacity: 0.55; }
  .checkbox {
    appearance: none;
    width: 21px; height: 21px;
    border-radius: 7px;
    border: 2px solid var(--accent);
    flex-shrink: 0;
    margin-top: 2px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.2s ease;
  }
  .checkbox:checked { background: var(--accent); }
  .checkbox:checked::after {
    content: "";
    width: 6px; height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) translate(-1px,-1px);
  }
  .task-body { flex: 1; min-width: 0; }
  .task-title { font-weight: 600; font-size: 0.95rem; }
  .task-card.completed .task-title { text-decoration: line-through; }
  .task-meta { display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
  .badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .badge-low { background: rgba(79,163,209,0.15); color: var(--priority-low); }
  .badge-medium { background: rgba(209,162,79,0.18); color: var(--priority-med); }
  .badge-high { background: rgba(192,87,74,0.15); color: var(--priority-high); }
  .pomo-count { font-size: 0.78rem; color: var(--text-dim); display: flex; align-items: center; gap: 4px; }
  .task-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
  .icon-btn {
    border: none; background: transparent; color: var(--text-dim);
    width: 32px; height: 32px; border-radius: 8px;
    display: grid; place-items: center;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .icon-btn:hover { background: var(--surface-2); color: var(--text); }
  .icon-btn.danger:hover { color: var(--danger); }

  .empty-state {
    text-align: center;
    padding: 44px 20px;
    color: var(--text-dim);
    background: var(--surface);
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
  }
  .empty-state .emoji { font-size: 1.8rem; margin-bottom: 8px; }
  .empty-state .sub { font-size: 0.83rem; margin-top: 4px; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(7,26,42,0.45);
    backdrop-filter: blur(3px);
    display: none;
    align-items: center; justify-content: center;
    z-index: 100;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .modal-overlay.open { display: flex; }
  .modal {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 26px;
    width: 100%; max-width: 440px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    max-height: 85vh;
    overflow-y: auto;
  }
  .modal h3 { margin: 0 0 18px; font-size: 1.1rem; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 6px; color: var(--text-dim); }
  .field input[type="text"], .field textarea, .field select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface-2);
    color: var(--text);
    font-family: inherit;
    font-size: 0.9rem;
  }
  .field textarea { resize: vertical; min-height: 60px; }
  .pill-group { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill-option {
    border: 1px solid var(--border);
    background: var(--surface-2);
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-dim);
  }
  .pill-option.selected { background: var(--accent); color: #fff; border-color: var(--accent); }
  .error-text { color: var(--danger); font-size: 0.78rem; margin-top: 6px; display: none; }
  .modal-actions { display: flex; gap: 10px; margin-top: 22px; }
  .modal-actions .btn { flex: 1; justify-content: center; }

  /* Comments */
  .comment-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; max-height: 240px; overflow-y: auto; }
  .comment-item { background: var(--surface-2); border-radius: 10px; padding: 10px 12px; }
  .comment-text { font-size: 0.87rem; }
  .comment-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
  .comment-time { font-size: 0.72rem; color: var(--text-dim); }
  .comment-input-row { display: flex; gap: 8px; }
  .comment-input-row input { flex: 1; }

  /* Focus mode */
  .focus-overlay {
    position: fixed; inset: 0;
    background: var(--bg);
    z-index: 200;
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .focus-overlay.open { display: flex; }
  .focus-label { font-size: 0.85rem; font-weight: 700; color: var(--accent); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .focus-task { font-size: 1.4rem; font-weight: 700; margin-bottom: 30px; text-align: center; max-width: 500px; }

  /* Settings */
  .settings-group { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); box-shadow: var(--shadow); padding: 20px; margin-bottom: 16px; }
  .settings-group h3 { margin: 0 0 16px; font-size: 0.95rem; }
  .setting-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); gap: 16px; }
  .setting-row:last-child { border-bottom: none; }
  .setting-row label { font-size: 0.88rem; font-weight: 500; }
  .setting-row input[type="number"] {
    width: 70px; padding: 8px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--surface-2); color: var(--text); text-align: center;
  }
  .switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; inset: 0; background: var(--border); border-radius: 999px; transition: 0.2s; cursor: pointer; }
  .slider::before { content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: 0.2s; }
  .switch input:checked + .slider { background: var(--accent); }
  .switch input:checked + .slider::before { transform: translateX(20px); }
  .theme-options { display: flex; gap: 10px; }
  .theme-opt {
    flex: 1; border: 2px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;
    font-size: 0.82rem; font-weight: 600; background: var(--surface-2); color: var(--text-dim);
  }
  .theme-opt.selected { border-color: var(--accent); color: var(--accent); background: rgba(31,122,108,0.08); }

  /* Toast */
  .toast {
    position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: var(--navy); color: #fff; padding: 12px 20px; border-radius: 12px;
    font-size: 0.85rem; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    opacity: 0; pointer-events: none; transition: all 0.3s ease; z-index: 300;
    display: flex; align-items: center; gap: 8px;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* Mobile nav */
  .mobile-nav { display: none; }

  @media (max-width: 860px) {
    .sidebar { display: none; }
    .main { padding: 20px 16px 90px; max-width: 100%; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .ring-wrap { width: 220px; height: 220px; }
    .mobile-nav {
      display: flex;
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
      justify-content: space-around;
      z-index: 50;
    }
    .mobile-nav button {
      background: none; border: none; color: var(--text-dim);
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      font-size: 0.65rem; font-weight: 600; padding: 6px 10px; border-radius: 10px;
    }
    .mobile-nav button.active { color: var(--accent); }
  }
  @media (max-width: 480px) {
    .timer-controls { flex-wrap: wrap; justify-content: center; }
    .greeting h1 { font-size: 1.4rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  .visually-hidden {
    position: absolute; width: 1px; height: 1px; overflow: hidden;
    clip: rect(0,0,0,0); white-space: nowrap;
  }
