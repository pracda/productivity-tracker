import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import useDailyStore from "../store/useDailyStore";
import useSettingsStore from "../store/useSettingsStore";
import useToastStore from "../store/useToastStore";
import DailyHeader from "../components/daily/DailyHeader";
import DailyProgressCard from "../components/daily/DailyProgressCard";
import DailyTaskList from "../components/daily/DailyTaskList";
import AddTaskForm from "../components/daily/AddTaskForm";
import TaskEditor from "../components/daily/TaskEditor";
import EndOfDayPanel from "../components/daily/EndOfDayPanel";

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

const weekdayOptions = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

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
    runEndOfDay,
  } = useDailyStore();

  const {
    personalTasks,
    currentTemplate,
    selectedWeekday,
    fetchPersonalTasks,
    savePersonalTasks,
    fetchTemplate,
    saveTemplate,
  } = useSettingsStore();

  const { showToast } = useToastStore();

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [countdown, setCountdown] = useState(
    getCountdownToEndOfDay(dayjs().format("YYYY-MM-DD"))
  );
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    fetchDailyEntry(selectedDate);
    fetchPersonalTasks();
    fetchTemplate(dayjs(selectedDate).day());
  }, [selectedDate, fetchDailyEntry, fetchPersonalTasks, fetchTemplate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownToEndOfDay(selectedDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDate]);

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

  const handleCarryOver = async () => {
    const result = await runEndOfDay(selectedDate, "carryOver");

    if (result) {
      showToast({
        message: `Moved ${result.movedCount} incomplete task(s) to ${result.nextDate}`,
        type: "success",
      });
      setSelectedDate(result.nextDate);
    }
  };

  const handleDeleteEndOfDay = async () => {
    const result = await runEndOfDay(selectedDate, "delete");

    if (result) {
      showToast({
        message: "Incomplete tasks were not carried forward.",
        type: "info",
      });
      await fetchDailyEntry(selectedDate);
    }
  };

  const handleAddExtraTask = async (text) => {
    await createExtraTask(text);
    showToast({
      message: "Extra task added.",
      type: "success",
    });
  };

  const handleEditExtraTask = async (taskId, text) => {
    await editExtraTask(taskId, text);
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

  return (
    <div className="daily-page">
      <DailyHeader todayLabel={selectedDateLabel} countdown={countdown} />

      <div className="progress-card">
        <label
          className="task-meta"
          style={{ display: "block", marginBottom: "8px" }}
        >
          View Date
        </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            width: "100%",
            maxWidth: "260px",
          }}
        />
      </div>

      {loading && <p>Loading selected day’s tasks...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && (
        <>
          <DailyProgressCard
            completionPercentage={completionPercentage}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
          />

          <EndOfDayPanel
            incompleteCount={incompleteCount}
            endOfDayProcessed={endOfDayProcessed}
            endOfDayAction={endOfDayAction}
            onCarryOver={handleCarryOver}
            onDelete={handleDeleteEndOfDay}
          />

          <AddTaskForm onAdd={handleAddExtraTask} disabled={!entry} />

          <div className="progress-card">
            <div className="progress-top">
              <h3 className="card-title">Today’s Focus</h3>
              <span className="task-meta">{incompleteCount} remaining</span>
            </div>
            <p className="progress-meta">
              Stay focused on what is still active for this day.
            </p>
          </div>

          <DailyTaskList
            tasks={tasks}
            onToggle={toggleTask}
            onEditExtra={handleEditExtraTask}
            onDeleteExtra={handleDeleteExtraTask}
          />

          <div className="goal-actions">
            <button onClick={() => setShowSetup((prev) => !prev)}>
              {showSetup ? "Hide Setup" : "Manage Daily Templates"}
            </button>
          </div>

          {showSetup && (
            <div className="daily-page">
              <TaskEditor
                title="Personal Tasks (Every Day)"
                tasks={personalTasks}
                onSave={savePersonalTasks}
              />

              <div className="progress-card">
                <div className="progress-top">
                  <h3 className="card-title">Weekday Template Tasks</h3>
                </div>

                <select
                  value={selectedWeekday}
                  onChange={(e) => fetchTemplate(Number(e.target.value))}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    marginBottom: "16px",
                  }}
                >
                  {weekdayOptions.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>

                <TaskEditor
                  title={`Template for ${
                    weekdayOptions.find((d) => d.value === selectedWeekday)?.label
                  }`}
                  tasks={currentTemplate}
                  onSave={(tasks) => saveTemplate(selectedWeekday, tasks)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DailyPage;