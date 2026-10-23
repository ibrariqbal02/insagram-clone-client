import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../hooks/useAuth";
import { useChatSocket } from "../hooks/useSocket";
import PageSpinner from "../components/ui/PageSpinner";

const ProtectedRoute = () => {
  const { data, isLoading, isError } = useMe();

  // Connects the chat socket for the lifetime of any authenticated route
  // and keeps it disconnected otherwise (no-op until data.user is set).
  useChatSocket(data?.user?._id);

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
