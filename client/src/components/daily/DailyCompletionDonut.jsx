function DailyCompletionDonut({ value = 0 }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const degrees = (safeValue / 100) * 360;

  return (
    <div className="daily-donut-wrap">
      <div
        className="daily-donut"
        style={{
          background: `conic-gradient(#111827 ${degrees}deg, #e5e7eb ${degrees}deg)`,
        }}
      >
        <div className="daily-donut-inner">
          <div className="daily-donut-value">{safeValue}%</div>
          <div className="daily-donut-label">Done</div>
        </div>
      </div>
    </div>
  );
}

export default DailyCompletionDonut;