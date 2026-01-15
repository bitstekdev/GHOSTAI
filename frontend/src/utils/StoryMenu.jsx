const StoryMenu = ({
  story,
  openMenuId,
  setOpenMenuId,
  onRename,
  onDelete
}) => {
  const isOpen = openMenuId === story._id;

  return (
    <div className="relative">
      <button
        onClick={() => setOpenMenuId(isOpen ? null : story._id)}
        className="text-gray-400 hover:text-white px-2"
      >
        ⋮
      </button>

      {isOpen && (
        <div className="absolute right-0 top-6 bg-[#2a2a2e] rounded-lg shadow-lg w-32 z-50">
          <button
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3e]"
            onClick={() => {
              setOpenMenuId(null);
              onRename(story);
            }}
          >
            Rename
          </button>

          <button
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#3a3a3e]"
            onClick={() => {
              setOpenMenuId(null);
              onDelete(story);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryMenu;
