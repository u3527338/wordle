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

const WordleGrid = ({ guesses, currentGuess = "", gameOver = false }) => {
    const totalRows = 5; // fixed number of rows

    // Create an array of indices from 0 to 4
    const rows = Array.from({ length: totalRows }, (_, i) => i);

    return (
        <div style={{ width: "min-content", margin: "auto" }}>
            {rows.map((rowIdx) => {
                // Determine if this row is filled with a guess or current input or empty
                const guessIndex = rowIdx;
                const isGuessRow = guessIndex < guesses.length;
                const guess = isGuessRow ? guesses[guessIndex].guess : "";
                const colors = isGuessRow ? guesses[guessIndex].colors : [];

                return (
                    <div
                        key={rowIdx}
                        style={{
                            display: "flex",
                            marginBottom: 5,
                            width: "fit-content",
                        }}
                    >
                        {Array.from({ length: 5 }).map((_, i) => (
                            <LetterCell
                                key={i}
                                letter={
                                    isGuessRow
                                        ? guess[i]
                                        : rowIdx === guesses.length
                                        ? currentGuess[i]
                                        : ""
                                }
                                color={isGuessRow ? colors[i] : undefined}
                                style={{
                                    border:
                                        rowIdx >= guesses.length
                                            ? "2px solid #ccc"
                                            : undefined,
                                }}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default WordleGrid;