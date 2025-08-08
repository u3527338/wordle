import { Box, Typography } from "@mui/material"; // Import MUI Box
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../hook/useStore";
import socket from "../socket";
import LoadingOverlay from "./common/LoadingOverlay";
import MyButton from "./common/MyButton";
import MyModal from "./common/MyModal";
import WordleGrid from "./game/WordleGrid";
import WordleKeyboard from "./game/WordleKeyboard";
import { useToastContext } from "./provider/ToastProvider";

const GameRoom = () => {
    const { roomId } = useParams();
    const { user } = useStore();
    const { userId, nickName } = user;
    const navigate = useNavigate();
    const { showToast } = useToastContext();
    const [currentGuess, setCurrentGuess] = useState("");

    const [opponent, setOpponent] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [opponentGuesses, setOpponentGuesses] = useState([]);
    const [gameMode, setGameMode] = useState("");
    const [gameStatus, setGameStatus] = useState("Waiting"); // Waiting | Assigning | Assigned | Pending | Playing | Finish
    const [winner, setWinner] = useState(null);
    const [answer, setAnswer] = useState(null);

    const [message, setMessage] = useState(null);
    const [shakeRow, setShakeRow] = useState(null);
    const [assignAnswer, setAssignAnswer] = useState("");

    const resetGameStatus = () => {
        setCurrentGuess("");
        setOpponentGuesses([]);
        setGuesses([]);
        setAnswer(null);
        setWinner(null);
        setAssignAnswer("");
    };

    const socketHandlers = {
        opponentGuess: ({ guess, colors }) =>
            setOpponentGuesses((prev) => [...prev, { guess, colors }]),
        playerJoined: (player) => {
            setOpponent(player);
        },
        playerRejoined: (player) => {
            showToast({
                status: "info",
                detail: `${player.name} has rejoined the game`,
            });
            setOpponent(player);
        },
        retrieveGameStatus: ({ currentGameStatus }) => {
            setOpponent(currentGameStatus.opponent);
            setGameMode(currentGameStatus.gameMode);
            setGameStatus(currentGameStatus.gameStatus);
            setGuesses(currentGameStatus.guesses || []);
            setOpponentGuesses(currentGameStatus.opponentGuesses || []);
            setAnswer(currentGameStatus.answer);
            setWinner(currentGameStatus.winner);
        },
        startWordle: (mode) => {
            setGameMode(mode);
            setGameStatus("Playing");
        },
        requestAnswerAssignment: ({ opponentId }) => {
            setGameStatus("Assigning");
        },
        waitForOpponent: ({ answer }) => {
            setAnswer(answer);
            setGameStatus("Pending");
        },
        endGame: ({ answer, winner }) => {
            setAnswer(answer);
            setWinner(winner);
            setTimeout(() => {
                setGameStatus("Finish");
            }, 500);
        },
        resetGameStatus: (replay) => {
            console.log("reset", replay)
            if (!replay) setOpponent(null);
            setGameStatus("Waiting");
        },
        playerDisconnected: (player) => {
            showToast({
                status: "info",
                detail: `${player.name} has been disconnected from the game`,
            });
        },
        playerLeft: (player) => {
            showToast({
                status: "info",
                detail: `${player.name} has left the room`,
            });
            resetGameStatus();
        },
        status: ({ type, props }) => {
            switch (type) {
                case "invalidGuess":
                    handleInvalidGuess(props.index);
                    return;
                case "invalidAssignment":
                    return;
                case "validGuess":
                    setGuesses((prev) => [...prev, props]);
                    setCurrentGuess("");
                    return;
                case "validAssignment":
                    setGameStatus("Assigned");
                    return;
                case "roomNotAvailable":
                case "unknown":
                    navigate("/wordle");
                    return;
                default:
                    navigate("/wordle");
                    return;
            }
        },
    };

    const registerSocketEvents = (handlers) => {
        Object.entries(handlers).forEach(([event, handler]) =>
            socket.on(event, handler)
        );
    };
    const deregisterSocketEvents = (handlers) => {
        socket.off("joinRoom");
        Object.entries(handlers).forEach(([event, handler]) =>
            socket.off(event, handler)
        );
    };

    useEffect(() => {
        if (gameStatus === "Waiting") {
            resetGameStatus();
        } else if (gameStatus === "Playing") {
            setMessage(null);
        } else if (gameStatus === "Pending") {
            setMessage(`Your answer is ${answer}`);
        } else if (gameStatus === "Finish") {
            if (!winner) {
                if (gameMode === "singlePlayer") {
                    setMessage(`The answer is ${answer}`);
                } else {
                    setMessage(`No one wins. Your answer is ${answer}`);
                }
            } else if (winner === userId) {
                setMessage(`Congratulations!`);
            } else {
                setMessage(
                    `Your opponent wins the game.\n${
                        gameMode === "twoPlayerServer" ? "The" : "Your"
                    } answer is ${answer}`
                );
            }
        }
    }, [gameMode, gameStatus, winner, answer]);

    useEffect(() => {
        socket.emit("joinRoom", {
            roomId,
            player: { id: userId, name: nickName },
        });
        registerSocketEvents(socketHandlers);
        return () => deregisterSocketEvents(socketHandlers);
    }, []);

    const handleInvalidGuess = (rowIndex) => {
        setShakeRow(rowIndex);
        setTimeout(() => setShakeRow(null), 500);
    };

    const handleAnswerSubmit = () => {
        socket.emit("submitAssignment", {
            player: { id: userId },
            customWord: assignAnswer,
        });
    };

    // Submit guess during game
    const handleSubmitGuess = () => {
        socket.emit("submitGuess", { roomId, userId, currentGuess, guesses });
    };

    // Handle Replay
    const handleReplay = () => {
        socket.emit("replayGame", { roomId });
        resetGameStatus();
    };

    // Handle Leave
    const handleLeave = () => {
        socket.emit("leaveRoom", { roomId, userId });
        setGuesses([]);
        setOpponentGuesses([]);
        setCurrentGuess("");
        navigate("/wordle");
    };

    // Handle keyboard input
    const handleKeyDown = (e) => {
        if (gameStatus !== "Playing") return;

        if (e.key.toUpperCase() === "ENTER") {
            if (currentGuess.length !== 5) return;
            handleSubmitGuess();
        } else if (e.key.toUpperCase() === "BACKSPACE") {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            if (currentGuess.length < 5) {
                setCurrentGuess((prev) => prev + e.key.toUpperCase());
            }
        }
    };

    const leaveButton = {
            label: "Leave",
            onClick: handleLeave,
            color: "#f44336",
        },
        replayButton = { label: "Replay", onClick: handleReplay },
        assignButton = { label: "Submit", onClick: handleAnswerSubmit };

    if (!gameStatus) return <LoadingOverlay />;

    return (
        <Box>
            <Box
                sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                }}
            >
                <MyButton onClick={handleLeave} color="#f44336">
                    Leave
                </MyButton>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    paddingBottom: 4,
                }}
            >
                {/* Single Player Mode */}
                {gameMode === "singlePlayer" ? (
                    <WordleGrid
                        guesses={guesses}
                        currentGuess={currentGuess}
                        shakeRow={shakeRow}
                    />
                ) : (
                    // Multiplayer Mode: side-by-side or stacked based on screen size
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {/* Player Grid */}
                        <Box sx={{ flex: 1, padding: 2 }}>
                            <WordleGrid
                                guesses={guesses}
                                currentGuess={currentGuess}
                                shakeRow={shakeRow}
                            />
                        </Box>
                        {/* Opponent Grid */}
                        <Box sx={{ flex: 1, padding: 2 }}>
                            <WordleGrid guesses={opponentGuesses} />
                        </Box>
                    </Box>
                )}
            </Box>

            <WordleKeyboard onKeyPress={handleKeyDown} />

            {/* Modal for waiting */}
            <MyModal open={gameStatus === "Waiting"} buttons={[leaveButton]}>
                <span>Waiting for others to join...</span>
            </MyModal>

            {/* Modal for answer input */}
            <MyModal
                open={gameStatus === "Assigning" || gameStatus === "Assigned"}
                buttons={gameStatus === "Assigning" ? [assignButton] : []}
            >
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {gameStatus === "Assigning" && (
                        <Box sx={{ mb: 2, textAlign: "center" }}>
                            <Typography variant="h6" gutterBottom>
                                Answer
                            </Typography>
                            <input
                                autoFocus
                                style={{
                                    padding: "12px",
                                    fontSize: "18px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    width: "80%",
                                    outline: "none",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                    transition: "border-color 0.2s",
                                }}
                                value={assignAnswer}
                                onChange={(e) =>
                                    setAssignAnswer(
                                        e.target.value.toUpperCase()
                                    )
                                }
                                maxLength={5}
                            />
                        </Box>
                    )}
                    {gameStatus === "Assigned" && (
                        <Typography variant="body1">
                            Waiting for your opponent to submit their answer...
                        </Typography>
                    )}
                </Box>
            </MyModal>

            {/* End game modal */}
            <MyModal
                open={gameStatus === "Finish" || gameStatus === "Pending"}
                buttons={
                    gameStatus !== "Pending" ? [replayButton, leaveButton] : []
                }
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        alignItems: "center",
                    }}
                >
                    {message && (
                        <Typography variant="body1" sx={{ fontSize: "18px" }}>
                            {message}
                        </Typography>
                    )}
                </Box>
            </MyModal>
        </Box>
    );
};

export default GameRoom;
