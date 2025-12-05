import React from "react";
import { Clock, Package, DollarSign, BarChart2 } from "lucide-react";
import { FaGhost } from "react-icons/fa";

const StatCard = ({ title, value, icon, highlight }) => (
  <div
    className={`rounded-2xl p-10 border min-h-[180px] flex flex-col justify-between ${
      highlight
        ? "bg-gradient-to-b from-[#7c3aed] to-[#4b2f66] border-[#a78bfa]"
        : "bg-[#18181c] border-[#23232a]"
    }`}
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg text-gray-300 mb-3 font-medium">{title}</h3>
        <p className="text-5xl font-extrabold text-white tracking-wide">{value}</p>
      </div>
      {React.createElement(icon, {
        className: `h-12 w-12 ${highlight ? "text-white" : "text-gray-300"}`
      })}
    </div>
    {highlight && (
      <div className="mt-6 h-20 flex items-end gap-1">
        {[10, 16, 8, 14, 11, 15, 12].map((h, i) => (
          <div
            key={i}
            className="w-2 rounded bg-purple-300"
            style={{ height: `${h * 2}px` }}
          ></div>
        ))}
      </div>
    )}
  </div>
);

const StoryCard = ({ title, type, time }) => (
  <div className="flex justify-between items-center bg-[#19191d] border border-[#23232a] rounded-2xl p-6 hover:border-[#a78bfa] transition-all duration-200">
    <div>
      <div className="flex items-center gap-4">
        <h3 className="text-2xl text-white font-semibold">{title}</h3>
        <span className="text-lg text-purple-400 font-medium">{type}</span>
        <span className="text-sm text-gray-400">{time}</span>
      </div>
      <p className="text-base text-gray-400 mt-2">Story in Progress</p>
    </div>
    <button className="bg-purple-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-600 transition-all">
      Open
    </button>
  </div>
);

const Dashboard = () => {
  return (
    <div className="relative flex-1 bg-[#0b0b0d] text-white p-10 min-h-screen overflow-hidden">
      {/* Floating Ghosts (Increased Size) */}
      <FaGhost className="absolute top-10 left-20 text-white/10 text-5xl animate-bounce" />
      <FaGhost className="absolute top-1/4 right-16 text-white/20 text-6xl animate-pulse" />
      <FaGhost className="absolute bottom-20 left-10 text-white/15 text-7xl animate-spin-slow" />
      <FaGhost className="absolute top-1/3 left-1/3 text-white/10 text-7xl animate-pulse" />
      <FaGhost className="absolute bottom-32 right-32 text-white/20 text-6xl animate-bounce" />
      <FaGhost className="absolute top-16 right-1/4 text-white/10 text-5xl animate-spin-slow" />
      <FaGhost className="absolute bottom-10 left-1/2 text-white/15 text-7xl animate-pulse" />
      <FaGhost className="absolute top-2/3 right-1/4 text-white/20 text-7xl animate-bounce" />
      <FaGhost className="absolute bottom-1/4 left-1/4 text-white/15 text-6xl animate-pulse" />
      <FaGhost className="absolute top-1/2 right-10 text-white/10 text-5xl animate-spin-slow" />

      {/* Welcome Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold mb-2">Welcome Shaad</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <StatCard
          title="Total Stories Generated"
          value="08"
          icon={BarChart2}
          highlight
        />
        <StatCard title="Stories in Progress" value="05" icon={Clock} />
        <StatCard title="Credits" value="200" icon={DollarSign} />
        <StatCard title="Orders Dispatched" value="03" icon={Package} />
      </div>

      {/* Last Working Story Section */}
      <div>
        <h2 className="text-2xl text-gray-300 mb-6 font-semibold">
          Last Working Story
        </h2>
        <div className="space-y-6">
          <StoryCard
            title="Shadows Under the Silver Moon"
            type="Child Birthday"
            time="1d ago"
          />
          <StoryCard
            title="The Secret Doorway"
            type="Child Birthday"
            time="1d ago"
          />
          <StoryCard
            title="Shadows Under the Silver Moon"
            type="Child Birthday"
            time="1d ago"
          />
          <StoryCard
            title="The Secret Doorway"
            type="Child Birthday"
            time="1d ago"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
