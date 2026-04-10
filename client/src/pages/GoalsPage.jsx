import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import useGoalStore from "../store/useGoalStore";

const clampProgress = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
};

const getGoalStatus = (goal) => {
  if (goal.progress >= 100) return "Completed";

  const today = dayjs().startOf("day");
  const target = dayjs(goal.targetDate).startOf("day");
  const daysLeft = target.diff(today, "day");

  if (daysLeft < 0) return "Overdue";
  if (daysLeft <= 7) return "At Risk";
  return "On Track";
};

const getStatusClassName = (status) => {
  switch (status) {
    case "Completed":
      return "badge-success";
    case "Overdue":
      return "badge-danger";
    case "At Risk":
      return "badge-warning";
    default:
      return "badge-info";
  }
};

function GoalCard({ goal, history, onUpdate, onLoadHistory }) {
  const [form, setForm] = useState({
    title: goal.title,
    type: goal.type,
    targetDate: dayjs(goal.targetDate).format("YYYY-MM-DD"),
    progress: goal.progress,
  });

  useEffect(() => {
    setForm({
      title: goal.title,
      type: goal.type,
      targetDate: dayjs(goal.targetDate).format("YYYY-MM-DD"),
      progress: goal.progress,
    });
  }, [goal]);

  const status = useMemo(() => getGoalStatus(goal), [goal]);

  const isSaveDisabled =
    !form.title.trim() || !form.type || !form.targetDate;

  const handleSave = async () => {
    if (isSaveDisabled) return;

    await onUpdate(goal._id, {
      title: form.title.trim(),
      type: form.type,
      targetDate: form.targetDate,
      progress: clampProgress(form.progress),
    });
  };

  return (
    <div className="progress-card">
      <div className="progress-top">
        <div>
          <h3 className="card-title">{goal.title}</h3>
          <p className="progress-meta" style={{ marginTop: "4px" }}>
            Target: {dayjs(goal.targetDate).format("MMM D, YYYY")}
          </p>
        </div>

        <div className={`task-badge ${getStatusClassName(status)}`}>
          {status}
        </div>
      </div>

      <div className="goal-form-grid">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Goal title"
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="monthly">Monthly</option>
          <option value="sixMonth">6 Month</option>
        </select>

        <input
          type="date"
          value={form.targetDate}
          onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
        />

        <input
          type="number"
          min="0"
          max="100"
          value={form.progress}
          onChange={(e) =>
            setForm({ ...form, progress: clampProgress(e.target.value) })
          }
          placeholder="Progress %"
        />
      </div>

      <div className="progress-bar" style={{ marginTop: "14px" }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <div className="goal-summary-row">
        <span className="progress-meta">Progress: {goal.progress}%</span>
        <span className="progress-meta">
          Type: {goal.type === "sixMonth" ? "6 Month" : "Monthly"}
        </span>
      </div>

      <div className="goal-actions">
        <button onClick={handleSave} disabled={isSaveDisabled}>
          Save Changes
        </button>
        <button className="secondary-btn" onClick={() => onLoadHistory(goal._id)}>
          View History
        </button>
      </div>

      {history && history.length > 0 && (
        <div className="goal-history">
          <h4 className="goal-history-title">Change History</h4>

          {history.map((entry) => (
            <div key={entry._id} className="history-entry">
              <div className="task-meta">
                {dayjs(entry.changedAt).format("MMM D, YYYY h:mm A")}
              </div>

              <div className="history-change-list">
                {entry.changes.map((change, index) => (
                  <div key={index} className="history-change">
                    <strong>{change.field}</strong>: {String(change.oldValue)} →{" "}
                    {String(change.newValue)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GoalsPage() {
  const {
    goals,
    historyByGoalId,
    loading,
    error,
    fetchGoals,
    createNewGoal,
    updateExistingGoal,
    fetchGoalHistory,
  } = useGoalStore();

  const [newGoal, setNewGoal] = useState({
    title: "",
    type: "monthly",
    targetDate: "",
    progress: 0,
  });

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const isCreateDisabled =
    !newGoal.title.trim() || !newGoal.type || !newGoal.targetDate;

  const handleCreate = async (e) => {
    e.preventDefault();

    if (isCreateDisabled) return;

    await createNewGoal({
      ...newGoal,
      title: newGoal.title.trim(),
      progress: clampProgress(newGoal.progress),
    });

    setNewGoal({
      title: "",
      type: "monthly",
      targetDate: "",
      progress: 0,
    });
  };

  return (
    <div className="daily-page">
      <div>
        <h2 className="section-title">Goals</h2>
        <p className="section-subtitle">
          Track monthly and 6-month goals with progress history
        </p>
      </div>

      <form className="goal-create-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Goal title"
          value={newGoal.title}
          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
        />

        <select
          value={newGoal.type}
          onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
        >
          <option value="monthly">Monthly</option>
          <option value="sixMonth">6 Month</option>
        </select>

        <input
          type="date"
          value={newGoal.targetDate}
          onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
        />

        <input
          type="number"
          min="0"
          max="100"
          value={newGoal.progress}
          onChange={(e) =>
            setNewGoal({ ...newGoal, progress: clampProgress(e.target.value) })
          }
        />

        <button type="submit" disabled={isCreateDisabled}>
          Add Goal
        </button>
      </form>

      {loading && <p>Loading goals...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="task-list">
        {goals.length === 0 ? (
          <div className="empty-state">No goals yet.</div>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              history={historyByGoalId[goal._id]}
              onUpdate={updateExistingGoal}
              onLoadHistory={fetchGoalHistory}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default GoalsPage;