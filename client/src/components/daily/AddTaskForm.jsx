import { useState } from "react";

function AddTaskForm({ onAdd, disabled = false }) {
  const [text, setText] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    await onAdd({
      text: trimmed,
      scheduledTime: scheduledTime || null,
      estimatedDuration: estimatedDuration ? Number(estimatedDuration) : null,
    });

    setText("");
    setScheduledTime("");
    setEstimatedDuration("");
  };

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={disabled ? "Day is closed" : "Add an extra task"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        className="add-task-text-input"
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Add Task
      </button>
      <div className="add-task-time-row">
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          disabled={disabled}
          title="Scheduled time (optional)"
          className="add-task-time-input"
        />
        <input
          type="number"
          min="1"
          max="480"
          placeholder="Duration (min)"
          value={estimatedDuration}
          onChange={(e) => setEstimatedDuration(e.target.value)}
          disabled={disabled}
          title="Estimated duration in minutes"
          className="add-task-duration-input"
        />
      </div>
    </form>
  );
}

export default AddTaskForm;
