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

    useEffect(() => {
        socket.emit("joinRoom", {
            roomId,
            player: { id: userId, isHost: false },
        });
        const handleSelfGuess = ({ guess, colors }) => {
            setGuesses((prev) => [...prev, { guess, colors }]);
        };
        const handleOpponentGuess = ({ guess, colors }) => {
            setOpponentGuesses((prev) => [...prev, { guess, colors }]);
        };
        const handleStartNewGame = () => {
            resetGameStatus();
            setGameStatus("playing");
        };
        const handleQuestion = ({ forPlayerId }) => {
            handleOpenModal(forPlayerId);
        };
        const handleEndGame = ({ winner }) => {
            setGameStatus("end");
            setMessage(`Winner: ${winner}`);
        };
        const handlePlayerLeft = ({ userId }) => {
            navigate("/rooms");
        };
        const handleError = () => {
            navigate("/rooms");
        };
        socket.on("selfGuess", handleSelfGuess);
        socket.on("opponentGuess", handleOpponentGuess);
        socket.on("startNewGame", handleStartNewGame);
        socket.on("requestCustomQuestion", handleQuestion);
        socket.on("endGame", handleEndGame);
        socket.on("playerLeft", handlePlayerLeft);
        socket.on("error", handleError);
        return () => {
            socket.off("joinRoom");
            socket.off("selfGuess", handleSelfGuess);
            socket.off("opponentGuess", handleOpponentGuess);
            socket.off("startNewGame", handleStartNewGame);
            socket.off("endGame", handleEndGame);
            socket.off("playerLeft", handlePlayerLeft);
            socket.off("error", handleError);
        };
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

    const handleSubmitGuess = () => {
        socket.emit("submitGuess", { roomId, userId, currentGuess });
    };

    const resetGameStatus = () => {
        setGuesses([]);
        setOpponentGuesses([]);
        setCurrentGuess("");
        setMessage(null);
        handleCloseModal()
    };

    const replayGame = () => {
        socket.emit("resetGame", { roomId });
    };

    const leaveGame = () => {
        socket.emit("leaveRoom", { roomId, userId });
        resetGameStatus("end");
        navigate("/rooms");
    };

    const handleKeyDown = (e) => {
        if (gameStatus !== "playing") return;

        if (e.key === "Enter") {
            if (currentGuess.length !== 5 || guesses.length >= 5) return;
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
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentGuess, guesses]);

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
            {message && <span>{message}</span>}
            <FormModal open={questionModalState.open} customButton={true}>
                <div>
                    <h3>Enter a 5-letter word for your opponent</h3>
                    <input
                        autoFocus
                        value={questionModalState.input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        maxLength={5}
                    />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                        }}
                    >
                        <button
                            onClick={() => {
                                if (
                                    questionModalState.input.length === 5 &&
                                    /^[A-Za-z]+$/.test(questionModalState.input)
                                ) {
                                    socket.emit("submitCustomQuestion", {
                                        forPlayerId:
                                            questionModalState.forPlayerId,
                                        customWord: questionModalState.input,
                                    });
                                    handleCloseModal();
                                } else {
                                    alert("Please enter a valid 5-letter word");
                                }
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </FormModal>
            <FormModal open={gameStatus === "end"} customButton={true}>
                <div>
                    <button onClick={replayGame}>Replay</button>
                    <button onClick={leaveGame}>Leave</button>
                </div>
            </FormModal>
        </Wrapper>
    );
};

export default GameRoom;
