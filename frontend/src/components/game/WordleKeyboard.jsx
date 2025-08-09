import { useEffect, useState } from "react";
import Button from "@mui/material/Button";

const keys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

const KeyboardButton = ({ label, onClick, isPressed }) => (
    <Button
        variant="outlined"
        onMouseDown={onClick}
        sx={{
            minWidth:
                label === "ENTER" || label === "BACKSPACE"
                    ? { xs: 40, sm: 80 }
                    : { xs: 30, sm: 50 },
            minHeight: { xs: 40, sm: 50 },
            padding: { xs: "6px", sm: "10px" },
            borderRadius: { xs: "6px", sm: "8px" },
            textTransform: "uppercase",
            lineHeight: { xs: "12px", sm: "16px" },
            fontSize: { xs: "12px", sm: "16px" },
            margin: "2px",
            backgroundColor: "#1976d2",
            color: "#fff",
            boxShadow: isPressed ? "inset 0 0 20px rgba(0,0,0,0.3)" : "none",
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
                const upperKey = key.toUpperCase();
                setPressedKeys((prev) => ({ ...prev, [upperKey]: true }));
                onKeyPress({ key: upperKey });
            }
        };

        const handleKeyUp = (e) => {
            const key = e.key;
            if (
                (key.length === 1 && /[a-z]/i.test(key)) ||
                key === "Enter" ||
                key === "Backspace"
            ) {
                const upperKey = key.toUpperCase();
                setPressedKeys((prev) => ({ ...prev, [upperKey]: false }));
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
        <div
            style={{
                width: "100%",
                maxWidth: 700,
                margin: "0 auto",
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                "@media(maxWidth: 400px)": {
                    transform: "scale(0.6)",
                    transformOrigin: "bottom center",
                },
            }}
        >
            {/* Wrap all rows in a container that keeps layout fixed */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                }}
            >
                {keys.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "nowrap", // no wrapping
                            width: "100%",
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
        </div>
    );
}

export default WordleKeyboard;
