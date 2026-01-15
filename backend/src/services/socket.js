const SocketIO = require("socket.io");
const ImageJob = require("../models/ImageJob");
let io;

function initSocket(server) {
  io = SocketIO(server, {
    cors: {
      origin: true, // allow all during dev
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("join-job", async (jobId) => {
      socket.join(jobId);

      const job = await ImageJob.findById(jobId);

      if (!job) return;

      socket.emit("job-update", {
        step: job.step,
        progress: job.progress,
        status: job.status,
        error: job.error || null,
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
}

function emitJobUpdate(jobId, payload) {
  if (io) {
    const roomId = jobId.toString();
    console.log("📤 Emitting update to job:", roomId, payload);
    io.to(roomId).emit("job-update", payload);
  }
}


module.exports = { initSocket, emitJobUpdate };
