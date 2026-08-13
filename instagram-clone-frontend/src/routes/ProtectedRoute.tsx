import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { data, isLoading, isError } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
