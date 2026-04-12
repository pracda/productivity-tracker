import { useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import useAnalyticsStore from "../store/useAnalyticsStore";

const PIE_COLORS = ["#3b82f6", "#6b7280", "#111827", "#f59e0b"];

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="metric-card polished-analytics-card">
      <div className="metric-card-title">{title}</div>
      <div className="metric-card-value">{value}</div>
      <div className="metric-card-subtitle">{subtitle}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="progress-card analytics-chart-card">
      <div className="progress-top">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="progress-meta" style={{ marginTop: "4px" }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="analytics-chart-wrap">{children}</div>
    </div>
  );
}

function AnalyticsPage() {
  const { analytics, loading, error, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const averageDailyCompletion = useMemo(() => {
    if (!analytics?.dailyTrend?.length) return 0;

    const total = analytics.dailyTrend.reduce(
      (sum, item) => sum + (item.completionPercentage || 0),
      0
    );

    return Math.round(total / analytics.dailyTrend.length);
  }, [analytics]);

  const trackedDays = analytics?.dailyTrend?.length || 0;
  const trackedWeeks = analytics?.weeklyTrend?.length || 0;

  return (
    <div className="daily-page">
      <div className="daily-topbar">
        <div className="daily-topbar-left">
          <h2 className="section-title">Analytics</h2>
          <p className="section-subtitle">
            Insights into consistency, momentum, and completion patterns
          </p>
        </div>
      </div>

      {loading && <p>Loading analytics...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && analytics && (
        <>
          <div className="metrics-grid">
            <SummaryCard
              title="Average Daily Completion"
              value={`${averageDailyCompletion}%`}
              subtitle="Average across tracked days"
            />
            <SummaryCard
              title="Current Streak"
              value={analytics.streaks.currentStreak}
              subtitle={`Success days in a row (≥ ${analytics.streaks.successThreshold}%)`}
            />
            <SummaryCard
              title="Best Streak"
              value={analytics.streaks.bestStreak}
              subtitle="Best streak recorded so far"
            />
            <SummaryCard
              title="Tracked Days"
              value={trackedDays}
              subtitle={`${trackedWeeks} tracked week(s) available`}
            />
          </div>

          <div className="metrics-grid">
            <SummaryCard
              title="Success Days"
              value={analytics.summary?.successDaysCount || 0}
              subtitle="Days at or above success threshold"
            />
            <SummaryCard
              title="Missed Days"
              value={analytics.summary?.missedDaysCount || 0}
              subtitle="Tracked days with 0% completion"
            />
            <SummaryCard
              title="Best Daily Completion"
              value={`${analytics.summary?.bestDailyCompletion || 0}%`}
              subtitle="Highest daily completion recorded"
            />
            <SummaryCard
              title="Average Weekly Score"
              value={`${analytics.summary?.averageWeeklyScore || 0}%`}
              subtitle="Average across tracked weeks"
            />
          </div>

          <div className="analytics-two-column">
            <ChartCard
              title="Daily Completion Trend"
              subtitle="Last 30 days"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completionPercentage"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Task Composition"
              subtitle="Distribution across the last 30 days"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.taskComposition || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(analytics.taskComposition || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="analytics-two-column">
            <ChartCard
              title="Weekly Score Trend"
              subtitle="Weekly performance over time"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekStart" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weeklyScore"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Weekly Score Breakdown"
              subtitle="Compare score components by week"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekStart" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="taskCompletionPercentage"
                    name="Task Completion %"
                  />
                  <Bar
                    dataKey="dailyConsistencyPercentage"
                    name="Daily Consistency %"
                  />
                  <Bar dataKey="weeklyScore" name="Weekly Score %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

export default AnalyticsPage;