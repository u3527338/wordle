import wordleData from "./wordle.json" assert { type: "json" };

export const getTargetWord = () => {
    const words = wordleData.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    console.log({ targetWord: words[randomIndex] });
    return words[randomIndex];
};

export const getColors = (guess, target) => {
    const guessLetters = guess.split("");
    const targetLetters = target.split("");
    const result = Array(5).fill("gray");

    // First pass: correct position
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result[i] = "green";
            targetLetters[i] = null; // mark used
        }
    }

    // Second pass: wrong position
    for (let i = 0; i < 5; i++) {
        if (result[i] !== "green") {
            const index = targetLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                result[i] = "yellow";
                targetLetters[index] = null; // mark as used
            }
        }
    }
    return result;
};

export const isValidWord = (word) => {
    const words = wordleData.words;
    return words.includes(word.toUpperCase());
};
