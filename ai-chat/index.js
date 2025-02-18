import dotenv from "dotenv";
import { app } from "./src/app.js";
import connectDB from "./src/config/database.config.js";
dotenv.config();

const PORT = process.env.PORT || 3002;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERR: ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`AI-Chat-Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error !!! ", err);
  });