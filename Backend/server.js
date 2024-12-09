const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});


let canvasState = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.emit("loadCanvas", canvasState);

  socket.on("draw", (data) => {

    canvasState.push(data);
    socket.broadcast.emit("draw", data);
  });

  socket.on("clearCanvas", () => {
    canvasState = []; 
    io.emit("draw", { type: "clearCanvas" }); 
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});


app.get("/", (req, res) => {
  res.send("Real-Time Collaborative Whiteboard Server is running...");
});


const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
