import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import UserModel from "./db/userModel.js";
import { getColors, getTargetWord } from "./helper.js";

const app = express();
app.use(
    cors({
        origin: "http://localhost:3000", // your frontend URL
        methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
app.use(express.json());

// Socket.IO setup
const server = http.createServer(app); // create HTTP server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // allow your frontend origin
    },
});

// app.use(
//     cors({
//         origin: [
//             "https://sgk-online-frontend.vercel.app",
//             "http://localhost:3000",
//         ],
//         methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
//         credentials: true,
//     }),
//     bodyParser.json()
// );
// dotenv.config();

app.get("/", (req, res) => {
    res.json("connected");
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hasUser = (await UserModel.countDocuments({})) > 0;
    bcrypt
        .hash(password, 10)
        .then(async (hashedPassword) => {
            const user = {
                username: username,
                password: hashedPassword,
                role: hasUser ? ["user"] : ["admin", "user"],
            };
            await UserModel.create(user)
                .then((result) => {
                    res.status(201).send({
                        status: "success",
                        message: "成功創建帳號",
                    });
                })
                .catch((error) => {
                    res.status(500).send({
                        status: "failed",
                        message:
                            error.errorResponse.code === 11000
                                ? "已存在用戶"
                                : "創建帳號失敗",
                    });
                });
        })
        .catch((e) => {
            res.status(500).send({
                status: "failed",
                message: "儲存密碼出現錯誤",
            });
        });
});

app.post("/login", async (req, res) => {
    const { username, password: input_password } = req.body;
    const user = await UserModel.findOne({ username }).select("+password");
    const validMessage = "登入成功";
    const invalidMessage = "用戶名稱或密碼錯誤";
    if (!user) {
        res.status(401).send({
            status: "failed",
            data: [],
            message: invalidMessage,
        });
        return;
    }

    const isPasswordValid = await bcrypt.compare(input_password, user.password);
    if (!isPasswordValid) {
        res.status(401).send({
            status: "failed",
            data: [],
            message: invalidMessage,
        });
        return;
    }

    const { password, ...user_data } = user._doc;
    res.status(200).send({
        status: "success",
        data: [user_data],
        message: validMessage,
    });
});

app.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await UserModel.findOne({ _id: userId });
        res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: "獲取用戶權限失敗",
        });
    }
});
const rooms = {};

// Helper to emit current rooms state
const emitRooms = () => {
    io.emit("updateRooms", Object.values(rooms));
};

io.on("connection", (socket) => {
    // Send current rooms to new connection
    socket.emit("updateRooms", Object.values(rooms));

    // Get list of rooms
    socket.on("getRooms", () => {
        emitRooms();
    });

    // Create a new room
    socket.on("createRoom", ({ roomId, player }) => {
        console.log(
            `Create room ${roomId} for user ${player.id} with socket.id=${socket.id}`
        );
        rooms[roomId] = {
            id: roomId,
            hostName: player.id,
            players: [{ id: player.id, socketId: socket.id }],
            guessHistory: [],
            targetWord: null,
            startTime: null,
        };
        emitRooms();
    });

    // Join an existing room
    socket.on("joinRoom", ({ roomId, player }) => {
        const room = rooms[roomId];
        if (!room || room.players.length >= 2) {
            socket.emit("error", "Cannot join");
            return;
        }
        socket.join(roomId);
        if (!room.players.find((p) => p.id === player.id))
            room.players.push({ id: player.id, socketId: socket.id });
        emitRooms();

        // Start game when second player joins
        if (room.players.length === 2) {
            room.targetWord = getTargetWord();
            room.startTime = Date.now();
            emitRooms();
        }
    });

    // Handle guesses
    socket.on("submitGuess", ({ roomId, userId, currentGuess }) => {
        const room = rooms[roomId];
        if (!room || !room.targetWord) return;

        const guess = currentGuess.toUpperCase();
        if (guess.length !== 5 || !/^[A-Z]+$/.test(guess)) {
            socket.emit("error", "Invalid guess");
            return;
        }

        const colors = getColors(guess, room.targetWord);
        room.guessHistory.push({ guess, colors, userId });

        // Identify socket IDs
        const selfSocketId = room.players.find(
            (p) => p.socketId === socket.id
        )?.socketId;
        const opponentSocketId = room.players.find(
            (p) => p.socketId !== socket.id
        )?.socketId;

        // Send back to self
        if (selfSocketId) {
            io.to(selfSocketId).emit("selfGuess", { guess, colors });
        }

        // Send to opponent
        if (opponentSocketId) {
            io.to(opponentSocketId).emit("opponentGuess", { guess, colors });
        }

        // Check for win
        if (guess === room.targetWord) {
            // Notify all players
            room.players.forEach((p) =>
                io.to(p.socketId).emit("endGame", { winner: userId })
            );
        }
    });

    // Reset game
    socket.on("resetGame", ({ roomId }) => {
        const room = rooms[roomId];
        if (room) {
            room.guessHistory = [];
            room.targetWord = getTargetWord();
            room.startTime = Date.now();

            // Notify all players to start fresh
            room.players.forEach((p) => {
                io.to(p.socketId).emit("startNewGame", {
                    message: "New game started!",
                });
            });
        }
    });

    // Leave room
    socket.on("leaveRoom", ({ roomId, userId }) => {
        const room = rooms[roomId];
        if (room) {
            // Remove user
            room.players = room.players.filter((p) => p.id !== userId);

            // Notify remaining players
            room.players.forEach((p) => {
                io.to(p.socketId).emit("playerLeft", { userId });
            });

            // Delete room if empty
            if (room.players.length === 0) {
                delete rooms[roomId];
                emitRooms();
            }
        }
    });

    // Delete room (admin or special case)
    socket.on("deleteRoom", ({ roomId }) => {
        delete rooms[roomId];
        emitRooms();
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (const roomId in rooms) {
            const room = rooms[roomId];

            // Remove socket from room
            room.players = room.players.filter((p) => p.socketId !== socket.id);

            // If no players left, delete room
            if (room.players.length === 0) {
                delete rooms[roomId];
            } else {
                // Notify remaining players
                room.players.forEach((p) => {
                    io.to(p.socketId).emit("playerLeft", { userId: p.id });
                });
            }
        }
        emitRooms();
    });
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

mongoose.connect(
    "mongodb+srv://ericsiu0420:o3z1XU2OVrxiM3el@backend.r7htuqw.mongodb.net/SGK_online?retryWrites=true&w=majority&appName=Backend"
);

export default app;
