import bcrypt from "bcrypt";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import UserModel from "./db/userModel.js";
import { getColors, getTargetWord, isValidWord } from "./helper.js";

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
                        message: "Create Account Succeed",
                    });
                })
                .catch((error) => {
                    res.status(500).send({
                        status: "failed",
                        message:
                            error.errorResponse.code === 11000
                                ? "User exist"
                                : "Create Account Failed",
                    });
                });
        })
        .catch((e) => {
            res.status(500).send({
                status: "failed",
                message: "Create Account Failed",
            });
        });
});

app.post("/login", async (req, res) => {
    const { username, password: input_password } = req.body;
    const user = await UserModel.findOne({ username }).select("+password");
    const validMessage = "Login succeed";
    const invalidMessage = "Username or password incorrect";
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
            message: "Get User Info Failed",
        });
    }
});

const rooms = {};

// Helper to emit current rooms state
const emitRooms = () => {
    io.emit("updateRooms", Object.values(rooms));
};

// Function to start a new game in a room
const resetGameStatus = (room) => {
    room.startTime = Date.now();
    // Clear target words for custom mode
    if (room.mode === "custom") {
        room.players.forEach((p) => (p.targetWord = null));
    }
    io.emit("resetGameStatus");
    startNewGame(room);
};

const startNewGame = (room) => {
    // If custom mode and answers are not yet assigned
    if (room.mode === "custom") {
        const allHaveAnswers = room.players.every((p) => p.targetWord);
        if (!allHaveAnswers) {
            // Request answers from both players
            room.players.forEach((p) => {
                if (!p.targetWord) {
                    // Find opponent
                    const opponent = room.players.find((op) => op.id !== p.id);
                    if (opponent) {
                        io.to(p.socketId).emit("requestAnswerAssignment", {
                            forPlayerId: opponent.id,
                        });
                    }
                }
            });
            // Don't emit startGame yet
            return;
        }
    } else {
        // For server mode, assign targetWord to all players
        const targetWord = getTargetWord();
        room.players.forEach((p) => (p.targetWord = targetWord));
    }

    // Now, start game if answers are ready (for custom mode)
    if (room.mode === "custom") {
        const allHaveAnswers = room.players.every((p) => p.targetWord);
        if (!allHaveAnswers) return; // Wait until answers are set
    }

    // Notify players game is starting
    room.players.forEach((p) => {
        io.to(p.socketId).emit("startNewGame");
    });
    emitRooms();
};

io.on("connection", (socket) => {
    // Send current rooms to new connection
    socket.emit("updateRooms", Object.values(rooms));

    // Get list of rooms
    socket.on("getRooms", () => {
        emitRooms();
    });

    // Create a new room
    socket.on("createRoom", ({ roomId, player, mode, isSinglePlayer }) => {
        console.log(
            `Create room ${roomId} for user ${player.id} with socket.id=${socket.id}`
        );
        rooms[roomId] = {
            id: roomId,
            hostName: player.id,
            players: [{ id: player.id, socketId: socket.id }],
            mode,
            isSinglePlayer,
            startTime: null,
        };
        emitRooms();
        if (isSinglePlayer && rooms[roomId].players?.length === 1) {
            startNewGame(rooms[roomId]);
        }
    });

    // Join an existing room
    socket.on("joinRoom", ({ roomId, player }) => {
        const room = rooms[roomId];
        if (!room || room.players.length >= 2) {
            socket.emit("status", { type: "exceed" });
            return;
        }
        socket.join(roomId);
        socket.roomId = roomId; // Store roomId on socket
        if (!room.players.find((p) => p.id === player.id))
            room.players.push({ id: player.id, socketId: socket.id });
        emitRooms();
        // When second player joins, start game and handle custom question exchange
        if (room.players?.length === 2) {
            startNewGame(room);
        }
    });

    socket.on("submitCustomQuestion", ({ forPlayerId, customWord }) => {
        const roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;

        const room = rooms[roomId];

        if (
            customWord.length !== 5 ||
            !/^[A-Za-z]+$/.test(customWord) ||
            !isValidWord(customWord) // your validation function
        ) {
            socket.emit("status", { type: "invalidAssignment" });
            return;
        }

        const player = room.players.find((p) => p.id === forPlayerId);
        if (player) {
            player.targetWord = customWord;
        }
        emitRooms();
        socket.emit("status", { type: "validAssignment" });

        // Check if all players have set answers
        const allAnswered = room.players.every((p) => p.targetWord);

        if (allAnswered) {
            startNewGame(room);
        }
    });

    // Handle guesses
    socket.on("submitGuess", ({ roomId, userId, currentGuess, guesses }) => {
        const room = rooms[roomId];

        if (!room || !room.players) return;

        const player = room.players.find((p) => p.id === userId);
        if (!player || !player.targetWord) {
            socket.emit("status", { type: "unknown" });
            return;
        }

        const guess = currentGuess.toUpperCase();
        if (
            guess.length !== 5 ||
            !/^[A-Z]+$/.test(guess) ||
            !isValidWord(guess)
        ) {
            socket.emit("status", {
                type: "invalidGuess",
                props: { index: guesses.length },
            });
            return;
        }

        const colors = getColors(guess, player.targetWord);

        // Feedback to self
        // io.to(socket.id).emit("selfGuess", { guess, colors });
        socket.emit("status", {
            type: "validGuess",
            props: {
                guess,
                colors,
                index: guesses.length + 1,
                answer: player.targetWord,
            },
        });

        // Feedback to opponent
        if (room.players.length > 1) {
            room.players.forEach((p) => {
                if (p.id !== userId) {
                    io.to(p.socketId).emit("opponentGuess", { guess, colors });
                }
            });
        }

        // Win check
        if (guess === player.targetWord) {
            room.players.forEach((p) => {
                io.to(p.socketId).emit("endGame", { winner: userId });
            });
        }
    });

    // Reset game
    socket.on("replayGame", ({ roomId }) => {
        console.log("replay game");
        const room = rooms[roomId];
        if (room) {
            resetGameStatus(room);
        }
    });

    // Leave room
    socket.on("leaveRoom", ({ roomId, userId }) => {
        const room = rooms[roomId];
        if (room) {
            // Remove user from room
            room.players.forEach((p) => {
                delete p.targetWord;
            });
            room.players = room.players.filter((p) => p.id !== userId);

            // Notify remaining players
            room.players.forEach((p) => {
                io.to(p.socketId).emit("playerLeft", { userId });
            });

            if (room.players?.length > 0) {
                room.hostName = room.players[0].id;
            }

            // Delete room if empty
            if (room.players.length === 0) {
                delete rooms[roomId];
                emitRooms();
            }
        }
    });

    // Delete room
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

            // Notify remaining players
            room.players.forEach((p) => {
                io.to(p.socketId).emit("playerLeft", { userId: p.id });
            });

            // Delete room if empty
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
