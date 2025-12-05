import React, { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, PenTool, BookOpen, User, History } from "lucide-react";
import logoImg from "../../assets/images/logo.gif"; 

export default function Sidebar({ isOpen, setIsOpen, currentPage, setCurrentPage, setSidebarShown }) {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "generate", icon: PenTool, label: "Generate Story" },
    { id: "knowledge", icon: BookOpen, label: "Knowledge Base" },
    { id: "stories", icon: BookOpen, label: "My Stories" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "orders", icon: History, label: "Order History" }
  ];

  // Sidebar visible if manually opened OR hovered
  const shouldShow = isOpen || isHovered;

  // Notify parent (App) so main content shifts
  useEffect(() => {
    setSidebarShown(shouldShow);
  }, [shouldShow, setSidebarShown]);

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gray-900 transition-all duration-300 z-50 
        ${shouldShow ? "w-64" : "w-16"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        // DO NOT close if user opened it manually ↓
        if (!isOpen) setIsHovered(false);
      }}
      onClick={() => {
        // Clicking anywhere toggles only if closed
        if (!isOpen) setIsOpen(true);
      }}
    >

<div className="flex items-center justify-between p-4 border-b border-gray-800">

  {/* LEFT SIDE — SHOWS DIFFERENT UI BASED ON SIDEBAR STATE */}
  <div className="flex items-center gap-2">

    {/* COLLAPSED → SHOW HAMBURGER */}
    {!shouldShow && (
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-white"
      >
        <Menu size={24} />
      </button>
    )}

    {/* EXPANDED → SHOW LOGO + TEXT */}
    {shouldShow && (
      <div className="flex items-center gap-2">
        <img 
          src={logoImg} 
          alt="GHOST.ai Logo" 
          className="h-15 w-auto object-contain"
        />
        <span className="text-white text-2xl font-bold ml-[-14px]">GHOST.ai</span>
      </div>
    )}
  </div>

  {/* CLOSE BUTTON — ONLY WHEN FULLY OPENED */}
  {isOpen && (
    <button onClick={() => setIsOpen(false)} className="text-white">
      <X size={22} />
    </button>
  )}

</div>



      <nav className="mt-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 transition-colors 
              ${currentPage === item.id ? "bg-gray-800 text-white border-l-4 border-purple-500" : ""}`}
          >
            <div className="min-w-[24px] flex justify-center">
               <item.icon size={20} />
            </div>
            <span className={`${shouldShow ? "opacity-100" : "opacity-0"} transition-opacity`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
