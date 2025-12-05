// import React from "react";
// import "./index.css";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Homee from "./components/Home/Homee";
// import SignUp from "./components/Home/SignUp";
// import SignIn from "./components/Home/SignIn";
// import GhostSidebar from "./components/Home/GhostSidebar";
// import Dashboard from "./components/Home/Dashboard";
// import GenerateStory from "./components/Home/GenerateStory";
// import GenerateResult from "./components/Home/GenerateResult";
// import BookPreview from "./components/Home/BookPreview";
// import Flipbook from "./components/Home/Flipbook";
// import FaceSwap from "./components/Home/FaceSwap";
// import DataDump from "./components/Home/DataDump";
// import CharacterDump from "./components/Home/CharacterDump";
// import Stories from "./components/Home/Stories";
// import OrderHistory from "./components/Home/OrderHistory";
// import Profile from "./components/Home/Profile";
// import Checkout from "./components/Home/Checkout";

// function App() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState('dashboard');

//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Homee />} />
//         <Route path="/signup" element={<SignUp />} />
//         <Route path="/signin" element={<SignIn />} />

//         {/* <Route
//           path="/main"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <Dashboard />
//               </div>
//             </div>
//           }
//         />

//         <Route
//           path="/generate"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <GenerateStory />
//               </div>
//             </div>
//           }
//         />

//         <Route
//           path="/generate/result"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <GenerateResult />
//               </div>
//             </div>
//           }
//         />

//         <Route path="/generate/preview" element={<BookPreview />} />

//         <Route
//           path="/datadump"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <DataDump />
//               </div>
//             </div>
//           }
//         />

//         <Route path="/flipbook" element={<Flipbook />} />

//         <Route
//           path="/faceswap"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <FaceSwap />
//               </div>
//             </div>
//           }
//         />

//         <Route
//           path="/character"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <CharacterDump />
//               </div>
//             </div>
//           }
//         />

//         <Route
//           path="/stories"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <Stories />
//               </div>
//             </div>
//           }
//         />

//         <Route
//           path="/orders"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <OrderHistory />
//               </div>
//             </div>
//           }
//         />

//         <Route
//           path="/profile"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <Profile />
//               </div>
//             </div>
//           }
//         />
//         <Route
//           path="/checkout"
//           element={
//             <div className="flex">
//               <GhostSidebar />
//               <div className="ml-80 flex-1">
//                 <Checkout />
//               </div>
//             </div>
//           }
//         /> */}
//         {/* Shipping is now part of the single-page Checkout flow */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;
// ==========================================================================================

import { useState, useEffect } from "react";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// Components
import Homee from "./components/Home/Homee";
import SignUp from "./components/Home/SignUp";
import SignIn from "./components/Home/SignIn";
import Sidebar from "./components/pages/SideBar";
import Dashboard from "./components/pages/Dashboard";
import GenerateStory from "./components/pages/GenerateStory";
import FlipBook from "./components/pages/FlipBook";

// Route guards (adjust import paths to where these live in your project)
// import ProtectedRoute from "./components/routes/ProtectedRoute";
// import PublicRoute from "./components/routes/PublicRoute";

const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarShown, setSidebarShown] = useState(false);

  useEffect(() => {
    window.updateSidebarState = (v) => setSidebarShown(v);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
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
        </Route>
        {/* </Route> */}
      </Routes>
    </Router>
  );
};

export default App;
