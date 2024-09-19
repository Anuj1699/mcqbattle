import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    matchId: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    questions: { type: Array, required: true },
    players: [
        {
            id: { type: String, required: true },
            score: { type: Number, default: 0 }
        }
    ],
    isActive: { type: Boolean, default: true }
});

const match = mongoose.model("Match", matchSchema);

export default match;