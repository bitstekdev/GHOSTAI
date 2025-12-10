import { useState, useEffect } from "react";
import "./index.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Components
import Homee from "./components/Home/Homee";
import SignUp from "./components/Home/SignUp";
import SignIn from "./components/Home/SignIn";
import Sidebar from "./components/pages/SideBar";
import Dashboard from "./components/pages/Dashboard";
import GenerateStory from "./components/pages/GenerateStory";
import FlipBook from "./components/pages/FlipBook";
import FlipBookMockUp from "./components/pages/FlipBookMockUp.jsx";
import CharacterDump from "./components/pages/CharacterDump";
import DataDump from "./components/pages/DataDump";
import Profile from "./components/pages/Profile";
import Stories from "./components/pages/Stories";
import OrderHistory from "./components/pages/OrderHistory";
import VerifyEmail from "./components/pages/VerifyEmail";
import QuestionerPage from "./components/pages/QuestionerPage";
import TemplateSelection from "./components/pages/TemplateSelection";
import TitleGeneratorPage from "./components/pages/TitleGeneratorPage";

// Route guards
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import PublicRoute from "./components/Routes/PublicRoute";

const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarShown, setSidebarShown] = useState(false);

  useEffect(() => {
    window.updateSidebarState = (v) => setSidebarShown(v);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        sidebarShown={sidebarShown}
        setSidebarShown={setSidebarShown}
      />

      <main
        className={`min-h-screen transition-all duration-300 
    ${sidebarShown ? "pl-64" : "pl-16"}
  `}>
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  return (
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
        <Route path="/" element={<Homee />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Protected / private routes */}
        <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generatestory" element={<GenerateStory />} />
          <Route path="/templateselection" element={<TemplateSelection />} />
          <Route path="/flipbook/:storyId" element={<FlipBook />} />
          <Route path="/flipbook/mockup" element={<FlipBookMockUp />} />
          <Route path="/characterdump" element={<CharacterDump />} />
          <Route path="/datadump" element={<DataDump />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/questioner" element={<QuestionerPage />} />
          <Route path="/titlegenerator" element={<TitleGeneratorPage />} />
        </Route>
        </Route>
      </Routes>
  );
};

export default App;
