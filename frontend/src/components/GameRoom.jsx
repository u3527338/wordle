import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../hook/useStore";
import socket from "../socket";
import WordleGrid from "./card/WordleGrid";
import Wrapper from "./general/Wrapper";
import FormModal from "../components/modal/FormModal";

const GameRoom = () => {
    const { roomId } = useParams();
    const { userId } = useStore();
    const navigate = useNavigate();
    const [currentGuess, setCurrentGuess] = useState("");
    const [guesses, setGuesses] = useState([]);
    const [opponentGuesses, setOpponentGuesses] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState(null);

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
        const handleStartNewGame = ({ message }) => {
            resetGameStatus();
        };
        const handleEndGame = ({ winner }) => {
            setGameOver(true);
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

    const handleSubmitGuess = () => {
        socket.emit("submitGuess", { roomId, userId, currentGuess });
    };

    const resetGameStatus = () => {
        setGuesses([]);
        setOpponentGuesses([]);
        setCurrentGuess("");
        setGameOver(false);
        setMessage(null);
    };

    const resetGame = () => {
        resetGameStatus();
        socket.emit("resetGame", { roomId });
    };

    const leaveGame = () => {
        socket.emit("leaveRoom", { roomId, userId });
        resetGameStatus();
        navigate("/rooms");
    };

    const handleKeyDown = (e) => {
        if (gameOver) return;

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
    }, [currentGuess, guesses, gameOver]);

    return (
        <Wrapper>
            <div style={{ display: "flex" }}>
                <div style={{ padding: 20 }}>
                    <WordleGrid
                        guesses={guesses}
                        currentGuess={currentGuess}
                        gameOver={gameOver}
                    />
                </div>
                <div style={{ padding: 20 }}>
                    <WordleGrid guesses={opponentGuesses} gameOver={gameOver} />
                </div>
            </div>
            {message && <span>{message}</span>}
            <FormModal
                open={gameOver}
                handleClose={resetGameStatus}
                customButton={true}
            >
                <div>
                    <button onClick={resetGame}>Replay</button>
                    <button onClick={leaveGame}>Leave</button>
                </div>
            </FormModal>
        </Wrapper>
    );
};

export default GameRoom;
