import { useState, useEffect } from "react";
import "./index.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { TourProvider } from "./context/TourContext";

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
// import BackgroundGenerator from "./components/pages/BackgroundGenerator";
// import GenerateCovers from "./components/pages/GenerateCovers";
import CommercingRoot from "./components/pages/CommercingRoot";
import GeneratorPage from "./components/pages/GeneratorPage";
import PlansPage from "./components/pages/PlansPage";
// import BackgroundGenerator from "./components/pages/BackgroundGenerator";
// import GenerateCovers from "./components/pages/GenerateCovers";

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
    <TourProvider>
      <div className="min-h-screen bg-black">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          sidebarShown={sidebarShown}
          setSidebarShown={setSidebarShown}
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarShown ? "pl-64" : "pl-16"
        } ${sidebarOpen ? "blur-sm md:blur-0" : ""}`}>
        <Outlet />
      </main>
      </div>
    </TourProvider>
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
        <Route path="/verify-email/" element={<VerifyEmail />} />
        </Route>

        {/* Protected / private routes */}
        <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generatestory" element={<GenerateStory />} />
          <Route path="/templateselection/:storyId" element={<TemplateSelection />} />
          <Route path="/flipbook/:storyId" element={<CommercingRoot />} />
          <Route path="/flipbook/mockup" element={<FlipBookMockUp />} />
          <Route path="/characterdump" element={<CharacterDump />} />
          <Route path="/datadump" element={<DataDump />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/questioner/:storyId" element={<QuestionerPage />} />
          <Route path="/titlegenerator/:storyId" element={<TitleGeneratorPage />} />
          <Route path="/generatorPage/:storyId" element={<GeneratorPage />} />
          <Route path="/plans" element={<PlansPage />} />
          {/* <Route path="/backgroundgenerator/:storyId" element={<BackgroundGenerator />} /> */}
          {/* <Route path="/generatecovers/:storyId" element={<GenerateCovers />} /> */}

          <Route path="*" element={<Navigate to="/generatestory" replace />} />
        </Route>
        </Route>
      </Routes>
  );
};

export default App;
