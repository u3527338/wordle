import React, { useState } from "react";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const targetWord = "REACT";

function WordleRoute() {
    const [guesses, setGuesses] = useState([]); // Array of guessed words
    const [currentGuess, setCurrentGuess] = useState("");
    const [gameStatus, setGameStatus] = useState("playing"); // 'playing', 'won', 'lost'

    const resetGame = () => {
        setGuesses([])
        setCurrentGuess("")
        setGameStatus("playing")
    }
    
    const handleKeyDown = (e) => {
        if (gameStatus !== "playing") return;

        if (e.key === "Enter") {
            if (currentGuess.length !== WORD_LENGTH) return;
            if (guesses.length >= MAX_ATTEMPTS) return;

            // Check if guessed word matches target
            if (currentGuess.toUpperCase() === targetWord) {
                setGameStatus("won");
            } else if (guesses.length + 1 >= MAX_ATTEMPTS) {
                setGameStatus("lost");
            }

            setGuesses([...guesses, currentGuess.toUpperCase()]);
            setCurrentGuess("");
        } else if (e.key === "Backspace") {
            setCurrentGuess(currentGuess.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            if (currentGuess.length < WORD_LENGTH) {
                setCurrentGuess(currentGuess + e.key.toUpperCase());
            }
        }
    };

    React.useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentGuess, guesses, gameStatus]);

    const getGuessColors = (guess) => {
        // Return an array of colors for each letter
        const colors = Array(WORD_LENGTH).fill("gray");
        const targetLetters = targetWord.split("");

        // First pass: correct letters in correct position
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guess[i] === targetLetters[i]) {
                colors[i] = "green";
                targetLetters[i] = null; // mark as used
            }
        }

        // Second pass: correct letters in wrong position
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (colors[i] !== "green") {
                const index = targetLetters.indexOf(guess[i]);
                if (index !== -1) {
                    colors[i] = "yellow";
                    targetLetters[index] = null; // mark as used
                }
            }
        }
        return colors;
    };
    console.log({guesses})
    return (
        <div style={{ fontFamily: "Arial", padding: 20 }}>
            <h1>Wordle React</h1>
            {guesses.map((guess, index) => (
                <div key={index} style={{ display: "flex", marginBottom: 5 }}>
                    {guess.split("").map((letter, i) => (
                        <div
                            key={i}
                            style={{
                                width: 40,
                                height: 40,
                                lineHeight: "40px",
                                textAlign: "center",
                                marginRight: 5,
                                backgroundColor: getGuessColors(guess)[i],
                                color: "white",
                                fontWeight: "bold",
                                borderRadius: 4,
                            }}
                        >
                            {letter}
                        </div>
                    ))}
                </div>
            ))}
            {/* Show current guess */}
            {gameStatus === "playing" && (
                <div style={{ display: "flex" }}>
                    {Array.from({ length: WORD_LENGTH }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 40,
                                height: 40,
                                lineHeight: "40px",
                                textAlign: "center",
                                marginRight: 5,
                                border: "2px solid #ccc",
                                borderRadius: 4,
                                fontWeight: "bold",
                            }}
                        >
                            {currentGuess[i] || ""}
                        </div>
                    ))}
                </div>
            )}
            {gameStatus === "won" && <h2>Congratulations! You guessed it!</h2>}
            {gameStatus === "lost" && (
                <h2>Game Over! The word was {targetWord}.</h2>
            )}
            {gameStatus !== "playing" && (
                <button onClick={() => {
                    resetGame()
                }}>Replay</button>
            )}
        </div>
    );
}

export default WordleRoute;
