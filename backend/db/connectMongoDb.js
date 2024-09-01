const mongoose = require("mongoose")

const connectMongoDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
    } catch(error) {
        console.log(`Failed to connect to MongoDb: ${error.message}`);
        process.exit(1)
    }
}

module.exports = connectMongoDb;