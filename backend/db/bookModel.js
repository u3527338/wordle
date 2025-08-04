import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        required: true,
    },
    isParent: {
        type: Boolean,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
})

const BookModel = mongoose.model("Books", BookSchema)

export default BookModel