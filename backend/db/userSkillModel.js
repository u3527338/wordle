import mongoose from "mongoose";

const UserSkillSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // Reference to the 'Users' model
        required: true,
    },
    skill_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skills", // Reference to the 'Characters' model
    },
    is_active: {
        type: Boolean,
        required: true,
    },
});

const UserSkillModel = mongoose.model("UserSkills", UserSkillSchema);

export default UserSkillModel;
