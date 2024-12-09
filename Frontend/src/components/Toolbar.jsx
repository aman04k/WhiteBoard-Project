import React from "react";

const Toolbar = ({
  setTool,
  setColor,
  setLineWidth,
  clearCanvas,
  exportAsImage,
  exportAsPDF,
}) => {
  return (
    <div className="toolbar">
      <button onClick={clearCanvas}>Clear Canvas</button>
      <button onClick={exportAsImage}>Export as Image</button>
      <button onClick={exportAsPDF}>Export as PDF</button>
      <button onClick={() => setTool("pen")}>Pen</button>
      <button onClick={() => setTool("eraser")}>Eraser</button>
      <button onClick={() => setTool("circle")}>Circle</button>
      <button onClick={() => setTool("triangle")}>Triangle</button>
      <input
        type="color"
        onChange={(e) => setColor(e.target.value)}
        title="Select Color"
      />
      <select onChange={(e) => setLineWidth(Number(e.target.value))}>
        <option value="2">Thin</option>
        <option value="5">Medium</option>
        <option value="10">Thick</option>
      </select>
    </div>
  );
};

export default Toolbar;
