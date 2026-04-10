import { useEffect, useMemo, useState } from "react";

function TaskEditor({ title, tasks = [], onSave }) {
  const [localTasks, setLocalTasks] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalTasks(
      tasks.map((task, index) => ({
        ...task,
        text: task.text || "",
        isActive: task.isActive ?? true,
        order: task.order ?? index + 1,
      }))
    );
  }, [tasks]);

  const cleanedTasks = useMemo(() => {
    return localTasks
      .map((task, index) => ({
        text: task.text.trim(),
        isActive: true,
        order: index + 1,
      }))
      .filter((task) => task.text);
  }, [localTasks]);

  const hasAtLeastOneValidRow = cleanedTasks.length > 0;

  const handleChange = (index, value) => {
    setLocalTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, text: value } : task
      )
    );
  };

  const handleAdd = () => {
    if (saving) return;

    setLocalTasks((prev) => [
      ...prev,
      {
        text: "",
        isActive: true,
        order: prev.length + 1,
      },
    ]);
  };

  const handleRemove = (index) => {
    if (saving) return;

    const updated = localTasks
      .filter((_, i) => i !== index)
      .map((task, i) => ({
        ...task,
        order: i + 1,
      }));

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

      <div className="task-editor-list">
        {localTasks.length === 0 && (
          <div className="empty-state">No tasks yet.</div>
        )}

        {localTasks.map((task, index) => (
          <div key={index} className="task-editor-row">
            <input
              type="text"
              value={task.text}
              placeholder="Task description"
              onChange={(e) => handleChange(index, e.target.value)}
              disabled={saving}
            />
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

      <div className="goal-actions">
        <button type="button" onClick={handleAdd} disabled={saving}>
          Add Row
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={handleSave}
          disabled={!hasAtLeastOneValidRow || saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export default TaskEditor;