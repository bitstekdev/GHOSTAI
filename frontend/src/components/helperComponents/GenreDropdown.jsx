import { useState } from "react";

const GenreDropdown = ({
  value,
  onSelect,
  customGenres,
  onNewCustomGenre
}) => {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const standardGenres = [
    "Fantasy",
    "Adventure",
    "Family",
    "Mystery",
    "Housewarming",
    "Corporate Promotion",
    "Marriage",
    "Baby Shower",
    "Birthday",
    "Sci-Fi",
  ];

  return (
    <div className="w-56">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="
          w-full bg-[#0f172a]
          border border-gray-700
          rounded-lg px-4 py-2
          text-left text-gray-300
          hover:border-purple-500
          transition
        "
      >
        {value || "Choose genre"}
      </button>

      {/* Dropdown (in-flow, chat-style) */}
      {open && (
        <div
          className="
            mt-2 w-full
            bg-[#020617]
            border border-gray-800
            rounded-xl
            shadow-lg
          "
        >
          {standardGenres.map((g) => (
            <div
              key={g}
              onClick={() => {
                onSelect(g);
                setOpen(false);
              }}
              className="
                px-4 py-2
                text-sm text-gray-200
                hover:bg-purple-600/20
                hover:text-white
                cursor-pointer
              "
            >
              {g}
            </div>
          ))}

          <div className="border-t border-gray-700 my-1" />

          {/* Custom genre toggle */}
          <div
            onClick={() => setShowCustom(prev => !prev)}
            className="
              px-4 py-2
              text-sm text-gray-200
              flex items-center justify-between
              hover:bg-purple-600/20
              cursor-pointer
            "
          >
            ✨ Customise Genre
            <span>{showCustom ? "▾" : "▸"}</span>
          </div>

          {/* Custom genres (expand DOWN, not sideways) */}
          {showCustom && (
            <div className="ml-4 mb-2">
              <div
                onClick={() => {
                  onNewCustomGenre();
                  setOpen(false);
                }}
                className="
                  px-4 py-2
                  text-sm text-gray-200
                  hover:bg-purple-600/20
                  cursor-pointer
                "
              >
                ➕ New Custom Genre
              </div>

              {customGenres.map((cg) => (
                <div
                  key={cg}
                  onClick={() => {
                    onSelect(cg);
                    setOpen(false);
                  }}
                  className="
                    px-4 py-2
                    text-sm text-gray-200
                    hover:bg-purple-600/20
                    cursor-pointer
                  "
                >
                  🧠 {cg}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenreDropdown;
