// import { useState, useEffect } from "react";
// import "./index.css";
// import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// // Components
// import SignUp from "./home/SignUp";
// import SignIn from "./home/SignIn";
// import Sidebar from "./pages/SideBar";
// import Dashboard from "./pages/Dashboard";
// import OrderHistory from "./pages/OrderHistory";
// import VerifyEmail from "./pages/VerifyEmail";
// // import CommercingRoot from "./components/pages/CommercingRoot";
// import PlansPage from "./pages/PlansPage";

// // Route guards
// import ProtectedRoute from "./Routes/ProtectedRoute";
// import PublicRoute from "./Routes/PublicRoute";

// const ProtectedLayout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarShown, setSidebarShown] = useState(false);

//   useEffect(() => {
//     window.updateSidebarState = (v) => setSidebarShown(v);
//   }, []);

//   return (
//     <TourProvider>
//       <div className="min-h-screen bg-black">
//         <Sidebar
//           isOpen={sidebarOpen}
//           setIsOpen={setSidebarOpen}
//           sidebarShown={sidebarShown}
//           setSidebarShown={setSidebarShown}
//         />

//         {sidebarOpen && (
//           <div
//             className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
//             onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       <main
//         className={`min-h-screen transition-all duration-300 ${
//           sidebarShown ? "pl-64" : "pl-16"
//         } ${sidebarOpen ? "blur-sm md:blur-0" : ""}`}>
//         <Outlet />
//       </main>
//       </div>
//     </TourProvider>
//   );
// };

// const App = () => {
//   return (
//       <Routes>
//         {/* Public routes */}
//         <Route element={<PublicRoute />}>
//         <Route path="/" element={<SignUp />} />
//         <Route path="/signin" element={<SignIn />} />
//         <Route path="/verify-email/" element={<VerifyEmail />} />
//         </Route>

//         {/* Protected / private routes */}
//         <Route element={<ProtectedRoute />}>
//         <Route element={<ProtectedLayout />}>
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/orderhistory" element={<OrderHistory />} />
//           <Route path="/plans" element={<PlansPage />} />

//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Route>
//         </Route>
//       </Routes>
//   );
// };

// export default App;

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./index.css";

// Pages
import SignUp from "./home/SignUp";
import SignIn from "./home/SignIn";
import Sidebar from "./pages/SideBar";
import Dashboard from "./pages/Dashboard";
import OrderHistory from "./pages/OrderHistory";
import VerifyEmail from "./pages/VerifyEmail";
import PlansPage from "./pages/PlansPage";

// Route guards
import ProtectedRoute from "./Routes/ProtectedRoute";
import PublicRoute from "./Routes/PublicRoute";

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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarShown ? "pl-64" : "pl-16"
        } ${sidebarOpen ? "blur-sm md:blur-0" : ""}`}
      >
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
        <Route path="/" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orderhistory" element={<OrderHistory />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
