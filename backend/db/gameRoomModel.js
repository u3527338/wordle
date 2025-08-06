import mongoose from "mongoose";

const GameRoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    mode: {
        type: String,
        enum: ["singlePlayer", "twoPlayerCustom", "twoPlayerServer"],
        required: true,
    },
    players: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
            username: String,
            joinedAt: { type: Date, default: Date.now },
        },
    ],
    status: {
        type: String,
        enum: ["Waiting", "Playing", "Completed"],
        default: "waiting",
    },
    createdAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    endedAt: { type: Date },
});

const GameRoomModel = mongoose.model("GameRoom", GameRoomSchema);

export default GameRoomModel;
