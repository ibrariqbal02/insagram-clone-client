import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../hooks/useAuth";
import PageSpinner from "../components/ui/PageSpinner";

const ProtectedRoute = () => {
  const { data, isLoading, isError } = useMe();

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
