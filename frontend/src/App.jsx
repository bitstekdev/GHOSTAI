import { useState, useEffect } from "react";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Components
import Homee from "./components/Home/Homee";
import SignUp from "./components/Home/SignUp";
import SignIn from "./components/Home/SignIn";
import Sidebar from "./components/pages/SideBar";
import Dashboard from "./components/pages/Dashboard";
import GenerateStory from "./components/pages/GenerateStory";
import FlipBook from "./components/pages/FlipBook";
import CharacterDump from "./components/pages/CharacterDump";
import DataDump from "./components/pages/DataDump";
import Profile from "./components/pages/Profile";
import Stories from "./components/pages/Stories";
import OrderHistory from "./components/pages/OrderHistory";

// Route guards
// import ProtectedRoute from "./components/routes/ProtectedRoute";
// import PublicRoute from "./components/routes/PublicRoute";

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
    <Router>
      <Routes>
        {/* Public routes */}
        {/* <Route element={<PublicRoute />}> */}
        <Route path="/" element={<Homee />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        {/* </Route> */}

        {/* Protected / private routes */}
        {/* <Route element={<ProtectedRoute />}> */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generatestory" element={<GenerateStory />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/flipbook" element={<FlipBook />} />
          <Route path="/characterdump" element={<CharacterDump />} />
          <Route path="/datadump" element={<DataDump />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
        </Route>
        {/* </Route> */}
      </Routes>
    </Router>
  );
};

export default App;
