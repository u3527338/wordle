import mongoose from "mongoose";

const GameHistorySchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true },
    mode: {
        type: String,
        enum: ["singlePlayer", "twoPlayerCustom", "twoPlayerServer"],
        required: true,
    },
    players: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
            name: String,
            isWinner: Boolean,
            guesses: [String],
        },
    ],
    winnerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    createdAt: { type: Date, default: Date.now },
});

const GameHistoryModel = mongoose.model("GameHistory", GameHistorySchema);

export default GameHistoryModel;
