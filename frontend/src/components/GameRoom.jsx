import { Box, Typography } from "@mui/material"; // Import MUI Box
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../hook/useStore";
import socket from "../socket";
import WordleGrid from "./card/WordleGrid";
import LoadingOverlay from "./common/LoadingOverlay";
import MyButton from "./common/MyButton";
import MyModal from "./common/MyModal";

const GameRoom = ({ isSinglePlayer }) => {
    const { roomId } = useParams();
    const { user } = useStore();
    const { userId, nickName } = user;
    const navigate = useNavigate();

    const [currentGuess, setCurrentGuess] = useState("");
    const [guesses, setGuesses] = useState([]);
    const [opponent, setOpponent] = useState(null);
    const [opponentGuesses, setOpponentGuesses] = useState([]);

    const [gameMode, setGameMode] = useState("");
    const [gameStatus, setGameStatus] = useState(null);

    const [message, setMessage] = useState(null);
    const [shakeRow, setShakeRow] = useState(null);
    const [questionModalState, setQuestionModalState] = useState({
        open: false,
        forPlayerId: null,
        input: "",
    });

    const resetGameStatus = () => {
        setGuesses([]);
        setOpponentGuesses([]);
        setCurrentGuess("");
        setMessage(null);
        setGameStatus("waiting");
    };

    const socketHandlers = {
        opponentGuess: ({ guess, colors }) =>
            setOpponentGuesses((prev) => [...prev, { guess, colors }]),
        hostJoined: (host) => setGameStatus("waiting"),
        playerJoined: (player) => setOpponent(player),
        startNewGame: (mode) => {
            setGameMode(mode);
            setGameStatus("playing");
            setMessage(null);
        },
        requestAnswerAssignment: ({ forPlayerId }) => {
            setGameStatus("assigning");
            handleOpenModal(forPlayerId);
        },
        endGame: ({ answer, winner, mode }) => {
            if (!winner) {
                if (mode === "singlePlayer") {
                    setMessage(`The answer is ${answer}`);
                } else {
                    setMessage(`No one wins. Your answer is ${answer}`);
                }
            } else if (winner === userId) {
                setMessage(`Congratulations!`);
            } else {
                setMessage(
                    `Your opponent wins the game.\n${
                        mode === "twoPlayerServer" ? "The" : "Your"
                    } answer is ${answer}`
                );
            }
            setTimeout(() => {
                setGameStatus("end");
            }, 500);
        },
        resetGameStatus: () => {
            resetGameStatus();
        },
        playerLeft: ({ userId }) => {
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
                    setGameStatus("assigned");
                    return;
                case "waitForOpponent":
                    setGameStatus("pending");
                    setMessage(`Your answer is ${props.answer}`);
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
        // if (!isSinglePlayer) {
        socket.emit("joinRoom", {
            roomId,
            player: {
                id: userId,
                name: nickName,
                isHost: false,
            },
        });
        // }
        registerSocketEvents(socketHandlers);
        return () => deregisterSocketEvents(socketHandlers);
    }, []);

    const handleInvalidGuess = (rowIndex) => {
        setShakeRow(rowIndex);
        setTimeout(() => setShakeRow(null), 500);
    };

    const handleOpenModal = (forPlayerId) => {
        setQuestionModalState({ open: true, forPlayerId, input: "" });
    };

    const handleCloseModal = () => {
        setQuestionModalState({ open: false, forPlayerId: null, input: "" });
    };

    const handleInputChange = (value) => {
        setQuestionModalState((prev) => ({
            ...prev,
            input: value.toUpperCase(),
        }));
    };

    const handleAnswerSubmit = () => {
        socket.emit("submitCustomQuestion", {
            forPlayerId: questionModalState.forPlayerId,
            customWord: questionModalState.input,
        });
    };

    // Submit guess during game
    const handleSubmitGuess = () => {
        socket.emit("submitGuess", { roomId, userId, currentGuess, guesses });
    };

    // Handle Replay
    const handleReplay = () => {
        socket.emit("replayGame", { roomId });
        setGuesses([]);
        setOpponentGuesses([]);
        setCurrentGuess("");
        setMessage(null);
        setGameStatus("waiting"); // reset to waiting for answers
    };

    // Handle Leave
    const handleLeave = () => {
        socket.emit("leaveRoom", { roomId, userId });
        setGuesses([]);
        setOpponentGuesses([]);
        setCurrentGuess("");
        setMessage(null);
        navigate("/wordle");
    };

    // Handle keyboard input
    const handleKeyDown = (e) => {
        if (gameStatus !== "playing") return;

        if (e.key === "Enter") {
            if (currentGuess.length !== 5) return;
            handleSubmitGuess();
        } else if (e.key === "Backspace") {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            if (currentGuess.length < 5) {
                setCurrentGuess((prev) => prev + e.key.toUpperCase());
            }
        }
    };

    useEffect(() => {
        if (gameStatus === "playing") {
            window.addEventListener("keydown", handleKeyDown);
            handleCloseModal();
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameStatus, currentGuess, guesses]);

    const leaveButton = { label: "Leave", onClick: handleLeave, color:"#f44336" },
        replayButton = { label: "Replay", onClick: handleReplay },
        assignButton = { label: "Submit", onClick: handleAnswerSubmit };

    if (!gameStatus) return <LoadingOverlay />;
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingBottom: 4,
                }}
            >
                <MyButton onClick={handleLeave} color="#f44336">
                    Leave
                </MyButton>
            </Box>

            {isSinglePlayer ? (
                <WordleGrid
                    guesses={guesses}
                    currentGuess={currentGuess}
                    shakeRow={shakeRow}
                />
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        px: 2,
                    }}
                >
                    <Box sx={{ padding: 2 }}>
                        <WordleGrid
                            guesses={guesses}
                            currentGuess={currentGuess}
                            shakeRow={shakeRow}
                        />
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        <WordleGrid guesses={opponentGuesses} />
                    </Box>
                </Box>
            )}

            {/* Modal for waiting */}
            <MyModal open={gameStatus === "waiting"} buttons={[leaveButton]}>
                <span>Waiting for others to join...</span>
            </MyModal>

            {/* Modal for answer input */}
            <MyModal
                open={questionModalState.open}
                buttons={gameStatus === "assigning" ? [assignButton] : []}
            >
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {gameStatus === "assigning" && (
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
                                value={questionModalState.input}
                                onChange={(e) =>
                                    handleInputChange(e.target.value)
                                }
                                maxLength={5}
                            />
                        </Box>
                    )}
                    {gameStatus === "assigned" && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1">
                                Waiting for your opponent to submit their
                                answer...
                            </Typography>
                        </Box>
                    )}
                </Box>
            </MyModal>

            {/* End game modal */}
            <MyModal
                open={gameStatus === "end" || gameStatus === "pending"}
                buttons={
                    gameStatus !== "pending" ? [replayButton, leaveButton] : []
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
                        <Typography
                            variant="body1"
                            sx={{ fontSize: "18px", mb: 2 }}
                        >
                            {message}
                        </Typography>
                    )}
                </Box>
            </MyModal>
        </>
    );
};

export default GameRoom;
