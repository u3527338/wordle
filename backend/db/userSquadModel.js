import mongoose from "mongoose";

const UserSquadSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    tab: {
        type: String,
        required: true,
    },
    mode: {
        type: String,
        required: true,
    },
    squads: [
        {
            type: {
                type: String,
                required: true,
            },
            characters: [
                {
                    user_character: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "UserCharacters",
                        default: null,
                    },
                    skill_sets: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Skills",
                            default: null,
                        },
                    ],
                    book_sets: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Books",
                            default: null,
                        },
                    ],
                    hasTreasure: {
                        type: Boolean,
                        default: false,
                    },
                },
            ],
        },
    ],
});

const UserSquadModel = mongoose.model("UserSquads", UserSquadSchema);

export default UserSquadModel;
