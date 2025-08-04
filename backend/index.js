import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import UserModel from "./db/userModel.js";

let targetWord = "REACT";

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

app.post("/guess", (req, res) => {
    const { currentGuess } = req.body;
    // Basic validation
    if (
        !currentGuess ||
        currentGuess.length !== 5 ||
        !/^[A-Z]+$/.test(currentGuess)
    ) {
        return res.status(400).json({ message: "Invalid guess" });
    }

    // Check guess correctness
    const isCorrect = currentGuess === targetWord;
    const colors = getColors(currentGuess, targetWord);
    if (isCorrect) {
        return res.json({
            correct: true,
            colors,
            message: "Correct!",
        });
    }
    res.json({ correct: false, colors, message: "Try again" });
});

const getColors = (guess, target) => {
    const guessLetters = guess.split("");
    const targetLetters = target.split("");
    const result = Array(5).fill("gray");

    // First pass: correct position
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result[i] = "green";
            targetLetters[i] = null; // mark used
        }
    }

    // Second pass: wrong position
    for (let i = 0; i < 5; i++) {
        if (result[i] !== "green") {
            const index = targetLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                result[i] = "yellow";
                targetLetters[index] = null; // mark as used
            }
        }
    }
    return result;
};

const rooms = {};

const emitRooms = () => {
    io.emit("updateRooms", Object.values(rooms));
};

io.on("connection", (socket) => {
    // Send current rooms to new connection
    socket.emit("updateRooms", Object.values(rooms));

    // Create a room
    socket.on("createRoom", ({ roomId, player }) => {
        console.log(
            `Creating room ${roomId} for user ${player.id} with socket.id = ${socket.id}`
        );
        rooms[roomId] = {
            id: roomId,
            players: [{ id: player.id, socketId: socket.id }],
            guessHistory: [],
            targetWord: null,
            startTime: null,
        };
        emitRooms();
    });

    // Join existing room
    socket.on("joinRoom", ({ roomId, player }) => {
        console.log(
            `Joining room ${roomId} for user ${player.id} with socket.id = ${socket.id}`
        );
        const room = rooms[roomId];
        console.log(room.players);
        if (!room || room.players.length >= 2) {
            socket.emit("error", "Cannot join");
            return;
        }
        socket.join(roomId);
        if (!room.players.find((p) => p.id === player.id))
            room.players.push({ id: player.id, socketId: socket.id });
        emitRooms();

        // When second player joins, start game
        if (room.players.length === 2) {
            room.targetWord = targetWord;
            room.startTime = Date.now();
            emitRooms();
        }
    });

    // Handle guesses
    socket.on("playerGuess", ({ roomId, userId, currentGuess }) => {
        const room = rooms[roomId];
        if (room) {
            const opponent = room.players.find((p) => p.socketId !== socket.id);
            if (opponent) {
                io.to(opponent.socketId).emit("opponentGuess", {
                    guess: currentGuess,
                    colors: getColors(currentGuess, targetWord),
                });
                if (currentGuess === targetWord) {
                    io.to(opponent.socketId).emit("endGame", {
                        winner: userId,
                    });
                }
            }
        }
    });

    // Delete a room
    socket.on("deleteRoom", ({ roomId }) => {
        delete rooms[roomId];
        emitRooms();
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Remove this socket from all rooms
        for (const roomId in rooms) {
            const room = rooms[roomId];
            // Filter out the disconnected socket
            room.players = room.players.filter((p) => p.socketId !== socket.id);

            // If room has no players left, delete it
            if (room.players.length === 0) {
                delete rooms[roomId];
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
