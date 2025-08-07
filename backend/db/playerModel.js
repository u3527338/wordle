import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
        unique: true,
    },
    role: [
        {
            type: String,
            required: true,
        },
    ],
    stats: {
        totalGames: { type: Number, default: 0 },
        totalWins: { type: Number, default: 0 },
        totalGuesses: { type: Number, default: 0 },
        modeStats: {
            singlePlayer: {
                gamesPlayed: { type: Number, default: 0 },
                wins: { type: Number, default: 0 },
                totalGuesses: { type: Number, default: 0 },
            },
            twoPlayerCustom: {
                gamesPlayed: { type: Number, default: 0 },
                wins: { type: Number, default: 0 },
                totalGuesses: { type: Number, default: 0 },
            },
            twoPlayerServer: {
                gamesPlayed: { type: Number, default: 0 },
                wins: { type: Number, default: 0 },
                totalGuesses: { type: Number, default: 0 },
            },
        },
        lastPlayed: { type: Date },
    },
});

const PlayerModel = mongoose.model("Players", PlayerSchema);

export default PlayerModel;
