import { NavLink, Outlet, Link } from "react-router-dom";
import { useState } from "react";
import dayjs from "dayjs";
import ToastContainer from "../common/ToastContainer";
import useAuthStore from "../../store/useAuthStore";
import "../../styles/app.css";

function AppLayout() {
  const { user, logout } = useAuthStore();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const getNavClass = ({ isActive }) =>
    isActive ? "nav-tab nav-tab-active" : "nav-tab";

  return (
    <div className="app-shell modern-shell">
      <ToastContainer />

      <header className="app-header">
        <div className="app-header-left">
          <button
            type="button"
            className="secondary-btn hamburger-btn"
            onClick={() => setIsWorkspaceMenuOpen((value) => !value)}
            aria-expanded={isWorkspaceMenuOpen}
            aria-controls="workspace-menu"
            aria-label="Toggle workspace menu"
          >
            ☰
          </button>

          <div>
            <h1 className="app-title">Productivity Tracker</h1>
            <p className="app-subtitle">
              Personal planning, consistency tracking, and long-term execution in one place.
            </p>
          </div>

          <nav
            id="workspace-menu"
            className={`app-nav workspace-menu workspace-menu-flyout ${isWorkspaceMenuOpen ? "open" : ""}`}
          >
            <p className="workspace-menu-title">Explore workspace</p>
            <div className="workspace-menu-links">
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
            </div>
          </nav>
        </div>

        <div className="header-user-area">
          <div className="header-date-pill">
            {dayjs().format("ddd, MMM D")}
          </div>
          {user ? (
            <>
              <Link to="/profile" className="header-user-link">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="header-avatar"
                  />
                ) : (
                  <div className="header-avatar header-avatar-fallback">
                    {user.name?.[0] || "U"}
                  </div>
                )}

                <div className="header-user-text">
                  <div className="header-user-name">{user.name}</div>
                  <div className="header-user-email">{user.email}</div>
                </div>
              </Link>

              <button className="secondary-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/profile" className="secondary-btn login-link-btn">
              Sign In
            </Link>
          )}
        </div>
      </header>

      <div className="workspace-main">
        <div className="focus-banner">
          <div>
            <p className="focus-banner-label">Focus mode</p>
            <h2>Start with Today. Everything else is one tap away.</h2>
          </div>
          <NavLink to="/" end className="focus-banner-action">
            Go to Today
          </NavLink>
        </div>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
