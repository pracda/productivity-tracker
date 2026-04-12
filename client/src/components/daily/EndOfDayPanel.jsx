import dayjs from "dayjs";

function EndOfDayPanel({
  incompleteCount,
  endOfDayProcessed,
  endOfDayAction,
  isClosed = false,
  closedAt = null,
  onCarryOver,
  onDelete,
  onReopen,
}) {
  if (isClosed) {
    return (
      <div className="progress-card compact-side-card">
        <div className="progress-top">
          <h3 className="card-title">Day Closed</h3>
          <span className="task-badge badge-success">Closed</span>
        </div>

        <p className="progress-meta" style={{ marginTop: "10px" }}>
          This day has already been finalized.
        </p>

        {closedAt && (
          <p className="progress-meta" style={{ marginTop: "8px" }}>
            Closed on {dayjs(closedAt).format("MMM D, YYYY h:mm A")}
          </p>
        )}

        {endOfDayProcessed && endOfDayAction && (
          <p className="progress-meta" style={{ marginTop: "8px" }}>
            Action used:{" "}
            <strong>
              {endOfDayAction === "carryOver"
                ? "Carry Over"
                : "Delete Remaining"}
            </strong>
          </p>
        )}

        <div className="goal-actions" style={{ marginTop: "14px" }}>
          <button className="secondary-btn" onClick={onReopen}>
            Reopen Day
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-card compact-side-card">
      <div className="progress-top">
        <h3 className="card-title">Close Day</h3>
        <span className="task-meta">Finalize today’s work</span>
      </div>

      <p className="progress-meta" style={{ marginTop: "10px" }}>
        {incompleteCount > 0
          ? `${incompleteCount} incomplete task${
              incompleteCount === 1 ? "" : "s"
            } remaining`
          : "All tasks completed"}
      </p>

      <div className="goal-actions" style={{ marginTop: "14px" }}>
        <button onClick={onCarryOver} disabled={endOfDayProcessed}>
          Carry Over
        </button>

        <button
          className="secondary-btn"
          onClick={onDelete}
          disabled={endOfDayProcessed}
        >
          Delete Remaining
        </button>
      </div>
    </div>
  );
}

export default EndOfDayPanel;