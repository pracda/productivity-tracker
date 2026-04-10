import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import useWeeklyStore from "../store/useWeeklyStore";

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

function MetricCard({ title, value, subtitle }) {
  return (
    <div className="metric-card">
      <div className="metric-card-title">{title}</div>
      <div className="metric-card-value">{value}</div>
      <div className="metric-card-subtitle">{subtitle}</div>
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
  } = useWeeklyStore();

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

    await createWeeklyTask(trimmed);
    setNewTask("");
  };

  return (
    <div className="daily-page">
      <div className="daily-header">
        <div>
          <h2 className="section-title">Weekly</h2>
          <p className="section-subtitle">
            Week starting {weeklyPlan?.weekStart || "-"}
          </p>
        </div>

        <div className="countdown-card">
          <div className="countdown-label">Until Sunday midnight</div>
          <div className="countdown-value weekly-countdown-value">
            {countdown}
          </div>
        </div>
      </div>

      {loading && <p>Loading weekly plan...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && weeklyPlan && (
        <>
          <div className="metrics-grid">
            <MetricCard
              title="Weekly Score"
              value={`${weeklyPlan.weeklyScore}%`}
              subtitle="Overall weekly performance"
            />
            <MetricCard
              title="Task Completion"
              value={`${weeklyPlan.taskCompletionPercentage}%`}
              subtitle={`${completedCount} of ${totalCount} weekly tasks done`}
            />
            <MetricCard
              title="Daily Consistency"
              value={`${weeklyPlan.dailyConsistencyPercentage}%`}
              subtitle="Average daily completion this week"
            />
            <MetricCard
              title="Days Left"
              value={countdown.split(" ")[0]}
              subtitle="Remaining in current week"
            />
          </div>

          <div className="progress-card">
            <div className="progress-top">
              <h3 className="card-title">Weekly Summary</h3>
              <span className="task-meta">Current week</span>
            </div>

            <p className="progress-meta">
              Weekly Score = (Task Completion × 0.7) + (Daily Consistency × 0.3)
            </p>

            <div className="progress-bar" style={{ marginTop: "12px" }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${weeklyPlan.weeklyScore}%` }}
              />
            </div>

            <p className="progress-meta" style={{ marginTop: "10px" }}>
              This week reflects both execution and consistency.
            </p>
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
                  <label
                    key={task._id}
                    className={`task-item ${task.done ? "task-done" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) =>
                        toggleWeeklyTask(task._id, e.target.checked)
                      }
                    />

                    <div className="task-content">
                      <div className="task-top-row">
                        <div className="task-text">{task.text}</div>
                        <span className="task-badge badge-template">
                          Weekly
                        </span>
                      </div>

                      <div className="task-meta">
                        {task.done ? "Completed" : "Still in progress"}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WeeklyPage;