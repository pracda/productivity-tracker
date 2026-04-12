import { useState } from "react";

function AddTaskForm({ onAdd, disabled = false }) {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    await onAdd(trimmed);
    setText("");
  };

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={disabled ? "Day is closed" : "Add an extra task"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Add Task
      </button>
    </form>
  );
}

export default AddTaskForm;