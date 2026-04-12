import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import useAuthStore from "../store/useAuthStore";

function ProfilePage() {
  const { user, logout, error, loading, initialized } = useAuthStore();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!initialized) {
    return (
      <div className="daily-page">
        <div className="daily-topbar">
          <div className="daily-topbar-left">
            <h2 className="section-title">Profile</h2>
            <p className="section-subtitle">Loading your account...</p>
          </div>
        </div>

        <div className="progress-card profile-card">
          <p className="progress-meta">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-page">
      <div className="daily-topbar">
        <div className="daily-topbar-left">
          <h2 className="section-title">Profile</h2>
          <p className="section-subtitle">
            Manage your account and authentication
          </p>
        </div>
      </div>

      {!user && (
        <div className="progress-card profile-card">
          <div className="progress-top">
            <div>
              <h3 className="card-title">Sign in</h3>
              <p className="progress-meta">
                Sign in with Google to access your personal planner.
              </p>
            </div>
          </div>

          {error && <p className="error-text" style={{ marginTop: "14px" }}>{error}</p>}

          <div className="profile-login-section">
            <GoogleLoginButton />
          </div>

          {loading && (
            <p className="progress-meta" style={{ marginTop: "14px" }}>
              Signing you in...
            </p>
          )}
        </div>
      )}

      {user && (
        <div className="progress-card profile-card">
          <div className="profile-top">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar profile-avatar-fallback">
                {getInitials(user.name)}
              </div>
            )}

            <div>
              <h3 className="card-title">{user.name}</h3>
              <p className="progress-meta">{user.email}</p>
            </div>
          </div>

          <div className="profile-info-block">
            <div className="goal-summary-row">
              <span className="progress-meta">Authentication</span>
              <span className="task-badge badge-success">Active</span>
            </div>

            <div className="goal-summary-row">
              <span className="progress-meta">Account Type</span>
              <span className="progress-meta">Google OAuth</span>
            </div>

            <div className="goal-summary-row">
              <span className="progress-meta">Status</span>
              <span className="progress-meta">Signed in</span>
            </div>
          </div>

          <div className="goal-actions" style={{ marginTop: "18px" }}>
            <button className="danger-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;