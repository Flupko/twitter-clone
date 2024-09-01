import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import SignupPage from "./pages/auth/signup/SignupPage";
import LoginPage from "./pages/auth/login/LoginPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanels";
import LoadingSpinner from "./components/common/LoadingSpinner";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

function App() {
  const {
    data: authUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.error) return null;
      if (!res.ok || data.error) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    retry: false,
  });

  const location = useLocation();

  console.log(location.pathname);
  

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg"></LoadingSpinner>
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Sidebar />}

      <div className="w-[110%]">
        {location.pathname == "/" && (
          <div className="hidden max-md:block">
            {authUser && <RightPanel />}
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignupPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/notifications"
            element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:username"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>

      <Toaster />
      <div className="hidden md:block">{authUser && <RightPanel />}</div>
    </div>
  );
}

export default App;
