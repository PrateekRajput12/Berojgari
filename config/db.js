const mongoose = require("mongoose")

const db = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB COnnected")
    } catch (e) {
        console.log("MongoDb Connection Failed", e.message)
        process.exit(1)
    }


}

module.exports = db