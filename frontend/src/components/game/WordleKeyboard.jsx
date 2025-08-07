import { useEffect, useState } from "react";
import Button from "@mui/material/Button";

const keys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

const KeyboardButton = ({ label, onClick, isPressed }) => {
    return (
        <Button
            variant="outlined"
            onMouseDown={onClick}
            sx={{
                minWidth: "40px",
                padding: "10px",
                borderRadius: "8px",
                textTransform: "uppercase",
                fontSize: "14px",
                margin: "2px",
                backgroundColor: "#1976d2",
                color: "#fff",
                boxShadow: isPressed
                    ? "inset 0 0 20px rgba(0,0,0,0.3)"
                    : "none",
                transform: isPressed ? "translateY(2px)" : "none",
                transition: "all 0.1s ease-in-out",
                "&:hover": {
                    backgroundColor: "#1565c0",
                },
            }}
        >
            {label}
        </Button>
    );
};

function WordleKeyboard({ onKeyPress }) {
    const [pressedKeys, setPressedKeys] = useState({});
    // Handle physical keyboard input
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key;
            if (
                (key.length === 1 && /[a-z]/i.test(key)) ||
                key === "Enter" ||
                key === "Backspace"
            ) {
                setPressedKeys((prev) => ({
                    ...prev,
                    [key.toUpperCase()]: true,
                }));
                onKeyPress({ key: key.length === 1 ? key.toUpperCase() : key });
            }
        };

        const handleKeyUp = (e) => {
            const key = e.key;
            if (
                (key.length === 1 && /[a-z]/i.test(key)) ||
                key === "Enter" ||
                key === "Backspace"
            ) {
                setPressedKeys((prev) => ({
                    ...prev,
                    [key.toUpperCase()]: false,
                }));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [onKeyPress]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {keys.map((row, rowIndex) => (
                <div
                    key={rowIndex}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "4px",
                    }}
                >
                    {row.map((key) => (
                        <KeyboardButton
                            key={key}
                            label={key}
                            isPressed={pressedKeys[key]}
                            onClick={() => {
                                setPressedKeys((prev) => ({
                                    ...prev,
                                    [key]: true,
                                }));
                                onKeyPress({ key });
                                // Release after brief delay
                                setTimeout(() => {
                                    setPressedKeys((prev) => ({
                                        ...prev,
                                        [key]: false,
                                    }));
                                }, 150);
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default WordleKeyboard;
