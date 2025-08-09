import { Box, Typography } from "@mui/material";
import { WORDLE_TRIALS } from "../../constants/constants";
import "../../styles/Wordle.css";

const LetterCell = ({ letter, color, animate, shake, gridCount }) => {
    // Compose className string based on props
    const classNames = [
        animate ? "flip" : "",
        shake ? "shake" : "",
        "letter-cell",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Box
            sx={{
                aspectRatio: 1 / 1,
                backgroundColor: color || "#ddd",
                width: 50,
                fontWeight: "bold",
                borderRadius: 1,
                border: "2px solid #999",
                boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)",
                "@media(max-width: 800px)": {
                    width: "40px",
                },
                "@media(max-width: 400px)": {
                    width: gridCount === 1 ? "40px" : "28px",
                },
            }}
            className={classNames}
        >
            <Typography
                sx={{
                    textShadow: "0px 1px 2px #555",
                    fontSize: { xs: gridCount === 1 ? 16 : 14, sm: 20 },
                }}
            >
                {letter}
            </Typography>
        </Box>
    );
};

const WordleGrid = ({ guesses, currentGuess = "", shakeRow, gridCount }) => {
    const rows = Array.from({ length: WORDLE_TRIALS }, (_, i) => i);
    return (
        <div className="wordle-grid-container">
            {rows.map((rowIdx) => {
                const isGuessRow = rowIdx < guesses.length;
                const guess = isGuessRow ? guesses[rowIdx].guess : "";
                const colors = isGuessRow ? guesses[rowIdx].colors : [];
                const isCurrentRow = rowIdx === guesses.length;
                return (
                    <div key={rowIdx} className="wordle-row">
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
                                animate={isGuessRow}
                                shake={rowIdx === shakeRow}
                                gridCount={gridCount}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default WordleGrid;
