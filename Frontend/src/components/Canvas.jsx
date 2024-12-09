import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Toolbar from "./Toolbar";

const socket = io("http://localhost:5000"); 

const Canvas = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    ctxRef.current = ctx;
  }, [color, lineWidth]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clearCanvas");
  };

  const exportAsImage = async () => {
    const canvas = canvasRef.current;
    const image = await html2canvas(canvas).then((canvas) =>
      canvas.toDataURL("image/png")
    );

    const link = document.createElement("a");
    link.href = image;
    link.download = "whiteboard.png";
    link.click();
  };

  const exportAsPDF = async () => {
    const canvas = canvasRef.current;
    const image = await html2canvas(canvas).then((canvas) =>
      canvas.toDataURL("image/png")
    );

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(image);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(image, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("whiteboard.pdf");
  };

  const startDrawing = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    setStartPos({ x, y });

    if (tool === "circle" || tool === "triangle") return;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (tool === "pen") {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    } else if (tool === "eraser") {
      ctxRef.current.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
    }
  };

  const stopDrawing = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (tool === "circle" || tool === "triangle") {
      const ctx = ctxRef.current;

      if (tool === "circle") {
        const radius = Math.sqrt(
          Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (tool === "triangle") {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.lineTo(startPos.x * 2 - x, y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  return (
    <div>
      <Toolbar
        setTool={setTool}
        setColor={setColor}
        setLineWidth={setLineWidth}
        clearCanvas={clearCanvas}
        exportAsImage={exportAsImage}
        exportAsPDF={exportAsPDF}
      />
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ border: "1px solid black" }}
      ></canvas>
    </div>
  );
};

export default Canvas;
