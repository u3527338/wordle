import mongoose from "mongoose";

const CharacterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    quality: {
        type: String,
        required: true,
    }, 
    faction: {
        type: String,
        required: true,
    },
    arms: {
        lance: {
            type: String,
            required: true,
        },
        shield: {
            type: String,
            required: true,
        },
        bow: {
            type: String,
            required: true,
        },
        horse: {
            type: String,
            required: true,
        },
        engine: {
            type: String,
            required: true,
        },
        navy: {
            type: String,
            required: true,
        },
    },
    attributes: {
        power: {
            original: {
                type: Number,
                required: true,
            },
            growth: {
                type: Number,
                required: true,
            },
        },
        intelligence: {
            original: {
                type: Number,
                required: true,
            },
            growth: {
                type: Number,
                required: true,
            },
        },
        defense: {
            original: {
                type: Number,
                required: true,
            },
            growth: {
                type: Number,
                required: true,
            },
        },
        speed: {
            original: {
                type: Number,
                required: true,
            },
            growth: {
                type: Number,
                required: true,
            },
        },
        politics: {
            original: {
                type: Number,
                required: true,
            },
            growth: {
                type: Number,
                required: true,
            },
        },
        charm: {
            original: {
                type: Number,
                required: true,
            },
            growth: {
                type: Number,
                required: true,
            },
        },
    },
    self_skill: {
        type: String,
        // required: true,
    },
    book_options: [
        {
            type: String,
            required: true,
            default: null
        },
    ],
    cost: {
        type: Number,
        required: true,
    },
    img: {
        type: String,
    },
});

const CharacterModel = mongoose.model("Characters", CharacterSchema);

export default CharacterModel;
