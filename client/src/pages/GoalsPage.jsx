import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import useGoalStore from "../store/useGoalStore";
import useToastStore from "../store/useToastStore";

const clampProgress = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
};

const getGoalStatus = (goal) => {
  if (goal.archived) return "Archived";
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
    case "Archived":
      return "badge-template";
    default:
      return "badge-info";
  }
};

const getSortRank = (goal) => {
  const status = getGoalStatus(goal);

  switch (status) {
    case "Overdue":
      return 1;
    case "At Risk":
      return 2;
    case "On Track":
      return 3;
    case "Completed":
      return 4;
    case "Archived":
      return 5;
    default:
      return 6;
  }
};

function MilestoneEditor({ milestones, setMilestones }) {
  const addMilestone = () => {
    setMilestones([...milestones, { text: "", done: false, achievedAt: null }]);
  };

  const updateMilestone = (index, field, value) => {
    setMilestones(
      milestones.map((milestone, i) => {
        if (i !== index) return milestone;

        const updated = { ...milestone, [field]: value };

        if (field === "done") {
          if (value) {
            updated.achievedAt = milestone.achievedAt || new Date().toISOString();
          } else {
            updated.achievedAt = null;
          }
        }

        return updated;
      })
    );
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  return (
    <div className="milestone-editor">
      <div className="progress-top" style={{ marginTop: "14px" }}>
        <h4 className="goal-history-title" style={{ margin: 0 }}>
          Milestones
        </h4>
        <button type="button" className="secondary-btn" onClick={addMilestone}>
          Add Milestone
        </button>
      </div>

      <div className="task-list" style={{ marginTop: "12px" }}>
        {milestones.length === 0 ? (
          <div className="empty-state">No milestones yet.</div>
        ) : (
          milestones.map((milestone, index) => (
            <div key={index} className="task-item">
              <div className="task-checkbox-wrap">
                <input
                  type="checkbox"
                  checked={!!milestone.done}
                  onChange={(e) =>
                    updateMilestone(index, "done", e.target.checked)
                  }
                />
              </div>

              <div className="task-content">
                <input
                  type="text"
                  value={milestone.text}
                  placeholder="Milestone text"
                  onChange={(e) =>
                    updateMilestone(index, "text", e.target.value)
                  }
                />

                {milestone.done && milestone.achievedAt && (
                  <div className="task-meta">
                    Achieved on{" "}
                    {dayjs(milestone.achievedAt).format("MMM D, YYYY h:mm A")}
                  </div>
                )}

                <div className="task-actions">
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => removeMilestone(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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

function GoalCard({ goal, history, onUpdate, onLoadHistory }) {
  const { showToast } = useToastStore();

  const [form, setForm] = useState({
    title: goal.title,
    type: goal.type,
    targetDate: dayjs(goal.targetDate).format("YYYY-MM-DD"),
    progress: goal.progress,
    notes: goal.notes || "",
    scheduledTime: goal.scheduledTime || "",
    estimatedDuration: goal.estimatedDuration ? String(goal.estimatedDuration) : "",
  });

  const [milestones, setMilestones] = useState(goal.milestones || []);

  useEffect(() => {
    setForm({
      title: goal.title,
      type: goal.type,
      targetDate: dayjs(goal.targetDate).format("YYYY-MM-DD"),
      progress: goal.progress,
      notes: goal.notes || "",
      scheduledTime: goal.scheduledTime || "",
      estimatedDuration: goal.estimatedDuration ? String(goal.estimatedDuration) : "",
    });
    setMilestones(goal.milestones || []);
  }, [goal]);

  const status = useMemo(() => getGoalStatus(goal), [goal]);

  const isSaveDisabled = !form.title.trim() || !form.type || !form.targetDate;

  const handleSave = async () => {
    if (isSaveDisabled) return;

    const result = await onUpdate(goal._id, {
      title: form.title.trim(),
      type: form.type,
      targetDate: form.targetDate,
      progress: clampProgress(form.progress),
      notes: form.notes,
      milestones,
      scheduledTime: form.scheduledTime || null,
      estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : null,
    });

    if (result) {
      showToast({
        message: "Goal updated.",
        type: "success",
      });
    }
  };

  const handleArchiveToggle = async () => {
    const result = await onUpdate(goal._id, {
      archived: !goal.archived,
    });

    if (result) {
      showToast({
        message: goal.archived ? "Goal restored." : "Goal archived.",
        type: "info",
      });
    }
  };

  const completedMilestones = milestones.filter((m) => m.done).length;

  return (
    <div className="progress-card polished-goal-card">
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

      <div className="goal-progress-hero">
        <div className="goal-progress-number">{goal.progress}%</div>
        <div className="goal-progress-caption">Current progress</div>
      </div>

      <div className="progress-bar" style={{ marginTop: "14px" }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <div className="goal-summary-row">
        <span className="progress-meta">
          Type: {goal.type === "sixMonth" ? "6 Month Goal" : "Monthly Goal"}
        </span>
        <span className="progress-meta">
          {completedMilestones}/{milestones.length} milestones completed
        </span>
      </div>

      {(goal.scheduledTime || goal.estimatedDuration) && (
        <div className="task-meta" style={{ marginTop: "6px" }}>
          {[formatTime(goal.scheduledTime), formatDuration(goal.estimatedDuration)]
            .filter(Boolean)
            .join(" · ")}
          {" per session"}
        </div>
      )}

      <div className="goal-form-grid" style={{ marginTop: "18px" }}>
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

        <input
          type="time"
          value={form.scheduledTime}
          onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
          title="Daily session time (optional)"
        />

        <input
          type="number"
          min="1"
          max="480"
          placeholder="Session duration (min)"
          value={form.estimatedDuration}
          onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
          title="Estimated session duration in minutes"
        />
      </div>

      <textarea
        className="daily-summary-input"
        style={{ marginTop: "14px", minHeight: "110px" }}
        placeholder="Add notes, blockers, milestones, or next actions..."
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <MilestoneEditor milestones={milestones} setMilestones={setMilestones} />

      <div className="goal-actions" style={{ marginTop: "16px" }}>
        <button onClick={handleSave} disabled={isSaveDisabled}>
          Save Changes
        </button>
        <button
          className="secondary-btn"
          onClick={() => onLoadHistory(goal._id)}
        >
          View History
        </button>
        <button className="secondary-btn" onClick={handleArchiveToggle}>
          {goal.archived ? "Unarchive" : "Archive"}
        </button>
      </div>

      {history && history.length > 0 && (
        <div className="goal-history polished-history-block">
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

  const [filter, setFilter] = useState("active");

  const [newGoal, setNewGoal] = useState({
    title: "",
    type: "monthly",
    targetDate: "",
    progress: 0,
    notes: "",
    scheduledTime: "",
    estimatedDuration: "",
  });

  const [newMilestones, setNewMilestones] = useState([]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const isCreateDisabled =
    !newGoal.title.trim() || !newGoal.type || !newGoal.targetDate;

  const handleCreate = async (e) => {
    e.preventDefault();

    if (isCreateDisabled) return;

    const result = await createNewGoal({
      ...newGoal,
      title: newGoal.title.trim(),
      progress: clampProgress(newGoal.progress),
      notes: newGoal.notes,
      milestones: newMilestones,
      scheduledTime: newGoal.scheduledTime || null,
      estimatedDuration: newGoal.estimatedDuration ? Number(newGoal.estimatedDuration) : null,
    });

    if (result) {
      setNewGoal({
        title: "",
        type: "monthly",
        targetDate: "",
        progress: 0,
        notes: "",
        scheduledTime: "",
        estimatedDuration: "",
      });
      setNewMilestones([]);
    }
  };

  const filteredGoals = useMemo(() => {
    const sorted = [...goals].sort((a, b) => {
      const rankDiff = getSortRank(a) - getSortRank(b);
      if (rankDiff !== 0) return rankDiff;
      return dayjs(a.targetDate).valueOf() - dayjs(b.targetDate).valueOf();
    });

    return sorted.filter((goal) => {
      const status = getGoalStatus(goal);

      switch (filter) {
        case "all":
          return true;
        case "active":
          return !goal.archived && status !== "Completed";
        case "completed":
          return status === "Completed";
        case "archived":
          return goal.archived;
        case "overdue":
          return status === "Overdue";
        default:
          return true;
      }
    });
  }, [goals, filter]);

  return (
    <div className="daily-page">
      <div className="daily-topbar">
        <div className="daily-topbar-left">
          <h2 className="section-title">Goals</h2>
          <p className="section-subtitle">
            Track long-term goals, notes, milestones, and progress history
          </p>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-top">
          <div>
            <h3 className="card-title">Create New Goal</h3>
            <p className="progress-meta">
              Add a measurable goal and define the steps needed to get there.
            </p>
          </div>
        </div>

        <form
          className="goal-create-form"
          onSubmit={handleCreate}
          style={{ marginTop: "16px" }}
        >
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
            onChange={(e) =>
              setNewGoal({ ...newGoal, targetDate: e.target.value })
            }
          />

          <input
            type="number"
            min="0"
            max="100"
            value={newGoal.progress}
            onChange={(e) =>
              setNewGoal({
                ...newGoal,
                progress: clampProgress(e.target.value),
              })
            }
            placeholder="Progress %"
          />

          <input
            type="time"
            value={newGoal.scheduledTime}
            onChange={(e) => setNewGoal({ ...newGoal, scheduledTime: e.target.value })}
            title="Daily session time (optional)"
          />

          <input
            type="number"
            min="1"
            max="480"
            placeholder="Session duration (min)"
            value={newGoal.estimatedDuration}
            onChange={(e) => setNewGoal({ ...newGoal, estimatedDuration: e.target.value })}
            title="Estimated session duration in minutes"
          />

          <button type="submit" disabled={isCreateDisabled}>
            Add Goal
          </button>
        </form>

        <textarea
          className="daily-summary-input"
          style={{ marginTop: "14px", minHeight: "100px" }}
          placeholder="Optional notes for this goal..."
          value={newGoal.notes}
          onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
        />

        <MilestoneEditor
          milestones={newMilestones}
          setMilestones={setNewMilestones}
        />
      </div>

      <div className="filter-chip-row">
        <button
          className={filter === "all" ? "filter-chip active" : "filter-chip"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "active" ? "filter-chip active" : "filter-chip"}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={
            filter === "completed" ? "filter-chip active" : "filter-chip"
          }
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={
            filter === "archived" ? "filter-chip active" : "filter-chip"
          }
          onClick={() => setFilter("archived")}
        >
          Archived
        </button>
        <button
          className={filter === "overdue" ? "filter-chip active" : "filter-chip"}
          onClick={() => setFilter("overdue")}
        >
          Overdue
        </button>
      </div>

      {loading && <p>Loading goals...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="task-list">
        {filteredGoals.length === 0 ? (
          <div className="empty-state">No goals in this view yet.</div>
        ) : (
          filteredGoals.map((goal) => (
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