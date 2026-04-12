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
    personal: [],
    template: [],
    extra: [],
    moved: [],
  };

  sortTasks(tasks).forEach((task) => {
    if (task.status === "moved") {
      grouped.moved.push(task);
    } else if (task.type === "personal") {
      grouped.personal.push(task);
    } else if (task.type === "template") {
      grouped.template.push(task);
    } else {
      grouped.extra.push(task);
    }
  });

  return grouped;
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

  useEffect(() => {
    setDraftText(task.text || "");
  }, [task.text]);

  const handleSave = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (disabled) return;

    const trimmed = draftText.trim();
    if (!trimmed || !onEditExtra) return;

    await onEditExtra(task._id, trimmed);
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
    setIsEditing(false);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await handleSave(e);
    }

    if (e.key === "Escape") {
      handleCancel(e);
    }
  };

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

        <div className="task-meta">
          {isMoved
            ? `Moved to ${task.movedToDate}`
            : task.carryOver
            ? "Carried over from previous day"
            : "Scheduled for this day"}
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
        No tasks for this day yet. Open “Manage Daily Templates” to customize your recurring setup.
      </div>
    );
  }

  const grouped = groupTasks(tasks);

  return (
    <div className="grouped-task-list">
      <TaskSection
        title="Personal Tasks"
        tasks={grouped.personal}
        onToggle={onToggle}
        onEditExtra={onEditExtra}
        onDeleteExtra={onDeleteExtra}
        disabled={disabled}
      />
      <TaskSection
        title="Today’s Template"
        tasks={grouped.template}
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