import "./pdf-safe.css";


const StoryPdfRenderer = ({ pages, singlePageDimensions, spreadDimensions }) => {
  return (
    <div
      id="pdf-root"
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        backgroundColor: "#ffffff", // 🔴 force safe color
      }}
    >
      {pages.map((page, index) => (
        <div
          key={index}
          style={{
            marginBottom: 20,
            width:
              page.type === "spread"
                ? spreadDimensions.width
                : singlePageDimensions.width,
            height:
              page.type === "spread"
                ? spreadDimensions.height
                : singlePageDimensions.height,
            backgroundColor: "#ffffff", // 🔴 force safe color
            overflow: "hidden",
          }}
        >
          {page.jsx}
        </div>
      ))}
    </div>
  );
};


export default StoryPdfRenderer;
