import mongoose from "mongoose";
const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
    },
    quality: {
        type: String,
        required: true,
    },
    probability: {
        type: Number,
        required: true,
    },
    probability_max: {
        type: Number,
    },
    description: {
        type: String,
        required: true,
    },
    allowance: [
        {
            type: String,
            required: true,
        },
    ],
    hasOwner: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const SkillModel = mongoose.model("Skills", SkillSchema);

export default SkillModel;
