import GameHistoryModel from "./db/gameHistoryModel.js";
import PlayerModel from "./db/playerModel.js";
import wordleData from "./wordle.json" assert { type: "json" };

export const findRoomIdByPlayerId = (rooms, id) => {
    for (const roomId in rooms) {
        const room = rooms[roomId];
        if (room.players.some((p) => p.socketId === id)) {
            return roomId;
        }
    }
    return null;
};

export const updateGameInfo = async ({
    gameId,
    userId,
    mode,
    players,
    winnerUserId,
}) => {
    if (!gameId || !userId || !mode || !players) {
        return { status: "error", message: "Missing required fields" };
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
        await Promise.all(
            players.map(async (player) => {
                await updatePlayerStats({
                    userId: player.id,
                    mode,
                    isWinner: player.id === winnerUserId,
                    guessesCount: player.guesses ? player.guesses.length : 0,
                });
            })
        );
    } catch (err) {
        console.log("error");
        return {
            status: "error",
            message: "Error creating game history",
            error: err,
        };
    }
};

async function updatePlayerStats({ userId, mode, isWinner, guessesCount }) {
    try {
        const player = await PlayerModel.findById(userId);
        if (!player) {
            throw new Error("Player not found");
        }

        // Increment total games and gusssesCount
        player.stats.totalGames += 1;
        player.stats.totalGuesses += guessesCount;

        // Update lastPlayed date
        player.stats.lastPlayed = new Date();

        // Update mode-specific stats
        if (player.stats.modeStats && player.stats.modeStats[mode]) {
            const modeStats = player.stats.modeStats[mode];
            console.log("update user gamesPlayed", userId);
            modeStats.gamesPlayed += 1;

            if (isWinner) {
                modeStats.wins += 1;
            }

            // Add guessesCount to totalGuesses
            modeStats.totalGuesses += guessesCount;
        }

        // Update totalWins if player won
        if (isWinner) {
            player.stats.totalWins += 1;
        }

        await player.save();
        console.log("Player stats updated successfully");
        console.log({ userId, isWinner });
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
