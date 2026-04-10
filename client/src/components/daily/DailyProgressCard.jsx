function DailyProgressCard({ completionPercentage, totalTasks, completedTasks }) {
  return (
    <div className="progress-card">
      <div className="progress-top">
        <h3 className="card-title">Daily Completion</h3>
        <span className="progress-percentage">{completionPercentage}%</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <p className="progress-meta">
        {completedTasks} of {totalTasks} tasks completed
      </p>
    </div>
  );
}

export default DailyProgressCard;