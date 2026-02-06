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
  ChevronUp,
  ChevronRight,
  User,
  History,
  LogOut,
  BookKey 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/images/Ghostlogo1.png";
import { AppContext } from "../../context/AppContext";

export default function Sidebar({
  isOpen,
  setIsOpen,
  sidebarShown,
  setSidebarShown,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  const navigate = useNavigate();
  const { logout, activeSubscription, fetchActiveSubscription, navigateTo  } = useContext(AppContext);


  // Sidebar visible if manually opened OR hovered
  const shouldShow = isOpen || isHovered;

  useEffect(() => {
  if (!shouldShow) setPlanOpen(false);
}, [shouldShow]);


  useEffect(() => {
    setSidebarShown(shouldShow);
  }, [shouldShow, setSidebarShown]);

useEffect(() => {
  if (!activeSubscription) {
    fetchActiveSubscription();
  }
}, [activeSubscription, fetchActiveSubscription]);


  // Determine plan info
  const planInfo = activeSubscription ? { plan: activeSubscription.subscription } : null;

  console.log("Active Subscription in Sidebar:", activeSubscription);
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
        { id: "characterdump", label: "Character", path: "/characterdump", locked: true },
        { id: "datadump", label: "Data Dump", path: "/datadump", locked: true },
      ]
    },

    { id: "stories", label: "My Stories", icon: BookOpen, path: "/stories" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "orders", label: "Order History", icon: History, path: "/orderhistory" },
  ];


  // Navigate to upgrade plan page
  const handleNavigate = () => {
    if(!planInfo.plan?.name){
    navigateTo("/plans");
    } else {
    navigateTo("/upgradeplan");
    }
  }

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


{/* CURRENT PLAN SECTION */}
{planInfo && (
  <>
    {/* COLLAPSED SIDEBAR → ICON ONLY */}
    {!shouldShow && (
      <div className="mx-auto mb-4 flex justify-center">
        <button
          onClick={() => {
            setIsOpen(true);
            setPlanOpen(true);
          }}
          className="p-3 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
          title="Current Plan"
        >
          <BookKey size={22} />
        </button>
      </div>
    )}

    {/* EXPANDED SIDEBAR → FULL CARD */}
    {shouldShow && (
      <div className="mx-3 mb-4 rounded-xl border border-gray-700 bg-gray-900/80 text-gray-200">
        
        {/* HEADER */}
        <button
          onClick={() => setPlanOpen(!planOpen)}
          className="w-full flex items-center justify-between p-3"
        >
          <div>
            <div className="text-[11px] uppercase tracking-wide text-gray-400">
              Current Plan
            </div>
            <div className="text-sm font-medium">
              {planInfo.plan?.name || "No Active Plan"}
            </div>
          </div>
          
            {planInfo?.plan?.code !== "FREE-FOR-DEVELOPMENT-ONLY" && (
              planOpen ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )
            )}
            
        </button>

      {/* EXPANDABLE CONTENT */}
      {planInfo?.plan?.code !== "FREE-FOR-DEVELOPMENT-ONLY" && planOpen && (
        <div className="border-t border-gray-700 px-3 pb-3">
          <button
            onClick={() => handleNavigate()}
            className="mt-3 w-full rounded-lg border border-gray-600 bg-gray-800 py-2 text-sm text-gray-200 hover:bg-gray-700 transition"
          >
          {planInfo.plan ?  "Upgrade Plan" : "Buy Plan"}
          </button>
        </div>
      )}
      </div>
    )}
  </>
)}



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
