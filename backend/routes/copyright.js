import express from "express";
import multer from "multer";
import { uploadToIPFS } from "../utils/ipfs.js"; // 👈 include .js extension in ESM

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", upload.single("file"), async (req, res) => {
  try {
    const ipfsHash = await uploadToIPFS(req.file.buffer);
    res.json({ ipfsHash });
  } catch (err) {
    console.error("IPFS Upload Error:", err);
    res.status(500).json({ error: "IPFS Upload Failed" });
  }
});

export default router;
