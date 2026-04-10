function DailyHeader({ todayLabel, countdown }) {
  return (
    <div className="daily-header">
      <div>
        <h2 className="section-title">Today</h2>
        <p className="section-subtitle">{todayLabel}</p>
      </div>

      <div className="countdown-card">
        <div className="countdown-label">Time left today</div>
        <div className="countdown-value">{countdown}</div>
      </div>
    </div>
  );
}

export default DailyHeader;