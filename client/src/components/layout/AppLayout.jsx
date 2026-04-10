import { NavLink, Outlet } from "react-router-dom";
import ToastContainer from "../common/ToastContainer";
import "../../styles/app.css";

function AppLayout() {
  const getNavClass = ({ isActive }) =>
    isActive ? "nav-tab nav-tab-active" : "nav-tab";

  return (
    <div className="app-shell">
      <ToastContainer />

      <header className="app-header">
        <h1 className="app-title">Productivity Tracker</h1>
        <p className="app-subtitle">Simple daily execution system</p>
      </header>

      <nav className="app-nav">
        <NavLink to="/" end className={getNavClass}>
          Daily
        </NavLink>
        <NavLink to="/weekly" className={getNavClass}>
          Weekly
        </NavLink>
        <NavLink to="/goals" className={getNavClass}>
          Goals
        </NavLink>
        <NavLink to="/analytics" className={getNavClass}>
          Analytics
        </NavLink>
        <NavLink to="/profile" className={getNavClass}>
          Profile
        </NavLink>
      </nav>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;