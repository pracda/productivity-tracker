import { useEffect, useState } from "react";

const getTaskPriority = (task) => {
  if (task.status === "moved") return 3;
  if (task.done || task.status === "completed") return 2;
  return 1;
};

const sortTasks = (tasks = []) => {
  return [...tasks].sort((a, b) => {
    const priorityDiff = getTaskPriority(a) - getTaskPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return (a.order || 0) - (b.order || 0);
  });
};

const groupTasks = (tasks = []) => {
  const grouped = {
    morning: [],
    personal: [],
    night: [],
    extra: [],
    moved: [],
  };

  sortTasks(tasks).forEach((task) => {
    if (task.status === "moved") {
      grouped.moved.push(task);
    } else if (task.type === "morning") {
      grouped.morning.push(task);
    } else if (task.type === "personal") {
      grouped.personal.push(task);
    } else if (task.type === "night") {
      grouped.night.push(task);
    } else {
      // 'extra' and legacy 'template' tasks
      grouped.extra.push(task);
    }
  });

  return grouped;
};

const formatTime = (time) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

const formatDuration = (mins) => {
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

function TaskBadge({ task }) {
  let label = task.type;
  let className = "task-badge";

  if (task.status === "moved") {
    label = "Moved";
    className += " badge-moved";
  } else if (task.carryOver) {
    label = "Carry Over";
    className += " badge-carry";
  } else if (task.type === "morning") {
    label = "Morning";
    className += " badge-morning";
  } else if (task.type === "night") {
    label = "Night";
    className += " badge-night";
  } else if (task.type === "personal") {
    label = "Personal";
    className += " badge-personal";
  } else if (task.type === "template") {
    label = "Template";
    className += " badge-template";
  } else if (task.type === "extra") {
    label = "Extra";
    className += " badge-extra";
  }

  return <span className={className}>{label}</span>;
}

function TaskRow({ task, onToggle, onEditExtra, onDeleteExtra, disabled = false }) {
  const isMoved = task.status === "moved";
  const isDone = task.done || task.status === "completed";
  const isExtra = task.type === "extra" && task.status !== "moved";

  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(task.text || "");
  const [draftScheduledTime, setDraftScheduledTime] = useState(task.scheduledTime || "");
  const [draftEstimatedDuration, setDraftEstimatedDuration] = useState(
    task.estimatedDuration ? String(task.estimatedDuration) : ""
  );

  useEffect(() => {
    setDraftText(task.text || "");
    setDraftScheduledTime(task.scheduledTime || "");
    setDraftEstimatedDuration(task.estimatedDuration ? String(task.estimatedDuration) : "");
  }, [task.text, task.scheduledTime, task.estimatedDuration]);

  const handleSave = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (disabled) return;

    const trimmed = draftText.trim();
    if (!trimmed || !onEditExtra) return;

    await onEditExtra(task._id, {
      text: trimmed,
      scheduledTime: draftScheduledTime || null,
      estimatedDuration: draftEstimatedDuration ? Number(draftEstimatedDuration) : null,
    });
    setIsEditing(false);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || !onDeleteExtra) return;
    await onDeleteExtra(task._id);
  };

  const handleStartEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsEditing(true);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraftText(task.text || "");
    setDraftScheduledTime(task.scheduledTime || "");
    setDraftEstimatedDuration(task.estimatedDuration ? String(task.estimatedDuration) : "");
    setIsEditing(false);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") await handleSave(e);
    if (e.key === "Escape") handleCancel(e);
  };

  const scheduleMeta = [
    formatTime(task.scheduledTime),
    formatDuration(task.estimatedDuration),
  ].filter(Boolean).join(" · ");

  const metaLabel = isMoved
    ? `Moved to ${task.movedToDate}`
    : task.carryOver
    ? "Carried over from previous day"
    : task.type === "morning"
    ? "Morning routine"
    : task.type === "night"
    ? "Night routine"
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

        {isEditing && (
          <div className="add-task-time-row" style={{ marginTop: "8px" }}>
            <input
              type="time"
              value={draftScheduledTime}
              onChange={(e) => setDraftScheduledTime(e.target.value)}
              disabled={disabled}
              title="Scheduled time (optional)"
              className="add-task-time-input"
            />
            <input
              type="number"
              min="1"
              max="480"
              placeholder="Duration (min)"
              value={draftEstimatedDuration}
              onChange={(e) => setDraftEstimatedDuration(e.target.value)}
              disabled={disabled}
              title="Estimated duration in minutes"
              className="add-task-duration-input"
            />
          </div>
        )}

        <div className="task-meta">
          {metaLabel}
          {scheduleMeta && !isEditing && <span> · {scheduleMeta}</span>}
        </div>

        {isExtra && (
          <div className="task-actions">
            {isEditing ? (
              <>
                <button type="button" onClick={handleSave} disabled={disabled}>
                  Save
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCancel}
                  disabled={disabled}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={handleStartEdit} disabled={disabled}>
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={handleDelete}
                  disabled={disabled}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskSection({ title, tasks, onToggle, onEditExtra, onDeleteExtra, disabled }) {
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
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

function DailyTaskList({ tasks, onToggle, onEditExtra, onDeleteExtra, disabled = false }) {
  if (!tasks.length) {
    return (
      <div className="empty-state">
        No tasks for this day yet. Open "Manage Routines" to set up your morning and night routines.
      </div>
    );
  }

  const grouped = groupTasks(tasks);

  return (
    <div className="grouped-task-list">
      <TaskSection
        title="Morning Routine"
        tasks={grouped.morning}
        onToggle={onToggle}
        onEditExtra={onEditExtra}
        onDeleteExtra={onDeleteExtra}
        disabled={disabled}
      />
      <TaskSection
        title="Personal Tasks"
        tasks={grouped.personal}
        onToggle={onToggle}
        onEditExtra={onEditExtra}
        onDeleteExtra={onDeleteExtra}
        disabled={disabled}
      />
      <TaskSection
        title="Night Routine"
        tasks={grouped.night}
        onToggle={onToggle}
        onEditExtra={onEditExtra}
        onDeleteExtra={onDeleteExtra}
        disabled={disabled}
      />
      <TaskSection
        title="Extra Tasks"
        tasks={grouped.extra}
        onToggle={onToggle}
        onEditExtra={onEditExtra}
        onDeleteExtra={onDeleteExtra}
        disabled={disabled}
      />
      <TaskSection
        title="Moved to Next Day"
        tasks={grouped.moved}
        onToggle={onToggle}
        onEditExtra={onEditExtra}
        onDeleteExtra={onDeleteExtra}
        disabled={true}
      />
    </div>
  );
}

export default DailyTaskList;
