import express from "express";
import cors from "cors";
import userRouter from "./src/routes/user.routes.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors({
    origin:"*",
}))

app.use("/users",userRouter);

app.listen(PORT, () => {
    console.log(`Gateway Server Running on port ${PORT}`);
  });