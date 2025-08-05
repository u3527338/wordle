import "../../styles/Wordle.css";

const LetterCell = ({ letter, color, style, animate, shake }) => {
    const className = `letter-cell ${animate ? "flip" : ""} ${
        shake ? "shake" : ""
    }`;
    return (
        <div
            style={{
                backgroundColor: color || "#ddd",
                ...style,
            }}
            className={className}
        >
            <span>{letter}</span>
        </div>
    );
};

const WordleGrid = ({ guesses, currentGuess = "", shakeRow }) => {
    const totalRows = 5; // fixed number of rows
    const rows = Array.from({ length: totalRows }, (_, i) => i);

    return (
        <div style={{ width: "min-content", margin: "auto" }}>
            {rows.map((rowIdx) => {
                const isGuessRow = rowIdx < guesses.length;
                const guess = isGuessRow ? guesses[rowIdx].guess : "";
                const colors = isGuessRow ? guesses[rowIdx].colors : [];
                const isCurrentRow = rowIdx === guesses.length;

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
                                        : isCurrentRow
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
                                animate={isGuessRow}
                                shake={rowIdx === shakeRow}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default WordleGrid;
