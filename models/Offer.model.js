import mongoose from "mongoose";


const offerSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
    },

    salary: {
        type: Number,
        required: true,
    },

    joiningDate: {
        type: Date,
        required: true,
    },

    offerLetterUrl: {
        type: String,
    },

    status: {
        type: String,
        enum: ["Sent", "Accepted", "Rejected", "Expired"],
        default: "Sent",
    },

    validTill: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true
})

const Offer = mongoose.model("Offer", offerSchema)

export default Offer