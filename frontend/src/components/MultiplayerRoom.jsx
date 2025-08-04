import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../hook/useStore";
import { useGuessMutation } from "../request/hook";
import socket from "../socket";
import WordleGrid from "./card/WordleGrid";
import Wrapper from "./general/Wrapper";

const MultiplayerRoom = () => {
    const { roomId } = useParams();
    const { userId } = useStore();
    const navigate = useNavigate();
    const { mutate } = useGuessMutation();
    const [currentGuess, setCurrentGuess] = useState("");
    const [guesses, setGuesses] = useState([]);
    const [opponentGuesses, setOpponentGuesses] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState(null)

    useEffect(() => {
        socket.emit("joinRoom", {
            roomId,
            player: { id: userId, isHost: false },
        });
        const handleOpponentGuess = ({ guess, colors, userId }) => {
            setOpponentGuesses((prev) => [...prev, { guess, colors }]);
        };
        const handleEndGame = ({ winner }) => {
            setGameOver(true);
            setMessage(`Winner: ${winner}`)
        };
        const handleError = () => {
            navigate("/rooms");
        };
        socket.on("opponentGuess", handleOpponentGuess);
        socket.on("endGame", handleEndGame);
        socket.on("error", handleError);
        return () => {
            socket.off("opponentGuess", handleOpponentGuess);
            socket.off("endGame", handleEndGame);
            socket.off("error", handleError);
        };
    }, []);

    const handleSubmitGuess = () => {
        socket.emit("playerGuess", { roomId, userId, currentGuess });
    };

    const resetGame = () => {
        setGuesses([]);
        setCurrentGuess("");
        setGameOver(false);
    };

    const handleKeyDown = (e) => {
        if (gameOver) return;

        if (e.key === "Enter") {
            if (currentGuess.length !== 5 || guesses.length >= 6) return;
            mutate(
                { currentGuess },
                {
                    onSuccess: (data) => {
                        if (data.correct) {
                            setGuesses((prev) => [
                                ...prev,
                                {
                                    guess: currentGuess,
                                    colors: data.colors,
                                },
                            ]);
                            setMessage(`Winner: ${userId}`)
                            setGameOver(true)
                        } else {
                            setGuesses((prev) => [
                                ...prev,
                                { guess: currentGuess, colors: data.colors },
                            ]);
                            if (guesses.length + 1 >= 6) {
                                setGameOver(true);
                            } else {
                            }
                        }
                        handleSubmitGuess();
                    },
                    onError: () => {},
                }
            );
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
        </Wrapper>
    );
};

export default MultiplayerRoom;
