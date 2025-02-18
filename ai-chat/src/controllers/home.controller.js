import { AsyncHandler } from "../utils/AsyncHandler.js";

const home = AsyncHandler(async (req, res) => {
  res.status(200).json({ "AI-Chat-Service Status": "Connected" });
});

export { home };