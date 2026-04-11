import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

function ProtectedRoute({ children }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default ProtectedRoute;