import { useRef, useState } from "react";

function AddTaskForm({ onAdd, disabled }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const trimmedText = text.trim();
  const isSubmitDisabled = disabled || saving || !trimmedText;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitDisabled) return;

    setSaving(true);

    try {
      await onAdd(trimmedText);
      setText("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Add an extra task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || saving}
      />
      <button type="submit" disabled={isSubmitDisabled}>
        {saving ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}

export default AddTaskForm;