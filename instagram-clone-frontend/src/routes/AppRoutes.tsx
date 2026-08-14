import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PageSpinner from "../components/ui/PageSpinner";

const Login        = lazy(() => import("../pages/Login/Login"));
const Register     = lazy(() => import("../pages/Register/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword/ForgotPassword"));
const Home         = lazy(() => import("../pages/Home/Home"));
const CreatePost   = lazy(() => import("../pages/CreatePost/CreatePost"));
const Profile      = lazy(() => import("../pages/Profile/Profile"));
const Archive      = lazy(() => import("../pages/Archive/Archive"));
const MainLayout   = lazy(() => import("../components/templates/MainLayout"));
const Notifications = lazy(() => import("../pages/Notifications/Notifications"));
const Messages     = lazy(() => import("../pages/Messages/Messages"));
const Search       = lazy(() => import("../pages/Search/Search"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/create-post" element={<CreatePost />} />
              {/* Profile — own profile has no param, visiting another user uses :userId */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              {/* Both /notification and /notifications work */}
              <Route path="/notification" element={<Notifications />} />
              <Route path="/notifications" element={<Notifications />} />
              {/* Messages */}
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<Messages />} />
              {/* Archive */}
              <Route path="/archive" element={<Archive />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
