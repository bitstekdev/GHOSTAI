const SocketIO = require("socket.io");
let io;

function initSocket(server) {
  io = SocketIO(server, {
    cors: {
      origin: "http://localhost:5173", 
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-job", (jobId) => {
      socket.join(jobId);
    });
  });
}

function emitJobUpdate(jobId, payload) {
  if (io) {
    io.to(jobId).emit("job-update", payload);
  }
}

module.exports = { initSocket, emitJobUpdate };
