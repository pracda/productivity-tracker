import { useEffect, useMemo, useState } from "react";

const formatTime = (time) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

function RoutineEditor({ title, tasks = [], onSave }) {
  const [localTasks, setLocalTasks] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalTasks(
      tasks.map((task, index) => ({
        ...task,
        text: task.text || "",
        scheduledTime: task.scheduledTime || "",
        isActive: task.isActive ?? true,
        order: task.order ?? index + 1,
      }))
    );
  }, [tasks]);

  const cleanedTasks = useMemo(() => {
    return localTasks
      .map((task, index) => ({
        text: task.text.trim(),
        scheduledTime: task.scheduledTime || null,
        isActive: true,
        order: index + 1,
      }))
      .filter((task) => task.text);
  }, [localTasks]);

  const hasAtLeastOneValidRow = cleanedTasks.length > 0;

  const handleTextChange = (index, value) => {
    setLocalTasks((prev) =>
      prev.map((task, i) => (i === index ? { ...task, text: value } : task))
    );
  };

  const handleTimeChange = (index, value) => {
    setLocalTasks((prev) =>
      prev.map((task, i) => (i === index ? { ...task, scheduledTime: value } : task))
    );
  };

  const handleAdd = () => {
    if (saving) return;
    setLocalTasks((prev) => [
      ...prev,
      { text: "", scheduledTime: "", isActive: true, order: prev.length + 1 },
    ]);
  };

  const handleRemove = (index) => {
    if (saving) return;
    const updated = localTasks
      .filter((_, i) => i !== index)
      .map((task, i) => ({ ...task, order: i + 1 }));
    setLocalTasks(updated);
  };

  const handleSave = async () => {
    if (!hasAtLeastOneValidRow || saving) return;
    setSaving(true);
    try {
      await onSave(cleanedTasks);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="progress-card">
      <div className="progress-top">
        <h3 className="card-title">{title}</h3>
      </div>

      <div className="task-editor-list" style={{ marginTop: "14px" }}>
        {localTasks.length === 0 && (
          <div className="empty-state">No tasks yet. Add your first one below.</div>
        )}

        {localTasks.map((task, index) => (
          <div key={index} className="routine-editor-row">
            <input
              type="text"
              value={task.text}
              placeholder="Task description"
              onChange={(e) => handleTextChange(index, e.target.value)}
              disabled={saving}
              className="routine-task-text"
            />
            <input
              type="time"
              value={task.scheduledTime}
              onChange={(e) => handleTimeChange(index, e.target.value)}
              disabled={saving}
              title="What time do you plan to do this?"
              className="routine-task-time"
            />
            {task.scheduledTime && (
              <span className="routine-time-label">{formatTime(task.scheduledTime)}</span>
            )}
            <button
              type="button"
              className="danger-btn"
              onClick={() => handleRemove(index)}
              disabled={saving}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="goal-actions" style={{ marginTop: "14px" }}>
        <button type="button" onClick={handleAdd} disabled={saving}>
          Add Task
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={handleSave}
          disabled={!hasAtLeastOneValidRow || saving}
        >
          {saving ? "Saving..." : "Save Routine"}
        </button>
      </div>
    </div>
  );
}

export default RoutineEditor;
