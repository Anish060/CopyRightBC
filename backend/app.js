import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import copyrightRoutes from "./routes/copyright.js"; // 👈 note the .js extension
import userc from './routes/user_routes.js';
import bodyParser from "body-parser";
dotenv.config();

const app = express();

// ✅ Enable JSON parsing
app.use(express.json());

// ✅ Enable form data parsing if needed
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ CORS for frontend connection
app.use(cors({ origin: "http://localhost:5173", credentials: true }));


// Routes
app.use("/api", copyrightRoutes);
app.use("/user",userc);

const PORT = 8081;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
