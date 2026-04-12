import { NavLink, Outlet, Link } from "react-router-dom";
import ToastContainer from "../common/ToastContainer";
import useAuthStore from "../../store/useAuthStore";
import "../../styles/app.css";

function AppLayout() {
  const { user, logout } = useAuthStore();

  const getNavClass = ({ isActive }) =>
    isActive ? "nav-tab nav-tab-active" : "nav-tab";

  return (
    <div className="app-shell">
      <ToastContainer />

      <header className="app-header">
        <div>
          <h1 className="app-title">Productivity Tracker</h1>
          <p className="app-subtitle">
             Personal planning, consistency tracking, and long-term execution in one place.
          </p>
        </div>

        <div className="header-user-area">
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