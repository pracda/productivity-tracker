import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import useDailyStore from "../store/useDailyStore";
import useSettingsStore from "../store/useSettingsStore";
import useToastStore from "../store/useToastStore";
import DailyTaskList from "../components/daily/DailyTaskList";
import AddTaskForm from "../components/daily/AddTaskForm";
import TaskEditor from "../components/daily/TaskEditor";
import RoutineEditor from "../components/daily/RoutineEditor";
import EndOfDayPanel from "../components/daily/EndOfDayPanel";
import DailyCompletionDonut from "../components/daily/DailyCompletionDonut";

const getCountdownToEndOfDay = (date) => {
  const now = dayjs();
  const selectedDate = dayjs(date);
  const endOfSelectedDay = selectedDate.endOf("day");

  if (selectedDate.format("YYYY-MM-DD") !== dayjs().format("YYYY-MM-DD")) {
    return "Not today";
  }

  const totalSeconds = endOfSelectedDay.diff(now, "second");

  if (totalSeconds <= 0) {
    return "00:00:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value) => String(value).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};


function DailyPage() {
  const {
    entry,
    loading,
    error,
    fetchDailyEntry,
    toggleTask,
    createExtraTask,
    editExtraTask,
    removeExtraTask,
    logTaskTime,
    saveSummary,
    reopenDay,
    runEndOfDay,
  } = useDailyStore();

  const {
    personalTasks,
    morningRoutine,
    nightRoutine,
    fetchPersonalTasks,
    savePersonalTasks,
    fetchRoutine,
    saveRoutine,
  } = useSettingsStore();

  const { showToast } = useToastStore();

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [countdown, setCountdown] = useState(
    getCountdownToEndOfDay(dayjs().format("YYYY-MM-DD"))
  );
  const [showSetup, setShowSetup] = useState(false);
  const [dailySummary, setDailySummary] = useState("");
  const [savingSummary, setSavingSummary] = useState(false);

  useEffect(() => {
    fetchDailyEntry(selectedDate);
    fetchPersonalTasks();
    fetchRoutine("morning");
    fetchRoutine("night");
  }, [selectedDate, fetchDailyEntry, fetchPersonalTasks, fetchRoutine]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownToEndOfDay(selectedDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  useEffect(() => {
    setDailySummary(entry?.summary || "");
  }, [entry?.summary]);

  const selectedDateLabel = useMemo(() => {
    return dayjs(selectedDate).format("dddd, MMMM D, YYYY");
  }, [selectedDate]);

  const tasks = entry?.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.done || task.status === "completed"
  ).length;
  const incompleteTasks = tasks.filter(
    (task) => !task.done && task.status !== "moved"
  );
  const incompleteCount = incompleteTasks.length;
  const completionPercentage = entry?.completionPercentage || 0;

  const endOfDayProcessed = entry?.endOfDayProcessed || false;
  const endOfDayAction = entry?.endOfDayAction || null;
  const isClosed = entry?.isClosed || false;
  const closedAt = entry?.closedAt || null;

  const handleCarryOver = async () => {
    const result = await runEndOfDay(selectedDate, "carryOver", dailySummary);

    if (result) {
      showToast({
        message: `Moved ${result.movedCount} incomplete task(s) to ${result.nextDate}`,
        type: "success",
      });
      await fetchDailyEntry(selectedDate);
    }
  };

  const handleDeleteEndOfDay = async () => {
    const result = await runEndOfDay(selectedDate, "delete", dailySummary);

    if (result) {
      showToast({
        message: "Day closed without carrying forward incomplete tasks.",
        type: "info",
      });
      await fetchDailyEntry(selectedDate);
    }
  };

  const handleReopenDay = async () => {
    const result = await reopenDay();

    if (result) {
      showToast({
        message: "Day reopened.",
        type: "success",
      });
    }
  };

  const handleAddExtraTask = async ({ text, scheduledTime, estimatedDuration }) => {
    await createExtraTask({ text, scheduledTime, estimatedDuration });
    showToast({
      message: "Extra task added.",
      type: "success",
    });
  };

  const handleEditExtraTask = async (taskId, taskData) => {
    await editExtraTask(taskId, taskData);
    showToast({
      message: "Extra task updated.",
      type: "success",
    });
  };

  const handleDeleteExtraTask = async (taskId) => {
    await removeExtraTask(taskId);
    showToast({
      message: "Extra task deleted.",
      type: "info",
    });
  };

  const handleLogTaskTime = async (taskId, data) => {
    await logTaskTime(taskId, data);
  };

  const handleSaveSummary = async () => {
    setSavingSummary(true);
    const result = await saveSummary(dailySummary);

    if (result) {
      showToast({
        message: "Daily summary saved.",
        type: "success",
      });
    }

    setSavingSummary(false);
  };

  return (
    <div className="daily-page">
      <div className="daily-topbar">
        <div className="daily-topbar-left">
          <h2 className="section-title">Today</h2>
          <p className="section-subtitle">{selectedDateLabel}</p>
        </div>

        <div className="daily-topbar-right">
          <label className="topbar-date-label">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="topbar-date-input"
          />
        </div>
      </div>

      {isClosed && (
        <div className="closed-day-banner">
          This day is closed. Tasks and summary are locked.
        </div>
      )}

      {loading && <p>Loading selected day’s tasks...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && (
        <div className="daily-command-layout">
          <div className="daily-main-column">
            <div className="progress-card daily-main-hero">
              <div className="progress-top">
                <div>
                  <h3 className="card-title">Today’s Focus</h3>
                  <p className="progress-meta">
                    {incompleteCount} active task{incompleteCount === 1 ? "" : "s"} remaining
                  </p>
                </div>

                <div className="hero-focus-chip">
                  {completedTasks}/{totalTasks || 0} completed
                </div>
              </div>
            </div>

            <AddTaskForm onAdd={handleAddExtraTask} disabled={isClosed || !entry} />

            <DailyTaskList
              tasks={tasks}
              onToggle={toggleTask}
              onEditExtra={handleEditExtraTask}
              onDeleteExtra={handleDeleteExtraTask}
              onLogTime={handleLogTaskTime}
              disabled={isClosed}
            />

            <div className="progress-card">
              <div className="progress-top">
                <h3 className="card-title">Daily Summary</h3>
                <span className="task-meta">Reflection / notes</span>
              </div>

              <textarea
                className="daily-summary-input"
                placeholder={
                  isClosed
                    ? "This day is closed"
                    : "Write a short summary of today, what went well, what needs follow-up tomorrow..."
                }
                value={dailySummary}
                onChange={(e) => setDailySummary(e.target.value)}
                rows={6}
                disabled={isClosed}
              />

              <div className="goal-actions" style={{ marginTop: "12px" }}>
                <button onClick={handleSaveSummary} disabled={savingSummary || isClosed}>
                  {savingSummary ? "Saving..." : "Save Summary"}
                </button>
              </div>
            </div>

            <div className="goal-actions">
              <button onClick={() => setShowSetup((prev) => !prev)}>
                {showSetup ? "Hide Setup" : "Manage Routines"}
              </button>
            </div>

            {showSetup && (
              <div className="daily-page">
                <RoutineEditor
                  title="Morning Routine"
                  tasks={morningRoutine}
                  onSave={(tasks) => saveRoutine("morning", tasks)}
                />

                <TaskEditor
                  title="Personal Tasks (Every Day)"
                  tasks={personalTasks}
                  onSave={savePersonalTasks}
                />

                <RoutineEditor
                  title="Night Routine"
                  tasks={nightRoutine}
                  onSave={(tasks) => saveRoutine("night", tasks)}
                />
              </div>
            )}
          </div>

          <aside className="daily-side-column">
            <div className="progress-card compact-side-card">
              <div className="progress-top">
                <h3 className="card-title">Time left today</h3>
                <span className="task-meta">Until end of day</span>
              </div>

              <div className="sidebar-big-value">{countdown}</div>
            </div>

            <div className="progress-card compact-side-card">
              <div className="progress-top">
                <h3 className="card-title">Daily Completion</h3>
                <span className="task-meta">{completionPercentage}%</span>
              </div>

              <DailyCompletionDonut value={completionPercentage} />

              <div className="sidebar-stat-grid">
                <div>
                  <div className="sidebar-stat-label">Completed</div>
                  <div className="sidebar-stat-value">{completedTasks}</div>
                </div>
                <div>
                  <div className="sidebar-stat-label">Remaining</div>
                  <div className="sidebar-stat-value">{incompleteCount}</div>
                </div>
              </div>
            </div>

            <EndOfDayPanel
              incompleteCount={incompleteCount}
              endOfDayProcessed={endOfDayProcessed}
              endOfDayAction={endOfDayAction}
              isClosed={isClosed}
              closedAt={closedAt}
              onCarryOver={handleCarryOver}
              onDelete={handleDeleteEndOfDay}
              onReopen={handleReopenDay}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

export default DailyPage;