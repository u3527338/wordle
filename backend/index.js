import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import GameRoomModel from "./db/gameRoomModel.js";
import PlayerModel from "./db/playerModel.js";
import {
    findRoomIdByPlayerId,
    getColors,
    getTargetWord,
    isValidWord,
    updateGameInfo,
} from "./helper.js";
import { configDotenv } from "dotenv";

const app = express();
configDotenv();

const MONGO_URL = process.env.MONGO_URL;
const PORT = 4000;
const CORS_ORIGIN = [
    "https://wordle-three-rho.vercel.app",
    "http://localhost:3000",
];

mongoose
    .connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.use(
    cors({
        origin: CORS_ORIGIN,
        methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    }),
    bodyParser.json()
);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CORS_ORIGIN,
    },
});

// Start server
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

const WORDLE_TRIALS = 6;
const rooms = {};

app.get("/", (req, res) => {
    res.json("connected");
});

app.post("/register", async (req, res) => {
    const { username, password, nickname } = req.body;

    if (!username || !password || !nickname) {
        return res
            .status(400)
            .json({ status: "failed", message: "Missing required fields" });
    }

    try {
        // Check if username or nickname already exists
        const existingUser = await PlayerModel.findOne({
            $or: [{ username }, { nickname }],
        });
        if (existingUser) {
            return res.status(400).json({
                status: "failed",
                message: "Username or nickname already exists",
            });
        }

        const hasUser = (await PlayerModel.countDocuments({})) > 0;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new PlayerModel({
            username,
            password: hashedPassword,
            role: hasUser ? ["user"] : ["admin", "user"],
            nickname,
            stats: {
                totalGames: 0,
                totalWins: 0,
                totalGuesses: 0,
                lastPlayed: null,
            },
        });

        await newUser.save();

        res.status(201).send({
            status: "success",
            message: "Create Account Succeed",
            data: {
                id: newUser._id,
                nickname: newUser.nickname,
            },
        });
    } catch (error) {
        res.status(500).send({
            status: "failed",
            message:
                error.code === 11000
                    ? "User or nickname already exists"
                    : "Create Account Failed",
        });
    }
});

app.post("/login", async (req, res) => {
    const { username, password: input_password } = req.body;

    try {
        const user = await PlayerModel.findOne({ username }).select(
            "+password"
        );
        const invalidMessage = "Username or password incorrect";

        if (!user) {
            return res
                .status(401)
                .json({ status: "failed", message: invalidMessage });
        }

        const isPasswordValid = await bcrypt.compare(
            input_password,
            user.password
        );
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ status: "failed", message: invalidMessage });
        }

        const { password, ...user_data } = user._doc;
        res.status(200).json({
            status: "success",
            data: user_data,
            message: "Login succeed",
        });
    } catch (err) {
        res.status(500).json({ status: "failed", message: "Login failed" });
    }
});

app.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await PlayerModel.findOne({ _id: userId });
        if (!user) {
            return res
                .status(404)
                .json({ status: "failed", message: "User not found" });
        }
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

//create room
app.post("/createRoom", async (req, res) => {
    const { mode, player } = req.body; // collect host info from request
    const roomId = uuidv4();
    const isSinglePlayer = mode === "singlePlayer";
    try {
        const newRoom = new GameRoomModel({
            roomId,
            mode,
            players: [player],
            status: isSinglePlayer ? "Playing" : "Waiting",
        });

        await newRoom.save();

        res.status(201).json({ status: "ok", message: "Room created", roomId });
    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).json({
            status: "error",
            message: "Failed to create room",
        });
    }
});

//join room
app.post("/joinRoom", async (req, res) => {
    const { roomId, player } = req.body;

    try {
        const room = await GameRoomModel.findOne({ roomId });
        if (!room || room.players.length >= 2) {
            return res.status(400).json({
                status: "error",
                message: "Room is full or doesn't exist",
            });
        }

        room.players.push(player);
        if (room.players.length === 2) {
            room.status = "Playing";
        }
        await room.save();

        res.json({ status: "ok", message: "Player joined", room });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Error joining room",
        });
    }
});

// Helper to emit current rooms state
const emitRooms = () => {
    io.emit("updateRooms", Object.values(rooms));
};

// Function to start a new game in a room
const resetGameStatus = (room, replay) => {
    room.startTime = Date.now();
    room.winner = null;
    room.players.forEach((p) => {
        p.targetWord = null;
        p.guesses = [];
        if (!replay) p.status = "Waiting";
        io.to(p.socketId).emit("resetGameStatus", replay);
    });
    room.status = "Waiting";
};

