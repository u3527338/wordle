import React, { useEffect, useState } from "react";
import WordleGrid from "../components/card/WordleGrid";
import Wrapper from "../components/general/Wrapper";

export const WordleRoute = () => {
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");

    const replayGame = () => {
        setGuesses([]);
        setCurrentGuess("");
        setGameOver(false);
        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (gameOver) return;

        if (e.key === "Enter") {
            if (currentGuess.length !== 5 || guesses.length >= 6) return;
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
            <div style={{ padding: 20 }}>
                <WordleGrid
                    guesses={guesses}
                    currentGuess={currentGuess}
                    gameOver={gameOver}
                />
                {message && <h2>{message}</h2>}
                {gameOver && (
                    <button
                        onClick={() => {
                            replayGame();
                        }}
                    >
                        Replay
                    </button>
                )}
            </div>
        </Wrapper>
    );
};
