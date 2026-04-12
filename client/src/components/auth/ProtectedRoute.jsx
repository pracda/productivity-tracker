import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

function ProtectedRoute({ children }) {
  const { user, initialized, loading } = useAuthStore();

  if (!initialized || loading) {
    return (
      <div className="page-center">
        <div className="progress-card">
          <h3 className="card-title">Checking session...</h3>
          <p className="progress-meta">Loading your planner access.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default ProtectedRoute;