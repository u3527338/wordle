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
    findUserIdBySocketId,
    getColors,
    getIsRoomJoinable,
    getOpponent,
    getTargetWord,
    isSinglePlayerMode,
    isValidWord,
    updateGameInfo,
    updateHost,
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
const players = {};
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
            createdAt: new Date(),
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

io.on("connection", (socket) => {
    /** Functions **/
    const resetGameStatus = (room, replay) => {
        room.startTime = Date.now();
        room.winner = null;
        room.players.forEach((p) => {
            p.targetWord = null;
            p.guesses = [];
            p.status = replay ? "Playing" : "Waiting";
        });
        room.status = replay ? "Playing" : "Waiting";
        io.to(room.socketId).emit("resetGameStatus", replay);
        emitRooms();
    };

    const initGame = (room) => {
        room.status = "Playing";

        if (isSinglePlayerMode(room) || room.mode === "twoPlayerServer") {
            const targetWord = getTargetWord();
            room.players.forEach((p) => {
                p.targetWord = targetWord;
            });
            startWordleGame(room);
        } else {
            startAssignment(room);
        }
        emitRooms();
    };

    const startAssignment = (room) => {
        room.players.forEach((p) => {
            if (!p.targetWord) {
                // Find opponent
                const opponent = getOpponent(room, p.id);
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
    };

    const startWordleGame = (room) => {
        const allHaveAnswers = room.players.every((p) => p.targetWord);
        if (allHaveAnswers) {
            room.players.forEach((p) => {
                p.status = "Playing";
            });
            io.to(room.socketId).emit("startWordle", room.mode);
        }
    };

    const gameFinished = ({ room, player, winner }) => {
        const opponent = getOpponent(room, player.id);
        if (opponent && players[opponent?.id]?.status === "offline") {
            room.players = room.player.filter((p) => p.id === opponent.id);
        }
        room.players.forEach((p) => {
            io.to(room.socketId).emit("endGame", {
                answer: p.targetWord,
                winner: winner?.id,
            });
            p.status = "Finish";
        });
        room.winner = winner?.id;
        room.status = "Finish";
        emitRooms();
    };

    /** Socket event **/
    socket.emit("updateRooms", Object.values(rooms));

    socket.on("getRooms", () => {
        emitRooms();
    });

    socket.on("createRoom", ({ roomId, player, mode }) => {
        console.log(
            `Create room ${roomId} for user ${player.id} with socket.id=${socket.id}`
        );
        rooms[roomId] = {
            id: roomId,
            socketId: roomId,
            hostPlayer: {
                id: player.id,
                name: player.name,
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
            startTime: null,
        };
        rooms[roomId].status = "Waiting";
        emitRooms();
    });

    socket.on("reconnect", (userId) => {
        players[userId] = {
            status: "online",
            id: userId,
            socketId: socket.id,
        };
        const roomId = findRoomIdByPlayerId(rooms, { id: userId });
        if (!roomId) {
            socket.emit("inGame", null);
            return;
        }
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
    });

    socket.on("joinRoom", ({ roomId, player }) => {
        const room = rooms[roomId];

        const isRoomAvailable = getIsRoomJoinable(room, player);
        if (!isRoomAvailable) {
            socket.emit("status", { type: "roomNotAvailable" });
            return;
        }

        socket.join(roomId);
        socket.roomId = roomId;

        emitRooms();
        if (room.status !== "Playing") {
            // for status === Waiting only
            resetGameStatus(room, false);
            const isSinglePlayMode = isSinglePlayerMode(room);
            if (!isSinglePlayMode) {
                const playerExist = room.players.find(
                    (p) => p.id === player.id
                );
                if (!playerExist) {
                    room.players.push({
                        id: player.id,
                        name: player.name,
                        guesses: [],
                        socketId: socket.id,
                        status: "Waiting",
                    });
                } else {
                    playerExist.socketId = socket.id;
                }
                const opponent = room.players.find((p) => p.id !== player.id);
                if (opponent) {
                    io.to(room.socketId).emit("updatePlayers", room.players);
                }
            }
            if (
                isSinglePlayMode ||
                (!isSinglePlayMode && room.players.length >= 2)
            )
                initGame(room);
        } else {
            // retrieve current game session
            const opponent = getOpponent(room, player.id);
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
        }
    });

    socket.on("submitAssignment", ({ player, customWord }) => {
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
        const opponent = getOpponent(room, player.id);
        const self = room.players.find((p) => p.id === player.id);

        if (opponent) {
            opponent.targetWord = customWord;
        }
        socket.emit("status", { type: "validAssignment" });
        self.status = "Assigned";
        emitRooms();

        startWordleGame(room);
    });

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
                gameFinished({ room, player, winner: player });
                // await createGameHistory({ winnerId: userId });
            }

            // Check for maximum guesses
            if (
                player.guesses.length === WORDLE_TRIALS &&
                player.targetWord !== guess
            ) {
                if (isSinglePlayerMode(room)) {
                    gameFinished({ room, player, winner: null });
                    // await createGameHistory({ winnerId: null });
                } else {
                    const self = room.players.find((p) => p.id === userId);
                    const opponent = getOpponent(room, userId);
                    if (opponent.guesses.length < WORDLE_TRIALS) {
                        socket.emit("waitForOpponent", {
                            answer: player.targetWord,
                        });
                        self.status = "Pending";
                    } else {
                        gameFinished({ room, player, winner: null });
                        // await createGameHistory({ winnerId: null });
                    }
                }
            }
        }
    );

    socket.on("replayGame", ({ roomId }) => {
        const room = rooms[roomId];
        if (room) {
            if (
                (isSinglePlayerMode(room) && room.players.length === 1) ||
                (!isSinglePlayerMode(room) && room.players.length >= 2)
            ) {
                resetGameStatus(room, true);
                initGame(room);
            } else {
                resetGameStatus(room, false);
            }
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
            });
            // Update host if needed
            if (room.players.length > 0) {
                updateHost(room);
            } else {
                delete rooms[roomId];
            }
            room.status = "Waiting";
            io.to(room.socketId).emit("playerLeft", leftPlayer);
            emitRooms();
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        const disconnectedPlayerId = findUserIdBySocketId(players, socket.id);
        if (!disconnectedPlayerId) return;

        players[disconnectedPlayerId].status = "offline";

        const roomId = findRoomIdByPlayerId(rooms, { socketId: socket.id });
        const room = rooms[roomId];

        if (room) {
            const notifyRoomPlayers = () => {
                const disconnectedPlayer = room.players?.find(
                    (p) => p.id === disconnectedPlayerId
                );
                const opponents = room.players.filter(
                    (p) => p.id !== disconnectedPlayer
                );
                if (disconnectedPlayer) {
                    opponents.forEach((p) => {
                        io.to(p.socketId).emit(
                            "playerDisconnected",
                            disconnectedPlayer
                        );
                    });
                }
            };
            if (room.status === "Finish") {
                if (
                    room.players.every(
                        (p) => players[p.id]?.status === "offline"
                    )
                ) {
                    // All offline and game finished
                    delete rooms[roomId];
                } else {
                    // remove disconnected player
                    room.players = room.players.filter(
                        (p) => p.id !== disconnectedPlayerId
                    );
                    notifyRoomPlayers();
                    updateHost(room);
                }
                emitRooms();
            } else {
                notifyRoomPlayers();
            }
        }
    });
});

export default app;
