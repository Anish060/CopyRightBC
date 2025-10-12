import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import copyrightRoutes from "./routes/copyright.js"; // 👈 note the .js extension

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", copyrightRoutes);

const PORT = 8081;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
