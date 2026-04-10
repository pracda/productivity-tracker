import dayjs from "dayjs";

function EndOfDayPanel({
  incompleteCount,
  endOfDayProcessed,
  endOfDayAction,
  onCarryOver,
  onDelete,
}) {
  if (endOfDayProcessed) {
    return (
      <div className="progress-card">
        <div className="progress-top">
          <h3 className="card-title">End of Day</h3>
          <span className="task-meta">Already processed</span>
        </div>

        <p className="progress-meta">
          End of day was already processed for {dayjs().format("MMMM D")} with action:
          {" "}
          <strong>{endOfDayAction}</strong>
        </p>
      </div>
    );
  }

  if (incompleteCount === 0) return null;

  return (
    <div className="progress-card">
      <div className="progress-top">
        <h3 className="card-title">End of Day</h3>
        <span className="task-meta">{incompleteCount} incomplete</span>
      </div>

      <p className="progress-meta">
        You still have {incompleteCount} incomplete task
        {incompleteCount > 1 ? "s" : ""} for {dayjs().format("MMMM D")}.
      </p>

      <div className="goal-actions">
        <button onClick={onCarryOver}>Move to Next Day</button>
        <button className="secondary-btn" onClick={onDelete}>
          Do Not Carry Forward
        </button>
      </div>
    </div>
  );
}

export default EndOfDayPanel;