import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PageSpinner from "../components/ui/PageSpinner";

const Login          = lazy(() => import("../pages/Login/Login"));
const Register       = lazy(() => import("../pages/Register/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword/ForgotPassword"));
const Onboarding     = lazy(() => import("../pages/Onboarding/Onboarding"));
const Practice       = lazy(() => import("../pages/Practice/Practice"));
const Calls          = lazy(() => import("../pages/Calls/Calls"));
// Old Instagram-style feed — kept, just no longer linked from navigation (Phase 2.3).
const Home           = lazy(() => import("../pages/Home/Home"));
const CreatePost     = lazy(() => import("../pages/CreatePost/CreatePost"));
const Profile        = lazy(() => import("../pages/Profile/Profile"));
const Archive        = lazy(() => import("../pages/Archive/Archive"));
const MainLayout     = lazy(() => import("../components/templates/MainLayout"));
const Notifications  = lazy(() => import("../pages/Notifications/Notifications"));
const Messages       = lazy(() => import("../pages/Messages/Messages"));
const Search         = lazy(() => import("../pages/Search/Search"));
const Reels          = lazy(() => import("../pages/Reels/Reels"));
const Settings       = lazy(() => import("../pages/Settings/Settings"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/login"            element={<Login />} />
          <Route path="/register"         element={<Register />} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            {/* Onboarding runs full-screen, without the nav chrome */}
            <Route path="/onboarding"                  element={<Onboarding />} />

            <Route element={<MainLayout />}>
              {/* Simplified MVP nav (Phase 2.3): Home (Practice), Calls, Messages, Profile */}
              <Route path="/"                          element={<Practice />} />
              <Route path="/calls"                     element={<Calls />} />
              <Route path="/create-post"               element={<CreatePost />} />
              {/* Profile — own profile has no param, visiting another user uses :userId */}
              <Route path="/profile"                   element={<Profile />} />
              <Route path="/profile/:userId"           element={<Profile />} />
              <Route path="/search"                    element={<Search />} />
              {/* Both /notification and /notifications work */}
              <Route path="/notification"              element={<Notifications />} />
              <Route path="/notifications"             element={<Notifications />} />
              {/* Messages */}
              <Route path="/messages"                  element={<Messages />} />
              <Route path="/messages/:conversationId"  element={<Messages />} />
              {/* Archive */}
              <Route path="/archive"                   element={<Archive />} />
              {/* Posts/reels: hidden from navigation (Phase 2.3) but code and routes kept */}
              <Route path="/feed"                      element={<Home />} />
              <Route path="/reels"                     element={<Reels />} />
              {/* Settings */}
              <Route path="/settings"                  element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
