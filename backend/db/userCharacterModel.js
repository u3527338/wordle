import mongoose from "mongoose";

const UserCharacterSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // Reference to the 'Users' model
        required: true,
    },
    character_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Characters", // Reference to the 'Characters' model
    },
    rating: {
        type: Number,
        required: true,
    },
    is_active: {
        type: Boolean,
        required: true,
    },
});

const UserCharacterModel = mongoose.model(
    "UserCharacters",
    UserCharacterSchema
);

export default UserCharacterModel;
