import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  PenTool,
  BookOpen,
  BookMarked,
  ChevronDown,
  ChevronRight,
  User,
  History
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/images/logo.gif";

export default function Sidebar({
  isOpen,
  setIsOpen,
  sidebarShown,
  setSidebarShown,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const navigate = useNavigate();

  // Sidebar visible if manually opened OR hovered
  const shouldShow = isOpen || isHovered;

  useEffect(() => {
    setSidebarShown(shouldShow);
  }, [shouldShow, setSidebarShown]);

  // Menu list + routing paths
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "generate", label: "Generate Story", icon: PenTool, path: "/generatestory" },

    // DROPDOWN SECTION (Knowledge Base)
    {
      id: "knowledge",
      label: "Knowledge Base",
      icon: BookMarked,
      dropdown: true,
      items: [
        { id: "characterdump", label: "Character", path: "/characterdump" },
        { id: "datadump", label: "Data Dump", path: "/datadump" },
      ]
    },

    { id: "stories", label: "My Stories", icon: BookOpen, path: "/stories" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "orders", label: "Order History", icon: History, path: "/orderhistory" },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gray-900 transition-all duration-300 z-50 
        ${shouldShow ? "w-64" : "w-16"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isOpen) setIsHovered(false);
      }}
      onClick={() => {
        // Clicking anywhere toggles only if closed
        if (!isOpen) setIsOpen(true);
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">

        <div className="flex items-center gap-2">
          {!shouldShow && (
            <button onClick={() => setIsOpen(true)} className="text-white">
              <Menu size={24} />
            </button>
          )}

          {shouldShow && (
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="GHOST.ai Logo" className="h-10 w-auto object-contain" />
              <span className="text-white text-2xl font-bold ml-[-14px]">GHOST.ai</span>
            </div>
          )}
        </div>

        {isOpen && (
          <button onClick={() => setIsOpen(false)} className="text-white">
            <X size={22} />
          </button>
        )}
      </div>

      {/* MENU */}
      <nav className="mt-8">
        {menuItems.map((item) => {
          // Handle dropdown section
          if (item.dropdown) {
            return (
              <div key={item.id}>
                {/* MAIN DROPDOWN BUTTON */}
                <button
                  onClick={() => setKnowledgeOpen(!knowledgeOpen)}
                  className="w-full flex items-center justify-between px-4 py-5 text-gray-300 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    {shouldShow && <span>{item.label}</span>}
                  </div>

                  {shouldShow &&
                    (knowledgeOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
                </button>

                {/* SUB ITEMS */}
                {knowledgeOpen && shouldShow && (
                  <div className="ml-10 mt-1 flex flex-col gap-1">
                    {item.items.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => navigate(sub.path)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800 px-2 py-1 text-left"
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Normal menu items
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-5 text-gray-300 hover:bg-gray-800"
            >
              <item.icon size={20} />
              {shouldShow && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

    </div>
  );
}
