import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import useAuthStore from "../store/useAuthStore";

function ProfilePage() {
  const { user, logout, error } = useAuthStore();

  if (!user) {
    return (
      <div className="daily-page">
        <div>
          <h2 className="section-title">Profile</h2>
          <p className="section-subtitle">
            Sign in with Google to access your planner.
          </p>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="progress-card">
          <h3 className="card-title" style={{ marginBottom: "16px" }}>
            Sign In
          </h3>
          <GoogleLoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="daily-page">
      <div>
        <h2 className="section-title">Profile</h2>
        <p className="section-subtitle">Signed in user information</p>
      </div>

      <div className="progress-card">
        <div className="progress-top">
          <h3 className="card-title">{user.name}</h3>
          <button onClick={logout}>Logout</button>
        </div>

        <p className="progress-meta">Email: {user.email}</p>
        <p className="progress-meta">Provider: {user.provider}</p>

        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              marginTop: "12px",
            }}
          />
        )}

        <div style={{ marginTop: "18px" }}>
          <p className="progress-meta">
            Your planner pages are now protected behind Google login.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;