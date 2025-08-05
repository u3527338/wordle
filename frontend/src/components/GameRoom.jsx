import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormModal from "../components/modal/FormModal";
import { useStore } from "../hook/useStore";
import socket from "../socket";
import WordleGrid from "./card/WordleGrid";
import Wrapper from "./general/Wrapper";

const GameRoom = () => {
    const { roomId } = useParams();
    const { userId } = useStore();
    const navigate = useNavigate();

    const [currentGuess, setCurrentGuess] = useState("");
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
        selfGuess: ({ guess, colors }) =>
            setGuesses((prev) => [...prev, { guess, colors }]),
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
        error: () => {
            console.log("error");
            navigate("/rooms");
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
        socket.emit("joinRoom", {
            roomId,
            player: { id: userId, isHost: false },
        });
        registerSocketEvents(socketHandlers);
        return () => deregisterSocketEvents(socketHandlers);
    }, []);

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
        if (
            questionModalState.input.length === 5 &&
            /^[A-Za-z]+$/.test(questionModalState.input)
        ) {
            socket.emit("submitCustomQuestion", {
                forPlayerId: questionModalState.forPlayerId,
                customWord: questionModalState.input,
            });
            setGameStatus("assigned");
        } else {
            alert("Please enter a valid 5-letter word");
        }
    };

    // Submit guess during game
    const handleSubmitGuess = () => {
        socket.emit("submitGuess", { roomId, userId, currentGuess });
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
        navigate("/rooms");
    };

    // Handle keyboard input
    const handleKeyDown = (e) => {
        if (gameStatus !== "playing") return;

        if (e.key === "Enter") {
            if (currentGuess.length !== 5) return;
            handleSubmitGuess();
            setCurrentGuess("");
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
            <div style={{ display: "flex" }}>
                <div style={{ padding: 20 }}>
                    <WordleGrid guesses={guesses} currentGuess={currentGuess} />
                </div>
                <div style={{ padding: 20 }}>
                    <WordleGrid guesses={opponentGuesses} />
                </div>
            </div>

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
