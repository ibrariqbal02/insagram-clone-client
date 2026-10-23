import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMe } from "../hooks/useAuth";
import { useChatSocket } from "../hooks/useSocket";
import PageSpinner from "../components/ui/PageSpinner";

const ProtectedRoute = () => {
  const { data, isLoading, isError } = useMe();
  const location = useLocation();

  // Connects the chat socket for the lifetime of any authenticated route
  // and keeps it disconnected otherwise (no-op until data.user is set).
  useChatSocket(data?.user?._id);

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" replace />;
  }

  // New (and not-yet-migrated) users land on onboarding before anything else.
  if (!data.user.onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
