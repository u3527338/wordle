import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormModal from "../components/modal/FormModal";
import { useStore } from "../hook/useStore";
import socket from "../socket";
import WordleGrid from "./card/WordleGrid";
import Wrapper from "./general/Wrapper";

const GameRoom = ({ isSinglePlayer }) => {
    const { roomId } = useParams();
    const { userId } = useStore();
    const navigate = useNavigate();

    const [currentGuess, setCurrentGuess] = useState("");
    const [shakeRow, setShakeRow] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [opponentGuesses, setOpponentGuesses] = useState([]);
    const [gameStatus, setGameStatus] = useState("waiting");
    const [message, setMessage] = useState(null);
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
        startNewGame: () => {
            setGameStatus("playing");
            setMessage(null);
        },
        requestAnswerAssignment: ({ forPlayerId }) => {
            setGameStatus("assigning");
            handleOpenModal(forPlayerId);
        },
        endGame: ({ winner }) => {
            setGameStatus("end");
            setMessage(`Winner: ${winner}`);
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
                case "unknown":
                    console.log("unknown");
                    navigate("/wordle");
                    return;
                default:
                    console.log("default");
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
        if (!isSinglePlayer) {
            socket.emit("joinRoom", {
                roomId,
                player: { id: userId, isHost: false },
            });
        }
        registerSocketEvents(socketHandlers);
        return () => deregisterSocketEvents(socketHandlers);
    }, []);

    const handleInvalidGuess = (rowIndex) => {
        setShakeRow(rowIndex);
        setTimeout(() => setShakeRow(null), 500); // Reset after shake duration
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
        console.log("leave");
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

    return (
        <Wrapper>
            {isSinglePlayer ? (
                <WordleGrid
                    guesses={guesses}
                    currentGuess={currentGuess}
                    shakeRow={shakeRow}
                />
            ) : (
                <div style={{ display: "flex" }}>
                    <div style={{ padding: 20 }}>
                        <WordleGrid
                            guesses={guesses}
                            currentGuess={currentGuess}
                            shakeRow={shakeRow}
                        />
                    </div>
                    <div style={{ padding: 20 }}>
                        <WordleGrid guesses={opponentGuesses} />
                    </div>
                </div>
            )}

            <FormModal open={gameStatus === "waiting"}>
                <span>Waiting for others to join...</span>
            </FormModal>

            {/* Modal for answer input */}
            <FormModal open={questionModalState.open}>
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {gameStatus === "assigning" && (
                        <div>
                            <h3
                                style={{
                                    marginBottom: "20px",
                                    fontSize: "22px",
                                    fontWeight: "bold",
                                }}
                            >
                                Answer
                            </h3>
                            <input
                                autoFocus
                                style={{
                                    padding: "12px",
                                    fontSize: "18px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    width: "80%",
                                    marginBottom: "20px",
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
                            <button
                                className="button"
                                onClick={handleAnswerSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    )}
                    {gameStatus === "assigned" && (
                        <div className="status-message">
                            Waiting for your opponent to submit their answer...
                        </div>
                    )}
                </div>
            </FormModal>

            {/* End game modal */}
            <FormModal open={gameStatus === "end"}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        alignItems: "center",
                    }}
                >
                    <h3
                        style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            marginBottom: "10px",
                        }}
                    >
                        Game Over!
                    </h3>
                    {message && (
                        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
                            {message}
                        </p>
                    )}
                    <button className="button" onClick={handleReplay}>
                        Replay
                    </button>
                    <button
                        className="button"
                        style={{ backgroundColor: "#f44336" }}
                        onClick={handleLeave}
                    >
                        Leave
                    </button>
                </div>
            </FormModal>
        </Wrapper>
    );
};

export default GameRoom;
