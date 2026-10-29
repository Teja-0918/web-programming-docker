const mongoose = require("mongoose");

// Database connection with auto-retry for container environments
async function connectDB(retries = 6, delay = 2500) {
    const mongoUri = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/mernexus";

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(mongoUri);
            console.log("mongoDB connected sucessfully");
            return;
        } catch (error) {
            console.log(`Database connection attempt ${attempt}/${retries} failed: ${error.message}`);
            if (attempt < retries) {
                console.log(`Retrying in ${delay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                console.error("All database connection attempts failed. Exiting...");
                process.exit(1);
            }
        }
    }
}

module.exports = connectDB;
