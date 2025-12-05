import {
  LayoutDashboard,
  FilePlus,
  BookOpenText,
  BookMarked,
  User,
  History,
  ChevronDown,
  LogOut,
} from "lucide-react";
import Logo from "../../assets/images/logo.gif";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { FaGhost } from "react-icons/fa";

const GhostSidebar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [ghostOffsets, setGhostOffsets] = useState(() => Array(10).fill(0));

  useEffect(() => {
    // generate random horizontal offsets between -30% and 30% for each ghost
    const offsets = Array.from({ length: 10 }, () => Math.floor(Math.random() * 61) - 30);
    setGhostOffsets(offsets);
    // store globally so CSS-inlined ghosts can access if needed elsewhere
    try {
      window.__ghostOffsets = offsets;
    } catch {
      // ignore (e.g., SSR)
    }
  }, []);

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "generate", label: "Generate Story", icon: FilePlus },
    {
      value: "knowledge",
      label: "Knowledge Base",
      icon: BookOpenText,
      children: [
        { value: "character", label: "Character" },
        { value: "data", label: "Data Dump" },
      ],
    },
    { value: "stories", label: "My Stories", icon: BookMarked },
    { value: "profile", label: "Profile", icon: User },
    { value: "orders", label: "Order History", icon: History },
  ];

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-screen w-80 bg-[#0b0b0b] border-r border-[#1c1c1c] z-40">
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-6 border-b border-[#1c1c1c]">
        <img src={Logo} alt="GHOST.ai Logo" className="h-12 rounded-md" />
        <h1 className="text-3xl font-bold text-white tracking-wide">GHOST.ai</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-5 space-y-3 mt-4">
        {tabs.map((tab) => (
          <div key={tab.value}>
            <Button
              onClick={() => {
                if (tab.children) {
                  setKnowledgeOpen(!knowledgeOpen);
                } else {
                  setActiveTab(tab.value);
                  if (tab.value === "generate") {
                    navigate("/generate");
                  } else if (tab.value === "dashboard") {
                    navigate("/main");
                  } else if (tab.value === "stories") {
                    navigate("/stories");
                  } else if (tab.value === "orders") {
                    navigate("/orders");
                  } else if (tab.value === "profile") {
                    navigate("/profile");
                  }
                }
              }}
              className={`w-full justify-start bg-transparent text-gray-300 hover:bg-[#1f1b2e] hover:text-white text-xl py-4 px-4 rounded-xl transition-all ${
                activeTab === tab.value ? "bg-[#2a1f4f] text-white" : ""
              }`}
            >
              <tab.icon className="h-7 w-7 mr-4 text-white" /> {/* ⬅ 30% larger */}
              {tab.label}
              {tab.children && (
                <ChevronDown
                  className={`ml-auto h-5 w-5 transition-transform ${
                    knowledgeOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </Button>

            {tab.children && knowledgeOpen && (
              <div className="ml-10 mt-2 space-y-2">
                {tab.children.map((child) => (
                  <Button
                    key={child.value}
                    onClick={() => {
                      setActiveTab(child.value);
                      if (child.value === "character") {
                        navigate("/character");
                      } else if (child.value === "data") {
                        navigate("/datadump");
                      }
                    }}
                    className={`w-full justify-start bg-transparent text-base text-gray-400 hover:text-white ${
                      activeTab === child.value ? "text-purple-400" : ""
                    }`}
                  >
                    • {child.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Floating Ghost Animations (random horizontal offsets up to ±30%) */}
      {
        (() => {
          const ghostClasses = [
            "absolute top-10 left-20 text-white/10 text-5xl animate-bounce",
            "absolute top-1/4 right-16 text-white/20 text-6xl animate-pulse",
            "absolute bottom-20 left-10 text-white/15 text-7xl animate-spin-slow",
            "absolute top-1/3 left-1/3 text-white/10 text-8xl animate-pulse",
            "absolute bottom-32 right-32 text-white/20 text-6xl animate-bounce",
            "absolute top-16 right-1/4 text-white/10 text-5xl animate-spin-slow",
            "absolute bottom-10 left-1/2 text-white/15 text-7xl animate-pulse",
            "absolute top-2/3 right-1/4 text-white/20 text-8xl animate-bounce",
            "absolute bottom-1/4 left-1/4 text-white/15 text-6xl animate-pulse",
            "absolute top-1/2 right-10 text-white/10 text-5xl animate-spin-slow",
          ];

          return ghostClasses.map((cls, i) => (
            <FaGhost
              key={i}
              className={cls}
              style={{ transform: `translateX(${ghostOffsets[i] ?? 0}%)` }}
            />
          ));
        })()
      }

      {/* Footer */}
      <div className="p-5 border-t border-[#1c1c1c] mt-2">
        <Button
          variant="outline"
          className="w-full text-lg text-gray-300 hover:bg-[#1f1b2e] hover:text-white border-none py-3"
        >
          <LogOut className="h-5 w-5 mr-3 text-purple-400" /> Logout
        </Button>
      </div>
    </aside>
  );
};

export default GhostSidebar;
