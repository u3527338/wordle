import GameHistoryModel from "./db/gameHistoryModel.js";
import PlayerModel from "./db/playerModel.js";
import wordleData from "./wordle.json" assert { type: "json" };

export const updateGameInfo = async ({
    gameId,
    userId,
    mode,
    players,
    winnerUserId,
}) => {
    if (!gameId || !userId || !mode || !players || !winnerUserId) {
        return res
            .status(400)
            .json({ status: "error", message: "Missing required fields" });
    }

    try {
        // Check if record already exists
        let gameRecord = await GameHistoryModel.findOne({ gameId });

        if (!gameRecord) {
            // If not, create a new game record with current user
            gameRecord = new GameHistoryModel({
                gameId,
                mode,
                players,
                winnerUserId,
            });
            await gameRecord.save();
        }

        // Update player's stats
        const player = players.find((p) => p.id === userId);
        await updatePlayerStats({
            userId,
            mode,
            isWinner: userId === winnerUserId,
            guessesCount: player.guesses ? player.guesses.length : 0,
        });
    } catch (err) {
        console.error("Error processing game history:", err);
    }
};

async function updatePlayerStats({ userId, mode, isWinner, guessesCount }) {
    try {
        const player = await PlayerModel.findById(userId);
        if (!player) {
            throw new Error("Player not found");
        }

        // Increment total games
        player.stats.totalGames += 1;

        // Update lastPlayed date
        player.stats.lastPlayed = new Date();

        // Update mode-specific stats
        if (player.stats.modeStats && player.stats.modeStats[mode]) {
            const modeStats = player.stats.modeStats[mode];
            modeStats.gamesPlayed += 1;

            if (isWinner) {
                modeStats.wins += 1;
            }

            // Add guessesCount to guessesSum
            modeStats.guessesSum += guessesCount;
        }

        // Update totalWins if player won
        if (isWinner) {
            player.stats.totalWins += 1;
        }

        await player.save();
        console.log("Player stats updated successfully");
    } catch (err) {
        console.error("Error updating player stats:", err);
    }
}

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