const startNewGame = (room) => {
    // If custom mode and answers are not yet assigned
    if (room.mode === "twoPlayerCustom") {
        const allHaveAnswers = room.players.every((p) => p.targetWord);
        if (!allHaveAnswers) {
            // Request answers from both players
            room.players.forEach((p) => {
                if (!p.targetWord) {
                    // Find opponent
                    const opponent = room.players.find((op) => op.id !== p.id);
                    if (opponent) {
                        if (!opponent.targetWord) {
                            io.to(p.socketId).emit("requestAnswerAssignment", {
                                opponentId: opponent.id,
                            });
                            p.status = "Assigning";
                        } else {
                            io.to(p.socketId).emit("status", {
                                type: "validAssignment",
                            });
                            p.status = "Assigned";
                        }
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
    if (room.mode === "twoPlayerCustom") {
        const allHaveAnswers = room.players.every((p) => p.targetWord);
        if (!allHaveAnswers) return; // Wait until answers are set
    }
    // Notify players game is starting
    if (room.status === "Waiting") {
        room.players.forEach((p) => {
            io.to(p.socketId).emit("startNewGame", room.mode);
            p.status = "Playing";
        });
        room.status = "Playing";
        emitRooms();
    }
};

io.on("connection", (socket) => {
    // Send current rooms to new connection
    socket.emit("updateRooms", Object.values(rooms));

    socket.on("getRooms", () => {
        emitRooms();
    });

    // CREATE ROOM
    socket.on("createRoom", ({ roomId, player, mode }) => {
        const isSinglePlayer = mode === "singlePlayer";
        console.log(
            `Create room ${roomId} for user ${player.id} with socket.id=${socket.id}`
        );
        rooms[roomId] = {
            id: roomId,
            hostPlayer: {
                id: player.id,
                name: player.name,
                socketId: socket.id,
            },
            players: [
                {
                    id: player.id,
                    name: player.name,
                    guesses: [],
                    socketId: socket.id,
                    status: "Waiting",
                },
            ],
            mode,
            isSinglePlayer,
            startTime: null,
        };
        rooms[roomId].status = "Waiting";
        emitRooms();
    });

    socket.on("reconnect", (userId) => {
        const roomId = findRoomIdByPlayerId(rooms, { id: userId });
        if (!!roomId) {
            const room = rooms[roomId];
            const player = room.players.find((p) => p.id === userId);
            player.socketId = socket.id;
            emitRooms();

            room.players.forEach((p) => {
                if (p.id !== userId) {
                    io.to(p.socketId).emit("playerRejoined", player);
                }
            });
            socket.emit("inGame", roomId);
        }
    });

    // JOIN ROOM
    socket.on("joinRoom", ({ roomId, player }) => {
        const room = rooms[roomId];
        if (!room) {
            socket.emit("status", { type: "roomNotAvailable" });
            return;
        }
        const maxPlayer = room.mode === "singlePlayer" ? 1 : 2;
        if (
            room.players.length >= maxPlayer &&
            !room.players?.find((p) => p.id === player.id)
        ) {
            socket.emit("status", { type: "roomNotAvailable" });
        }
        socket.join(roomId);
        socket.roomId = roomId;

        if (!room.players.find((p) => p.id === player.id))
            room.players.push({
                id: player.id,
                name: player.name,
                guesses: [],
                socketId: socket.id,
                status: "Waiting",
            });

        emitRooms();

        const opponent = room.players?.find((p) => p.id !== player.id);
        const self = room.players?.find((p) => p.id === player.id);
        const getGuesses = (player) => {
            return player?.guesses?.map((guess, index) => ({
                guess,
                colors: getColors(guess, player.targetWord),
                index,
                answer: player.targetWord,
            }));
        };
        socket.emit("retrieveGameStatus", {
            currentGameStatus: {
                opponent,
                gameMode: room.mode,
                gameStatus: self.status,
                guesses: getGuesses(self),
                opponentGuesses: getGuesses(opponent),
                winner: room.winner,
                answer: self.targetWord,
            },
        });
        if (
            room.players.length === 1 &&
            room.mode === "singlePlayer" &&
            room.status === "Waiting"
        ) {
            startNewGame(rooms[roomId]);
        } else if (
            room.players.length === 2 &&
            room.mode !== "singlePlayer" &&
            room.status === "Waiting"
        ) {
            room.players
                .filter((p) => p.id !== player.id)
                .forEach((p) => io.to(p.socketId).emit("playerJoined", player));
            startNewGame(room);
        }
    });

    // SUBMIT CUSTOM QUESTION
    socket.on("submitCustomQuestion", ({ opponentId, customWord }) => {
        const roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;
        const room = rooms[roomId];

        if (
            customWord.length !== 5 ||
            !/^[A-Za-z]+$/.test(customWord) ||
            !isValidWord(customWord)
        ) {
            socket.emit("status", { type: "invalidAssignment" });
            return;
        }
        const opponent = room.players.find((p) => p.id === opponentId);
        const self = room.players.find((p) => p.id !== opponentId);
        if (opponent) {
            opponent.targetWord = customWord;
        }
        socket.emit("status", { type: "validAssignment" });
        self.status = "Assigned";
        emitRooms();

        // Check if all answered
        if (room.players.every((p) => p.targetWord)) {
            startNewGame(room);
        }
    });

    // SUBMIT GUESS
    socket.on(
        "submitGuess",
        async ({ roomId, userId, currentGuess, guesses }) => {
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

            // Append guess
            player.guesses.push(guess);

            emitRooms();

            // Send feedback to current player
            socket.emit("status", {
                type: "validGuess",
                props: {
                    guess,
                    colors,
                    index: player.guesses.length,
                    answer: player.targetWord,
                },
            });

            // Feedback to opponent
            if (room.players.length > 1) {
                room.players.forEach((p) => {
                    if (p.id !== userId) {
                        io.to(p.socketId).emit("opponentGuess", {
                            guess,
                            colors,
                        });
                    }
                });
            }

            // Check for win
            const gameId = `${roomId}_${Date.now()}`;
            const createGameHistory = async ({ winnerId }) => {
                await updateGameInfo({
                    gameId,
                    userId,
                    mode: room.mode,
                    players: room.players.map(({ socketId, ...p }) => ({
                        ...p,
                        isWinner: winnerId === p.id,
                    })),
                    winnerUserId: winnerId,
                });
                console.log(`Update game ${gameId}`);
            };

            if (guess === player.targetWord) {
                await createGameHistory({ winnerId: userId });
                // Notify all players
                room.players.forEach((p) => {
                    io.to(p.socketId).emit("endGame", {
                        answer: p.targetWord,
                        winner: userId,
                    });
                    p.status = "Finish";
                });
                room.winner = player.id;
                room.status = "Finish";
                emitRooms()
            }

            // Check for maximum guesses
            if (
                player.guesses.length === WORDLE_TRIALS &&
                player.targetWord !== guess
            ) {
                if (room.mode === "singlePlayer") {
                    await createGameHistory({ winnerId: null });
                    socket.emit("endGame", {
                        answer: player.targetWord,
                        winner: null,
                    });
                    player.status = "Finish";
                    room.winner = null;
                    room.status = "Finish";
                    emitRooms()
                } else {
                    const self = room.players.find((p) => p.id === userId);
                    const opponent = room.players.find((p) => p.id !== userId);
                    if (opponent.guesses.length < WORDLE_TRIALS) {
                        socket.emit("status", {
                            type: "waitForOpponent",
                            props: { answer: player.targetWord },
                        });
                        self.status = "Pending";
                    } else {
                        await createGameHistory({ winnerId: null });
                        room.players.forEach((p) => {
                            p.guesses = [];
                            p.status = "Finish";
                            io.to(p.socketId).emit("endGame", {
                                answer: player.targetWord,
                                winner: null,
                            });
                        });
                        room.winner = null;
                        room.status = "Finish";
                        emitRooms();
                    }
                }
            }
        }
    );

    // RESET GAME
    socket.on("replayGame", ({ roomId }) => {
        const room = rooms[roomId];
        if (room) {
            resetGameStatus(room, true);
            startNewGame(room);
        }
    });

    // LEAVE ROOM
    socket.on("leaveRoom", ({ roomId, userId }) => {
        const room = rooms[roomId];
        if (room) {
            const leftPlayer = room.players?.find((p) => p.id === userId);
            room.players = room.players.filter((p) => p.id !== userId);
            // Notify others
            room.players.forEach((p) => {
                resetGameStatus(room, false);
                io.to(p.socketId).emit("playerLeft", leftPlayer);
            });
            // Update host if needed
            if (room.players.length > 0) {
                const nextPlayer = room.players[0];
                if (nextPlayer) {
                    room.hostPlayer = {
                        id: nextPlayer.id,
                        name: nextPlayer.name,
                        socketId: nextPlayer.socketId,
                    };
                }
            } else {
                delete rooms[roomId];
            }
            room.status = "Waiting";
            emitRooms();
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        const roomId = findRoomIdByPlayerId(rooms, { socketId: socket.id });
        const room = rooms[roomId];

        if (room) {
            const disconnectedPlayer = room.players?.find(
                (p) => p.socketId === socket.id
            );
            // room.players = room.players.filter((p) => p.socketId !== socket.id);

            const opponents = room.players.filter(
                (p) => p.socketId !== socket.id
            );
            // // Notify opponents
            if (disconnectedPlayer) {
                opponents.forEach((p) => {
                    io.to(p.socketId).emit(
                        "playerDisconnected",
                        disconnectedPlayer
                    );
                });
            }

            // Remove room if empty
            if (room.players.length === 0) {
                delete rooms[roomId];
                emitRooms();
            }
        }
    });
});

export default app;
