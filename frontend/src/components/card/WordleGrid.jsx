const LetterCell = ({ letter, color, style }) => {
    return (
        <div
            style={{
                width: 80,
                height: 80,
                lineHeight: "80px",
                textAlign: "center",
                marginRight: 5,
                backgroundColor: color,
                color: "white",
                fontWeight: "bold",
                borderRadius: 4,
                ...style,
            }}
        >
            <span>{letter}</span>
        </div>
    );
};

const WordleGrid = ({ guesses, currentGuess, gameOver }) => {
    return (
        <div style={{ width: "min-content", margin: "auto" }}>
            {guesses.map((g, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        marginBottom: 5,
                        width: "fit-content",
                    }}
                >
                    {g.guess.split("").map((letter, i) => (
                        <LetterCell
                            key={i}
                            letter={letter}
                            color={g.colors[i]}
                        />
                    ))}
                </div>
            ))}
            {!gameOver && (
                <div style={{ display: "flex" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <LetterCell
                            key={i}
                            letter={currentGuess[i] || ""}
                            style={{ border: "2px solid #ccc" }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WordleGrid;
