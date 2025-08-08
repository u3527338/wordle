import { WORDLE_TRIALS } from "../../constants/constants";
import "../../styles/Wordle.css";

const LetterCell = ({ letter, color, animate, shake }) => {
    const style = {
        backgroundColor: color || "#ddd",
    };
    const className = `letter-cell ${animate ? "flip" : ""} ${
        shake ? "shake" : ""
    }`;
    return (
        <div style={style} className={className}>
            <span>{letter}</span>
        </div>
    );
};

const WordleGrid = ({ guesses, currentGuess = "", shakeRow }) => {
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
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default WordleGrid;
