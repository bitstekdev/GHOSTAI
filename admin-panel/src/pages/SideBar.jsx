import { useState, useEffect, useContext } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  PenTool,
  BookOpen,
  BookMarked,
  Lock,
  ChevronDown,
  ChevronRight,
  Crown,
  History,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/Ghostlogo1.png";
import { AppContext } from "../context/AppContext";

export default function Sidebar({
  isOpen,
  setIsOpen,
  sidebarShown,
  setSidebarShown,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AppContext);


  // Sidebar visible if manually opened OR hovered
  const shouldShow = isOpen || isHovered;

  useEffect(() => {
    setSidebarShown(shouldShow);
  }, [shouldShow, setSidebarShown]);

  // Menu list + routing paths
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "create", label: "Create Plans", icon: PenTool, path: "/createplans" },
    { id: "plans", label: "Plans", icon: Crown, path: "/plans" },
    { id: "orders", label: "Orders ", icon: History, path: "/orderhistory" },
  ];

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-full bg-gray-900 transition-all duration-300 z-50 flex flex-col
          ${shouldShow ? "w-64" : "w-16"}`}
        onMouseEnter={() => {
          if (window.innerWidth >= 768) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!isOpen && window.innerWidth >= 768) setIsHovered(false);
        }}
      >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">

        <div className="flex items-center gap-2">
          {!shouldShow && (
            <button onClick={() => setIsOpen(true)} className="sidebar-menu-button text-white">
              <Menu size={24} />
            </button>
          )}

          {shouldShow && (
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="Ghostverse.ai Logo" className="h-6 w-auto object-contain" />
              <span className="text-white text-2xl font-bold ml-[-10px]">hostverse.ai</span>
            </div>
          )}
        </div>

        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="text-white"
          >
            <X size={22} />
          </button>
        )}
      </div>

        {/* MENU */}
        <nav className="mt-8 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            // Handle dropdown section
            if (item.dropdown) {
              return (
                <div key={item.id}>
                  {/* MAIN DROPDOWN BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setKnowledgeOpen(!knowledgeOpen);
                    }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sub.locked) return;
                            navigate(sub.path);
                            if (window.innerWidth < 768) setIsOpen(false);
                          }}
                          className={`text-gray-400 hover:text-white hover:bg-gray-800 px-2 py-1 text-left flex items-center justify-between ${
                            sub.locked ? "cursor-not-allowed opacity-70" : ""
                          }`}
                        >
                          <span>{sub.label}</span>
                          {sub.locked && <Lock size={14} className="text-gray-500" />}
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
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(item.path);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-5 text-gray-300 hover:bg-gray-800"
              >
                <item.icon size={20} />
                {shouldShow && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>


        {/* LOGOUT BUTTON - ANCHORED AT BOTTOM */}
        <div className="mt-auto w-full pb-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition"
          >
            <LogOut size={20} />
            {shouldShow && <span>Logout</span>}
          </button>
        </div>

      </div>
    </>
  );
}
