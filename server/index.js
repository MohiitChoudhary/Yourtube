import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadroutes from "./routes/download.js";
import watchpartyRoutes from "./routes/watchparty.js";
import subscriptionRoutes from "./routes/subscription.js";

dotenv.config();

const app = express();

// ==================================================
// CREATE HTTP SERVER
// ==================================================

const server = http.createServer(app);

// ==================================================
// MIDDLEWARE
// ==================================================

const allowedOrigins = [
  "http://localhost:3000",
  "https://yourtube-taupe.vercel.app",
  "https://yourtube-ql8f5dw96-mohit-choudhary-s-projects.vercel.app",
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : []),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "30mb",
  })
);

app.use(
  express.urlencoded({
    limit: "30mb",
    extended: true,
  })
);

// ==================================================
// STATIC UPLOADS
// ==================================================

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads"),
    {
      index: false,
    }
  )
);

// ==================================================
// BASIC TEST ROUTE
// ==================================================

app.get("/", (req, res) => {
  res.send("You tube backend is working");
});

// ==================================================
// REST API ROUTES
// ==================================================

app.use("/user", userroutes);

app.use("/video", videoroutes);

app.use("/like", likeroutes);

app.use("/watch", watchlaterroutes);

app.use("/history", historyrroutes);

app.use("/comment", commentroutes);

app.use("/download", downloadroutes);

app.use(
  "/watchparty",
  watchpartyRoutes
);
app.use(
  "/subscription",
  subscriptionRoutes
);

// ==================================================
// SOCKET.IO SETUP
// ==================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ==================================================
// SOCKET.IO CONNECTION
// ==================================================

io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.id}`
  );

  // ==================================================
  // JOIN WATCH PARTY
  // ==================================================

  socket.on(
    "join-watch-party",
    ({
      roomId,
      userId,
      username,
    }) => {
      if (!roomId) {
        console.log(
          "Cannot join Watch Party: roomId is missing"
        );

        return;
      }

      // Join Socket.IO room
      socket.join(roomId);

      // Store user information
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.username = username;

      console.log(
        `User ${
          username ||
          userId ||
          socket.id
        } joined Watch Party ${roomId}`
      );

      // Notify other users
      socket
        .to(roomId)
        .emit(
          "user-joined-watch-party",
          {
            userId,
            username,
            socketId: socket.id,
          }
        );

      // Confirm to the user who joined
      socket.emit(
        "watch-party-joined",
        {
          roomId,
          socketId: socket.id,
        }
      );
    }
  );

  // ==================================================
  // VIDEO PLAY
  // ==================================================

  socket.on(
    "video-play",
    ({
      roomId,
      currentTime,
    }) => {
      if (!roomId) return;

      console.log(
        `Video play in room ${roomId} at ${currentTime}`
      );

      // Send to everyone except sender
      socket
        .to(roomId)
        .emit(
          "video-play",
          {
            currentTime,
          }
        );
    }
  );

  // ==================================================
  // VIDEO PAUSE
  // ==================================================

  socket.on(
    "video-pause",
    ({
      roomId,
      currentTime,
    }) => {
      if (!roomId) return;

      console.log(
        `Video pause in room ${roomId} at ${currentTime}`
      );

      // Send to everyone except sender
      socket
        .to(roomId)
        .emit(
          "video-pause",
          {
            currentTime,
          }
        );
    }
  );

  // ==================================================
  // VIDEO SEEK
  // ==================================================

  socket.on(
    "video-seek",
    ({
      roomId,
      currentTime,
    }) => {
      if (!roomId) return;

      console.log(
        `Video seek in room ${roomId} to ${currentTime}`
      );

      // Send to everyone except sender
      socket
        .to(roomId)
        .emit(
          "video-seek",
          {
            currentTime,
          }
        );
    }
  );

  // ==================================================
  // WATCH PARTY CHAT
  // ==================================================

  socket.on(
    "chat-message",
    ({
      roomId,
      userId,
      username,
      message,
    }) => {
      if (!roomId || !message) {
        return;
      }

      console.log(
        `Chat message from ${
          username ||
          userId ||
          socket.id
        } in room ${roomId}`
      );

      // Send message to everyone
      // including sender
      io.to(roomId).emit(
        "chat-message",
        {
          userId,
          username,
          message,
          timestamp:
            new Date().toISOString(),
        }
      );
    }
  );

  // ==================================================
  // LEAVE WATCH PARTY
  // ==================================================

  socket.on(
    "leave-watch-party",
    ({
      roomId,
      userId,
      username,
    }) => {
      if (!roomId) return;

      // Leave Socket.IO room
      socket.leave(roomId);

      console.log(
        `User ${
          username ||
          userId ||
          socket.id
        } left Watch Party ${roomId}`
      );

      // Notify remaining users
      socket
        .to(roomId)
        .emit(
          "user-left-watch-party",
          {
            userId,
            username,
            socketId: socket.id,
          }
        );

      // Clear room data
      socket.data.roomId = null;
    }
  );

  // ==================================================
  // USER DISCONNECT
  // ==================================================

  socket.on(
    "disconnect",
    () => {
      const roomId =
        socket.data.roomId;

      const userId =
        socket.data.userId;

      const username =
        socket.data.username;

      console.log(
        `Socket disconnected: ${socket.id}`
      );

      // Notify Watch Party members
      if (roomId) {
        socket
          .to(roomId)
          .emit(
            "user-left-watch-party",
            {
              userId,
              username,
              socketId:
                socket.id,
            }
          );
      }
    }
  );
});

// ==================================================
// MONGODB CONNECTION
// ==================================================

const DBURL = process.env.DB_URL;

mongoose
  .connect(DBURL)
  .then(() => {
    console.log(
      "Mongodb connected"
    );
  })
  .catch((error) => {
    console.log(
      "MongoDB connection error:",
      error
    );
  });

// ==================================================
// START SERVER
// ==================================================

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `server running on port ${PORT}`
    );

    console.log(
      "Socket.IO server is ready"
    );
  }
);