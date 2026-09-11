(function () {
  'use strict';

  /* ---------- Storage utilities ---------- */
  const STORAGE_KEY = 'oceanFocus.state.v1';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.warn('Could not read saved data', e); }
    return null;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { console.warn('Could not save data', e); }
  }

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const defaultState = {
    tasks: [],          // {id, title, description, priority, pomodoros, comments:[], completedAt:null, createdAt}
    settings: {
      focusDur: 25, shortDur: 5, longDur: 15,
      autoStart: false, sound: true, theme: 'light'
    },
    stats: {
      date: todayStr(),
      focusSeconds: 0,
      sessions: 0,
      tasksCompletedToday: 0,
      streak: 0,
      lastActiveDate: null
    }
  };

  let state = loadState() || JSON.parse(JSON.stringify(defaultState));
  // merge in any missing default keys (future-proofing)
  state.settings = Object.assign({}, defaultState.settings, state.settings);
  state.stats = Object.assign({}, defaultState.stats, state.stats);

  // Roll over stats if it's a new day
  (function rollStatsIfNewDay() {
    const today = todayStr();
    if (state.stats.date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (state.stats.lastActiveDate === yesterday && state.stats.sessions > 0) {
        state.stats.streak = (state.stats.streak || 0) + 1;
      } else if (state.stats.lastActiveDate !== today) {
        state.stats.streak = state.stats.sessions > 0 ? 1 : 0;
      }
      state.stats.date = today;
      state.stats.focusSeconds = 0;
      state.stats.sessions = 0;
      state.stats.tasksCompletedToday = 0;
    }
  })();

  /* ---------- DOM refs ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    navBtns: $$('.nav-btn'),
    mobileBtns: $$('.mobile-nav button'),
    views: $$('.view'),
    greetingText: $('#greetingText'),
    modeTabs: $$('.mode-tab'),
    ring: $('#ringProgress'),
    timeDisplay: $('#timeDisplay'),
    timeLabel: $('#timeLabel'),
    currentTaskTag: $('#currentTaskTag'),
    startPauseBtn: $('#startPauseBtn'),
    resetBtn: $('#resetBtn'),
    focusModeBtn: $('#focusModeBtn'),
    statFocusTime: $('#statFocusTime'),
    statSessions: $('#statSessions'),
    statTasksDone: $('#statTasksDone'),
    statStreak: $('#statStreak'),
    focusTaskList: $('#focusTaskList'),
    tasksViewList: $('#tasksViewList'),
    completedViewList: $('#completedViewList'),
    addTaskBtnFocus: $('#addTaskBtnFocus'),
    addTaskBtnTasks: $('#addTaskBtnTasks'),
    taskModalOverlay: $('#taskModalOverlay'),
    taskTitleInput: $('#taskTitleInput'),
    taskDescInput: $('#taskDescInput'),
    taskTitleError: $('#taskTitleError'),
    priorityGroup: $('#priorityGroup'),
    pomoGroup: $('#pomoGroup'),
    cancelTaskBtn: $('#cancelTaskBtn'),
    createTaskBtn: $('#createTaskBtn'),
    commentModalOverlay: $('#commentModalOverlay'),
    commentTaskName: $('#commentTaskName'),
    commentList: $('#commentList'),
    commentInput: $('#commentInput'),
    addCommentBtn: $('#addCommentBtn'),
    closeCommentBtn: $('#closeCommentBtn'),
    confirmModalOverlay: $('#confirmModalOverlay'),
    confirmTitle: $('#confirmTitle'),
    confirmMessage: $('#confirmMessage'),
    confirmCancelBtn: $('#confirmCancelBtn'),
    confirmOkBtn: $('#confirmOkBtn'),
    focusOverlay: $('#focusOverlay'),
    focusOverlayTask: $('#focusOverlayTask'),
    focusRing: $('#focusRingProgress'),
    focusTimeDisplay: $('#focusTimeDisplay'),
    focusTimeLabel: $('#focusTimeLabel'),
    focusStartPauseBtn: $('#focusStartPauseBtn'),
    focusExitBtn: $('#focusExitBtn'),
    setFocusDur: $('#setFocusDur'),
    setShortDur: $('#setShortDur'),
    setLongDur: $('#setLongDur'),
    setAutoStart: $('#setAutoStart'),
    setSound: $('#setSound'),
    themeOpts: $$('.theme-opt'),
    resetStatsBtn: $('#resetStatsBtn'),
    clearCompletedBtn: $('#clearCompletedBtn'),
    toast: $('#toast'),
  };

  const RING_CIRC = 2 * Math.PI * 115;
  els.ring.style.strokeDasharray = RING_CIRC;
  els.focusRing.style.strokeDasharray = RING_CIRC;

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2400);
  }

  /* ---------- Confirm dialog ---------- */
  let confirmCallback = null;
  function askConfirm(title, message, onConfirm) {
    els.confirmTitle.textContent = title;
    els.confirmMessage.textContent = message;
    confirmCallback = onConfirm;
    els.confirmModalOverlay.classList.add('open');
  }
  els.confirmCancelBtn.addEventListener('click', () => els.confirmModalOverlay.classList.remove('open'));
  els.confirmOkBtn.addEventListener('click', () => {
    els.confirmModalOverlay.classList.remove('open');
    if (confirmCallback) confirmCallback();
  });

  /* ---------- Theme ---------- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    els.themeOpts.forEach(b => b.classList.toggle('selected', b.dataset.themeChoice === state.settings.theme));
  }
  els.themeOpts.forEach(btn => {
    btn.addEventListener('click', () => {
      state.settings.theme = btn.dataset.themeChoice;
      applyTheme();
      saveState();
    });
  });

  /* ---------- Navigation ---------- */
  function setView(name) {
    els.views.forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    els.navBtns.forEach(b => b.classList.toggle('active', b.dataset.view === name));
    els.mobileBtns.forEach(b => b.classList.toggle('active', b.dataset.view === name));
    if (name === 'tasks' || name === 'completed') renderTasks();
  }
  [...els.navBtns, ...els.mobileBtns].forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  function setGreeting() {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    els.greetingText.textContent = g + ' 🌊';
  }
  setGreeting();

  /* ---------- Timer ---------- */
  const MODES = {
    focus: { key: 'focusDur', label: 'Focus Session' },
    short: { key: 'shortDur', label: 'Short Break' },
    long: { key: 'longDur', label: 'Long Break' }
  };
  let timer = {
    mode: 'focus',
    totalSeconds: state.settings.focusDur * 60,
    remaining: state.settings.focusDur * 60,
    running: false,
    intervalId: null,
    activeTaskId: null
  };

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return m + ':' + s;
  }

  function updateRingDisplay() {
    const pct = timer.totalSeconds > 0 ? (timer.totalSeconds - timer.remaining) / timer.totalSeconds : 0;
    const offset = RING_CIRC * (1 - pct);
    els.ring.style.strokeDashoffset = offset;
    els.focusRing.style.strokeDashoffset = offset;
    const txt = formatTime(timer.remaining);
    els.timeDisplay.textContent = txt;
    els.focusTimeDisplay.textContent = txt;
    els.timeLabel.textContent = MODES[timer.mode].label;
    els.focusTimeLabel.textContent = MODES[timer.mode].label;

    const task = state.tasks.find(t => t.id === timer.activeTaskId);
    els.currentTaskTag.textContent = task ? '→ ' + task.title : '';
    els.focusOverlayTask.textContent = task ? task.title : 'Pick a task to focus on';
  }

  function setMode(mode, resetTime = true) {
    timer.mode = mode;
    els.modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    if (resetTime) {
      timer.totalSeconds = state.settings[MODES[mode].key] * 60;
      timer.remaining = timer.totalSeconds;
    }
    updateRingDisplay();
  }

  els.modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      pauseTimer();
      setMode(tab.dataset.mode);
    });
  });

  function tick() {
    timer.remaining--;
    if (timer.remaining <= 0) {
      completeSession();
      return;
    }
    updateRingDisplay();
  }

  function startTimer() {
    if (timer.running) return;
    timer.running = true;
    setButtonsState();
    timer.intervalId = setInterval(tick, 1000);
  }

  function pauseTimer() {
    timer.running = false;
    clearInterval(timer.intervalId);
    setButtonsState();
  }

  function resetTimer() {
    pauseTimer();
    timer.totalSeconds = state.settings[MODES[timer.mode].key] * 60;
    timer.remaining = timer.totalSeconds;
    updateRingDisplay();
  }

  function setButtonsState() {
    const label = timer.running ? 'Pause' : 'Start';
    const icon = timer.running
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
    els.startPauseBtn.innerHTML = icon + label;
    els.focusStartPauseBtn.textContent = label;
  }

  function playChime() {
    if (!state.settings.sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 660;
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      o.start();
      o.stop(ctx.currentTime + 0.9);
    } catch (e) { /* audio not available */ }
  }

  function completeSession() {
    pauseTimer();
    timer.remaining = 0;
    updateRingDisplay();
    playChime();

    if (timer.mode === 'focus') {
      state.stats.focusSeconds += timer.totalSeconds;
      state.stats.sessions += 1;
      state.stats.lastActiveDate = todayStr();
      showToast('Focus session complete 🌊');
    } else {
      showToast('Break complete — ready to focus?');
    }
    saveState();
    renderStats();

    const nextMode = timer.mode === 'focus' ? 'short' : 'focus';
    setMode(nextMode);

    if (state.settings.autoStart) {
      setTimeout(() => startTimer(), 600);
    }
  }

  els.startPauseBtn.addEventListener('click', () => timer.running ? pauseTimer() : startTimer());
  els.focusStartPauseBtn.addEventListener('click', () => timer.running ? pauseTimer() : startTimer());
  els.resetBtn.addEventListener('click', resetTimer);

  /* ---------- Focus mode overlay ---------- */
  els.focusModeBtn.addEventListener('click', () => els.focusOverlay.classList.add('open'));
  els.focusExitBtn.addEventListener('click', () => els.focusOverlay.classList.remove('open'));

  /* ---------- Tasks ---------- */
  function uid() { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  let editingModalMode = 'create';
  function openTaskModal() {
    els.taskTitleInput.value = '';
    els.taskDescInput.value = '';
    els.taskTitleError.style.display = 'none';
    setPillSelection(els.priorityGroup, 'Medium');
    setPillSelection(els.pomoGroup, '2');
    els.taskModalOverlay.classList.add('open');
    setTimeout(() => els.taskTitleInput.focus(), 50);
  }
  function closeTaskModal() { els.taskModalOverlay.classList.remove('open'); }

  els.addTaskBtnFocus.addEventListener('click', openTaskModal);
  els.addTaskBtnTasks.addEventListener('click', openTaskModal);
  els.cancelTaskBtn.addEventListener('click', closeTaskModal);
  els.taskModalOverlay.addEventListener('click', (e) => { if (e.target === els.taskModalOverlay) closeTaskModal(); });

  function setPillSelection(group, value) {
    Array.from(group.children).forEach(btn => btn.classList.toggle('selected', btn.dataset.value === value));
  }
  [els.priorityGroup, els.pomoGroup].forEach(group => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-option');
      if (!btn) return;
      setPillSelection(group, btn.dataset.value);
    });
  });

  els.createTaskBtn.addEventListener('click', () => {
    const title = els.taskTitleInput.value.trim();
    if (!title) {
      els.taskTitleError.style.display = 'block';
      els.taskTitleInput.focus();
      return;
    }
    const priority = els.priorityGroup.querySelector('.selected').dataset.value;
    const pomodoros = els.pomoGroup.querySelector('.selected').dataset.value;
    state.tasks.push({
      id: uid(),
      title,
      description: els.taskDescInput.value.trim(),
      priority,
      pomodoros: pomodoros === '5' ? '5+' : pomodoros,
      comments: [],
      completedAt: null,
      createdAt: Date.now()
    });
    saveState();
    closeTaskModal();
    renderTasks();
    showToast('Task added');
  });

  function toggleTaskComplete(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    if (task.completedAt) {
      task.completedAt = null;
    } else {
      task.completedAt = Date.now();
      state.stats.tasksCompletedToday += 1;
    }
    saveState();
    renderTasks();
    renderStats();
  }

  function deleteTask(id) {
    askConfirm('Delete task?', 'This will permanently remove the task and its comments.', () => {
      state.tasks = state.tasks.filter(t => t.id !== id);
      if (timer.activeTaskId === id) timer.activeTaskId = null;
      saveState();
      renderTasks();
      showToast('Task deleted');
    });
  }

  function priorityBadgeClass(p) {
    return p === 'High' ? 'badge-high' : p === 'Low' ? 'badge-low' : 'badge-medium';
  }

  function taskCardHTML(task) {
    const done = !!task.completedAt;
    return `
      <div class="task-card ${done ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="checkbox" ${done ? 'checked' : ''} aria-label="Mark '${escapeHtml(task.title)}' ${done ? 'incomplete' : 'complete'}">
        <div class="task-body">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="badge ${priorityBadgeClass(task.priority)}">${task.priority}</span>
            <span class="pomo-count">🍅 ${task.pomodoros}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-btn set-active-btn" title="Focus this task" aria-label="Set as active timer task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <button class="icon-btn comment-btn" title="Comments" aria-label="Open comments">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            ${task.comments.length ? `<span style="font-size:0.65rem">${task.comments.length}</span>` : ''}
          </button>
          <button class="icon-btn danger delete-btn" title="Delete" aria-label="Delete task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>`;
  }

  function completedCardHTML(task) {
    return `
      <div class="task-card completed" data-id="${task.id}">
        <div class="task-body">
          <div class="task-title" style="text-decoration:line-through">${escapeHtml(task.title)}</div>
          <div class="task-meta"><span class="pomo-count">Completed ${new Date(task.completedAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span></div>
        </div>
        <div class="task-actions">
          <button class="icon-btn restore-btn" title="Restore" aria-label="Restore task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          <button class="icon-btn danger delete-btn" title="Delete" aria-label="Delete task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>`;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function wireTaskCardEvents(container) {
    container.querySelectorAll('.task-card').forEach(card => {
      const id = card.dataset.id;
      const checkbox = card.querySelector('.checkbox');
      if (checkbox) checkbox.addEventListener('change', () => toggleTaskComplete(id));

      const activeBtn = card.querySelector('.set-active-btn');
      if (activeBtn) activeBtn.addEventListener('click', () => {
        timer.activeTaskId = id;
        updateRingDisplay();
        showToast('Timer set to focus on this task');
      });

      const commentBtn = card.querySelector('.comment-btn');
      if (commentBtn) commentBtn.addEventListener('click', () => openCommentModal(id));

      const deleteBtn = card.querySelector('.delete-btn');
      if (deleteBtn) deleteBtn.addEventListener('click', () => deleteTask(id));

      const restoreBtn = card.querySelector('.restore-btn');
      if (restoreBtn) restoreBtn.addEventListener('click', () => toggleTaskComplete(id));
    });
  }

  function renderTasks() {
    const active = state.tasks.filter(t => !t.completedAt).sort((a,b) => a.createdAt - b.createdAt);
    const completed = state.tasks.filter(t => t.completedAt).sort((a,b) => b.completedAt - a.completedAt);

    // Focus view (active only, compact)
    if (active.length === 0) {
      els.focusTaskList.innerHTML = `<div class="empty-state"><div class="emoji">🌊</div>Nothing planned yet.<div class="sub">Add a task to get started.</div></div>`;
    } else {
      els.focusTaskList.innerHTML = active.map(taskCardHTML).join('');
      wireTaskCardEvents(els.focusTaskList);
    }

    // Tasks view
    if (active.length === 0) {
      els.tasksViewList.innerHTML = `<div class="empty-state"><div class="emoji">📝</div>No tasks yet.<div class="sub">Click "+ Add Task" to plan your day.</div></div>`;
    } else {
      els.tasksViewList.innerHTML = active.map(taskCardHTML).join('');
      wireTaskCardEvents(els.tasksViewList);
    }

    // Completed view
    if (completed.length === 0) {
      els.completedViewList.innerHTML = `<div class="empty-state"><div class="emoji">✅</div>Nothing completed yet.<div class="sub">Complete your first task and watch your progress grow.</div></div>`;
    } else {
      els.completedViewList.innerHTML = completed.map(completedCardHTML).join('');
      wireTaskCardEvents(els.completedViewList);
    }

    updateRingDisplay();
  }

  /* ---------- Comments ---------- */
  let activeCommentTaskId = null;
  function openCommentModal(taskId) {
    activeCommentTaskId = taskId;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    els.commentTaskName.textContent = task.title;
    renderComments();
    els.commentModalOverlay.classList.add('open');
    setTimeout(() => els.commentInput.focus(), 50);
  }
  function renderComments() {
    const task = state.tasks.find(t => t.id === activeCommentTaskId);
    if (!task) return;
    if (task.comments.length === 0) {
      els.commentList.innerHTML = `<div style="font-size:0.85rem;color:var(--text-dim);text-align:center;padding:14px 0">No comments yet.</div>`;
      return;
    }
    els.commentList.innerHTML = task.comments.slice().reverse().map(c => `
      <div class="comment-item" data-cid="${c.id}">
        <div class="comment-text">${escapeHtml(c.text)}</div>
        <div class="comment-foot">
          <span class="comment-time">${new Date(c.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
          <button class="icon-btn danger delete-comment-btn" aria-label="Delete comment">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>`).join('');
    els.commentList.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cid = e.target.closest('.comment-item').dataset.cid;
        task.comments = task.comments.filter(c => c.id !== cid);
        saveState();
        renderComments();
        renderTasks();
      });
    });
  }
  els.addCommentBtn.addEventListener('click', addComment);
  els.commentInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addComment(); });
  function addComment() {
    const text = els.commentInput.value.trim();
    if (!text) return;
    const task = state.tasks.find(t => t.id === activeCommentTaskId);
    if (!task) return;
    task.comments.push({ id: uid(), text, timestamp: Date.now() });
    els.commentInput.value = '';
    saveState();
    renderComments();
    renderTasks();
  }
  els.closeCommentBtn.addEventListener('click', () => els.commentModalOverlay.classList.remove('open'));
  els.commentModalOverlay.addEventListener('click', (e) => { if (e.target === els.commentModalOverlay) els.commentModalOverlay.classList.remove('open'); });

  /* ---------- Stats ---------- */
  function renderStats() {
    const mins = Math.floor(state.stats.focusSeconds / 60);
    const h = Math.floor(mins / 60), m = mins % 60;
    els.statFocusTime.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
    els.statSessions.textContent = state.stats.sessions;
    els.statTasksDone.textContent = state.stats.tasksCompletedToday;
    els.statStreak.textContent = `${state.stats.streak || 0} day${state.stats.streak === 1 ? '' : 's'}`;
  }

  /* ---------- Settings ---------- */
  function loadSettingsUI() {
    els.setFocusDur.value = state.settings.focusDur;
    els.setShortDur.value = state.settings.shortDur;
    els.setLongDur.value = state.settings.longDur;
    els.setAutoStart.checked = state.settings.autoStart;
    els.setSound.checked = state.settings.sound;
    applyTheme();
  }

  function updateDurationSetting(key, input, min, max) {
    input.addEventListener('change', () => {
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v < min) v = min;
      if (v > max) v = max;
      input.value = v;
      state.settings[key] = v;
      saveState();
      if (MODES[timer.mode].key === key && !timer.running) {
        resetTimer();
      }
      showToast('Settings saved');
    });
  }
  updateDurationSetting('focusDur', els.setFocusDur, 1, 120);
  updateDurationSetting('shortDur', els.setShortDur, 1, 60);
  updateDurationSetting('longDur', els.setLongDur, 1, 60);

  els.setAutoStart.addEventListener('change', () => { state.settings.autoStart = els.setAutoStart.checked; saveState(); });
  els.setSound.addEventListener('change', () => { state.settings.sound = els.setSound.checked; saveState(); });

  els.resetStatsBtn.addEventListener('click', () => {
    askConfirm('Reset today\'s statistics?', 'This clears today\'s focus time, sessions, and completed-task count. This cannot be undone.', () => {
      state.stats.focusSeconds = 0;
      state.stats.sessions = 0;
      state.stats.tasksCompletedToday = 0;
      saveState();
      renderStats();
      showToast('Statistics reset');
    });
  });
  els.clearCompletedBtn.addEventListener('click', () => {
    askConfirm('Clear completed tasks?', 'This permanently deletes all tasks marked as completed. This cannot be undone.', () => {
      state.tasks = state.tasks.filter(t => !t.completedAt);
      saveState();
      renderTasks();
      showToast('Completed tasks cleared');
    });
  });

  /* ---------- Keyboard: close modals on Escape ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      els.taskModalOverlay.classList.remove('open');
      els.commentModalOverlay.classList.remove('open');
      els.confirmModalOverlay.classList.remove('open');
    }
  });

  /* ---------- Init ---------- */
  loadSettingsUI();
  setMode('focus');
  renderTasks();
  renderStats();
  setButtonsState();

  window.addEventListener('beforeunload', saveState);
})();
