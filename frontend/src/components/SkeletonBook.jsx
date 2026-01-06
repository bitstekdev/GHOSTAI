const SkeletonBook = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="relative">
        <div className="w-[900px] h-[500px] rounded-2xl bg-gray-800 animate-pulse" />
        <div className="absolute inset-4 rounded-xl bg-gray-700/40" />
      </div>
    </div>
  );
};

export default SkeletonBook;
