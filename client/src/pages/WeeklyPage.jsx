import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import useWeeklyStore from "../store/useWeeklyStore";
import useToastStore from "../store/useToastStore";

const getCountdownToSundayMidnight = () => {
  const now = dayjs();
  const endOfWeek = dayjs().endOf("week");
  const totalSeconds = endOfWeek.diff(now, "second");

  if (totalSeconds <= 0) {
    return "0d 0h 0m 0s";
  }

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

function WeeklyStatCard({ title, value, subtitle }) {
  return (
    <div className="progress-card compact-side-card">
      <div className="progress-top">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="sidebar-big-value">{value}</div>
      <p className="progress-meta" style={{ marginTop: "8px" }}>
        {subtitle}
      </p>
    </div>
  );
}

function WeeklyTaskRow({ task, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(task.text || "");

  useEffect(() => {
    setDraftText(task.text || "");
  }, [task.text]);

  const handleSave = async () => {
    const trimmed = draftText.trim();
    if (!trimmed) return;

    const result = await onEdit(task._id, trimmed);
    if (result) {
      setIsEditing(false);
    }
  };

  return (
    <div className={`task-item ${task.done ? "task-done" : ""}`}>
      <div className="task-checkbox-wrap">
        <input
          type="checkbox"
          checked={task.done}
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
              onChange={(e) => setDraftText(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="task-text">{task.text}</div>
          )}

          <span className="task-badge badge-template">Weekly</span>
        </div>

        <div className="task-meta">
          {task.done ? "Completed" : "Still in progress"}
        </div>

        <div className="task-actions">
          {isEditing ? (
            <>
              <button type="button" onClick={handleSave}>
                Save
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setDraftText(task.text || "");
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={() => onDelete(task._id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WeeklyPage() {
  const {
    weeklyPlan,
    loading,
    error,
    fetchWeeklyPlan,
    createWeeklyTask,
    toggleWeeklyTask,
    editWeeklyTask,
    removeWeeklyTask,
  } = useWeeklyStore();

  const { showToast } = useToastStore();

  const [newTask, setNewTask] = useState("");
  const [countdown, setCountdown] = useState(getCountdownToSundayMidnight());

  useEffect(() => {
    fetchWeeklyPlan();
  }, [fetchWeeklyPlan]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownToSundayMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const completedCount = useMemo(() => {
    return weeklyPlan?.tasks?.filter((task) => task.done).length || 0;
  }, [weeklyPlan]);

  const totalCount = weeklyPlan?.tasks?.length || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = newTask.trim();
    if (!trimmed) return;

    const result = await createWeeklyTask(trimmed);
    if (result) {
      setNewTask("");
      showToast({
        message: "Weekly task added.",
        type: "success",
      });
    }
  };

  const handleEdit = async (taskId, text) => {
    const result = await editWeeklyTask(taskId, text);
    if (result) {
      showToast({
        message: "Weekly task updated.",
        type: "success",
      });
    }
    return result;
  };

  const handleDelete = async (taskId) => {
    const result = await removeWeeklyTask(taskId);
    if (result) {
      showToast({
        message: "Weekly task deleted.",
        type: "info",
      });
    }
  };

  const handleToggle = async (taskId, done) => {
    const result = await toggleWeeklyTask(taskId, done);
    if (result) {
      showToast({
        message: done ? "Marked complete." : "Marked incomplete.",
        type: "success",
      });
    }
  };

  return (
    <div className="daily-page">
      <div className="daily-topbar">
        <div className="daily-topbar-left">
          <h2 className="section-title">This Week</h2>
          <p className="section-subtitle">
            Week starting {weeklyPlan?.weekStart || "-"}
          </p>
        </div>
      </div>

      {loading && <p>Loading weekly plan...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && weeklyPlan && (
        <div className="daily-command-layout">
          <div className="daily-main-column">
            <div className="progress-card daily-main-hero">
              <div className="progress-top">
                <div>
                  <h3 className="card-title">Weekly Focus</h3>
                  <p className="progress-meta">
                    {totalCount - completedCount} weekly task
                    {totalCount - completedCount === 1 ? "" : "s"} remaining
                  </p>
                </div>

                <div className="hero-focus-chip">
                  {completedCount}/{totalCount || 0} completed
                </div>
              </div>
            </div>

            <form className="add-task-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Add a weekly task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button type="submit" disabled={!newTask.trim()}>
                Add Task
              </button>
            </form>

            <div className="task-section">
              <h3 className="task-section-title">Weekly Tasks</h3>

              <div className="task-list">
                {weeklyPlan.tasks.length === 0 ? (
                  <div className="empty-state">No weekly tasks yet.</div>
                ) : (
                  weeklyPlan.tasks.map((task) => (
                    <WeeklyTaskRow
                      key={task._id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="daily-side-column">
            <WeeklyStatCard
              title="Time Left"
              value={countdown}
              subtitle="Until Sunday midnight"
            />

            <WeeklyStatCard
              title="Weekly Score"
              value={`${weeklyPlan.weeklyScore}%`}
              subtitle="Overall weekly performance"
            />

            <WeeklyStatCard
              title="Task Completion"
              value={`${weeklyPlan.taskCompletionPercentage}%`}
              subtitle={`${completedCount} of ${totalCount} weekly tasks done`}
            />

            <WeeklyStatCard
              title="Daily Consistency"
              value={`${weeklyPlan.dailyConsistencyPercentage}%`}
              subtitle="Average daily completion this week"
            />
          </aside>
        </div>
      )}
    </div>
  );
}

export default WeeklyPage;