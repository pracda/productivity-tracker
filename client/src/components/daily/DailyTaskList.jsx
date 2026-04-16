import { useEffect, useRef, useState } from "react";

// ─── helpers ────────────────────────────────────────────────────────────────

const getTaskPriority = (task) => {
  if (task.status === "moved") return 3;
  if (task.done || task.status === "completed") return 2;
  return 1;
};

const sortTasks = (tasks = []) =>
  [...tasks].sort((a, b) => {
    const pd = getTaskPriority(a) - getTaskPriority(b);
    return pd !== 0 ? pd : (a.order || 0) - (b.order || 0);
  });

const groupTasks = (tasks = []) => {
  const g = { morning: [], personal: [], night: [], extra: [], moved: [] };
  sortTasks(tasks).forEach((t) => {
    if (t.status === "moved") g.moved.push(t);
    else if (t.type === "morning") g.morning.push(t);
    else if (t.type === "personal") g.personal.push(t);
    else if (t.type === "night") g.night.push(t);
    else g.extra.push(t);
  });
  return g;
};

const currentHHmm = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const formatTime = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
};

const formatDuration = (mins) => {
  if (!mins && mins !== 0) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const computeDuration = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60; // crosses midnight
  return diff;
};

const elapsedFromDate = (startedAt) => {
  if (!startedAt) return null;
  const secs = Math.floor((Date.now() - new Date(startedAt)) / 1000);
  if (secs < 0) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

// ─── badges ─────────────────────────────────────────────────────────────────

function TaskBadge({ task }) {
  const map = {
    moved:    ["Moved",    "badge-moved"],
    morning:  ["Morning",  "badge-morning"],
    night:    ["Night",    "badge-night"],
    personal: ["Personal", "badge-personal"],
    template: ["Template", "badge-template"],
    extra:    ["Extra",    "badge-extra"],
  };
  const key = task.status === "moved" ? "moved" : task.carryOver ? null : task.type;
  const [label, cls] = key ? (map[key] || ["Extra", "badge-extra"]) : ["Carry Over", "badge-carry"];
  return <span className={`task-badge ${cls}`}>{label}</span>;
}

// ─── time tracking panel ─────────────────────────────────────────────────────

function TimePanel({ task, onSave, onClose }) {
  const [scheduledTime, setScheduledTime] = useState(task.scheduledTime || "");
  const [actualStart,   setActualStart]   = useState(task.actualStart   || "");
  const [actualEnd,     setActualEnd]     = useState(task.actualEnd     || "");
  const [actualDuration, setActualDuration] = useState(
    task.actualDuration != null ? String(task.actualDuration) : ""
  );
  const [saving, setSaving] = useState(false);

  // live elapsed timer when a timer is running
  const [elapsed, setElapsed] = useState(() => elapsedFromDate(task.timerStartedAt));
  const tickRef = useRef(null);

  const timerRunning = !!task.timerStartedAt;

  useEffect(() => {
    if (timerRunning) {
      tickRef.current = setInterval(() => setElapsed(elapsedFromDate(task.timerStartedAt)), 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [timerRunning, task.timerStartedAt]);

  // auto-compute duration when both start+end are filled
  useEffect(() => {
    const dur = computeDuration(actualStart, actualEnd);
    if (dur != null) setActualDuration(String(dur));
  }, [actualStart, actualEnd]);

  const handleStartTimer = async () => {
    const now = new Date();
    const hhmm = currentHHmm();
    setActualStart(hhmm);
    setActualEnd("");
    setActualDuration("");
    await onSave({ actualStart: hhmm, actualEnd: null, actualDuration: null, timerStartedAt: now.toISOString() });
  };

  const handleStopTimer = async () => {
    const hhmm = currentHHmm();
    const dur = task.timerStartedAt
      ? Math.round((Date.now() - new Date(task.timerStartedAt)) / 60000)
      : computeDuration(actualStart, hhmm);
    setActualEnd(hhmm);
    setActualDuration(dur != null ? String(dur) : "");
    await onSave({ actualEnd: hhmm, actualDuration: dur, timerStartedAt: null });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      scheduledTime: scheduledTime || null,
      actualStart:   actualStart   || null,
      actualEnd:     actualEnd     || null,
      actualDuration: actualDuration ? Number(actualDuration) : null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="time-panel">
      <div className="time-panel-grid">

        <div className="time-panel-row">
          <span className="time-panel-label">Scheduled</span>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="time-panel-input"
          />
          {scheduledTime && (
            <span className="time-panel-hint">{formatTime(scheduledTime)}</span>
          )}
        </div>

        <div className="time-panel-row">
          <span className="time-panel-label">Started</span>
          <input
            type="time"
            value={actualStart}
            onChange={(e) => setActualStart(e.target.value)}
            className="time-panel-input"
            disabled={timerRunning}
          />
          {!timerRunning ? (
            <button type="button" className="secondary-btn time-panel-btn" onClick={handleStartTimer}>
              Start Timer
            </button>
          ) : (
            <span className="time-panel-hint timer-running">{elapsed} elapsed</span>
          )}
        </div>

        <div className="time-panel-row">
          <span className="time-panel-label">Ended</span>
          <input
            type="time"
            value={actualEnd}
            onChange={(e) => setActualEnd(e.target.value)}
            className="time-panel-input"
          />
          {timerRunning && (
            <button type="button" className="secondary-btn time-panel-btn" onClick={handleStopTimer}>
              Stop Timer
            </button>
          )}
        </div>

        <div className="time-panel-row">
          <span className="time-panel-label">Duration</span>
          <input
            type="number"
            min="1"
            max="720"
            placeholder="min"
            value={actualDuration}
            onChange={(e) => setActualDuration(e.target.value)}
            className="time-panel-input time-panel-duration"
          />
          {actualDuration && (
            <span className="time-panel-hint">{formatDuration(Number(actualDuration))}</span>
          )}
        </div>

      </div>

      <div className="task-actions" style={{ marginTop: "10px" }}>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── task row ────────────────────────────────────────────────────────────────

function TaskRow({ task, onToggle, onEditExtra, onDeleteExtra, onLogTime, disabled = false }) {
  const isMoved   = task.status === "moved";
  const isDone    = task.done || task.status === "completed";
  const isExtra   = task.type === "extra" && task.status !== "moved";
  const timerRunning = !!task.timerStartedAt;

  const [isEditing,     setIsEditing]     = useState(false);
  const [showTimePanel, setShowTimePanel] = useState(false);

  const [draftText,              setDraftText]              = useState(task.text || "");
  const [draftScheduledTime,     setDraftScheduledTime]     = useState(task.scheduledTime || "");
  const [draftEstimatedDuration, setDraftEstimatedDuration] = useState(
    task.estimatedDuration ? String(task.estimatedDuration) : ""
  );

  useEffect(() => {
    setDraftText(task.text || "");
    setDraftScheduledTime(task.scheduledTime || "");
    setDraftEstimatedDuration(task.estimatedDuration ? String(task.estimatedDuration) : "");
  }, [task.text, task.scheduledTime, task.estimatedDuration]);

  // ── extra task inline edit ──────────────────────────────────────────────
  const handleSaveEdit = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (disabled) return;
    const trimmed = draftText.trim();
    if (!trimmed || !onEditExtra) return;
    await onEditExtra(task._id, {
      text: trimmed,
      scheduledTime:     draftScheduledTime     || null,
      estimatedDuration: draftEstimatedDuration ? Number(draftEstimatedDuration) : null,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setDraftText(task.text || "");
    setDraftScheduledTime(task.scheduledTime || "");
    setDraftEstimatedDuration(task.estimatedDuration ? String(task.estimatedDuration) : "");
    setIsEditing(false);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter")  await handleSaveEdit(e);
    if (e.key === "Escape") handleCancelEdit(e);
  };

  // ── time panel save ─────────────────────────────────────────────────────
  const handleTimeSave = async (data) => {
    if (!onLogTime) return;
    await onLogTime(task._id, data);
  };

  // ── display meta ────────────────────────────────────────────────────────
  const scheduleMeta = [
    formatTime(task.scheduledTime),
    formatDuration(task.estimatedDuration),
  ].filter(Boolean).join(" · ");

  const trackingMeta = (() => {
    if (timerRunning) return null; // shown live inside panel
    if (task.actualStart || task.actualEnd || task.actualDuration) {
      return [
        task.actualStart && task.actualEnd
          ? `${formatTime(task.actualStart)} → ${formatTime(task.actualEnd)}`
          : task.actualStart ? `Started ${formatTime(task.actualStart)}` : null,
        formatDuration(task.actualDuration),
      ].filter(Boolean).join(" · ");
    }
    return null;
  })();

  const metaLabel = isMoved
    ? `Moved to ${task.movedToDate}`
    : task.carryOver ? "Carried over from previous day"
    : task.type === "morning" ? "Morning routine"
    : task.type === "night"   ? "Night routine"
    : "Scheduled for today";

  return (
    <div className={`task-item ${isDone ? "task-done" : ""} ${isMoved ? "task-moved" : ""}`}>
      <div className="task-checkbox-wrap">
        <input
          type="checkbox"
          checked={isDone}
          disabled={isMoved || disabled}
          onChange={(e) => onToggle(task._id, e.target.checked)}
        />
      </div>

      <div className="task-content">

        {/* ── top row: text + badge ── */}
        <div className="task-top-row">
          {isEditing ? (
            <input
              className="inline-task-input"
              type="text"
              value={draftText}
              autoFocus
              disabled={disabled}
              onChange={(e) => setDraftText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div className="task-text">{task.text}</div>
          )}
          <TaskBadge task={task} />
        </div>

        {/* ── extra task edit fields ── */}
        {isEditing && (
          <div className="add-task-time-row" style={{ marginTop: "8px" }}>
            <input
              type="time"
              value={draftScheduledTime}
              onChange={(e) => setDraftScheduledTime(e.target.value)}
              className="add-task-time-input"
              title="Scheduled time"
            />
            <input
              type="number"
              min="1" max="480"
              placeholder="Est. (min)"
              value={draftEstimatedDuration}
              onChange={(e) => setDraftEstimatedDuration(e.target.value)}
              className="add-task-duration-input"
              title="Estimated duration"
            />
          </div>
        )}

        {/* ── meta line ── */}
        <div className="task-meta">
          {metaLabel}
          {scheduleMeta && !isEditing && <span> · {scheduleMeta}</span>}
        </div>

        {/* ── tracking summary line ── */}
        {trackingMeta && !showTimePanel && (
          <div className="task-meta task-tracking-meta">
            Logged: {trackingMeta}
          </div>
        )}

        {/* ── time panel ── */}
        {showTimePanel && (
          <TimePanel
            task={task}
            onSave={handleTimeSave}
            onClose={() => setShowTimePanel(false)}
          />
        )}

        {/* ── action buttons ── */}
        {!isMoved && (
          <div className="task-actions">
            {isEditing ? (
              <>
                <button type="button" onClick={handleSaveEdit} disabled={disabled}>Save</button>
                <button type="button" className="secondary-btn" onClick={handleCancelEdit} disabled={disabled}>Cancel</button>
              </>
            ) : (
              <>
                {isExtra && !showTimePanel && (
                  <button type="button" onClick={() => setIsEditing(true)} disabled={disabled}>Edit</button>
                )}

                {!isEditing && (
                  <button
                    type="button"
                    className={timerRunning ? "timer-active-btn" : "secondary-btn"}
                    onClick={() => setShowTimePanel((p) => !p)}
                  >
                    {timerRunning ? "⏱ Running" : showTimePanel ? "Hide" : "Log Time"}
                  </button>
                )}

                {isExtra && !showTimePanel && (
                  <button type="button" className="danger-btn" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if (!disabled) await onDeleteExtra(task._id); }} disabled={disabled}>
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── task section ────────────────────────────────────────────────────────────

function TaskSection({ title, tasks, onToggle, onEditExtra, onDeleteExtra, onLogTime, disabled }) {
  if (!tasks.length) return null;
  return (
    <div className="task-section">
      <h3 className="task-section-title">{title}</h3>
      <div className="task-list">
        {tasks.map((task) => (
          <TaskRow
            key={task._id}
            task={task}
            onToggle={onToggle}
            onEditExtra={onEditExtra}
            onDeleteExtra={onDeleteExtra}
            onLogTime={onLogTime}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

// ─── main export ─────────────────────────────────────────────────────────────

function DailyTaskList({ tasks, onToggle, onEditExtra, onDeleteExtra, onLogTime, disabled = false }) {
  if (!tasks.length) {
    return (
      <div className="empty-state">
        No tasks for this day yet. Open "Manage Routines" to set up your morning and night routines.
      </div>
    );
  }

  const grouped = groupTasks(tasks);
  const sectionProps = { onToggle, onEditExtra, onDeleteExtra, onLogTime, disabled };

  return (
    <div className="grouped-task-list">
      <TaskSection title="Morning Routine" tasks={grouped.morning}  {...sectionProps} />
      <TaskSection title="Personal Tasks"  tasks={grouped.personal} {...sectionProps} />
      <TaskSection title="Night Routine"   tasks={grouped.night}    {...sectionProps} />
      <TaskSection title="Extra Tasks"     tasks={grouped.extra}    {...sectionProps} />
      <TaskSection title="Moved to Next Day" tasks={grouped.moved}  {...sectionProps} disabled={true} />
    </div>
  );
}

export default DailyTaskList;
