// registeredWorksController.js

const registeredWorksModel = require("../model/user_info.js");
const { isCopiedWork } = require("../utils/geminiSimilarity.js");

/**
 * @desc Register a new work by adding it to the database.
 * @route POST /api/works/register
 * @access Private (Requires Wallet/Auth)
 */
const registerWork = async (req, res) => {
  const { title, type, creator, wallet_id, ipfs_hash, status } = req.body;

  if (!title || !type || !creator || !wallet_id || !ipfs_hash) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const allWorks = await registeredWorksModel.getAllRegisteredWorks();
    const existingHashes = allWorks.map(w => w.ipfs_hash);

    const plagiarismCheck = await isCopiedWork(ipfs_hash, existingHashes);

    if (plagiarismCheck.copied) {
      return res.status(400).json({
        message: `⚠️ Copied Work Detected! Similarity: ${plagiarismCheck.similarity}%`,
        similarity: plagiarismCheck.similarity,
        match: plagiarismCheck.match
      });
    }

    // Only now insert into DB
    const workData = { title, type, creator, wallet_id, ipfs_hash, status };
    const result = await registeredWorksModel.addRegisteredWork(workData);

    res.status(201).json({
      message: 'Work successfully registered!',
      registration_id: result.insertId,
      details: workData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllWorks = async (req, res) => {
  try {
    const works = await registeredWorksModel.getAllRegisteredWorks();

    if (!works || works.length === 0) {
      return res.status(200).json({ message: "No registered works found.", data: [] });
    }

    res.status(200).json({
      count: works.length,
      data: works,
    });
  } catch (error) {
    console.error("Error fetching all registered works:", error);
    res.status(500).json({
      message: "Failed to retrieve all registered works.",
      error: error.message,
    });
  }
};

const getWorksByWallet = async (req, res) => {
  const walletId = req.params.walletId;

  if (!walletId) {
    return res.status(400).json({ message: "Wallet ID parameter is missing." });
  }

  try {
    const works = await registeredWorksModel.getWorksByWalletId(walletId);

    if (works.length === 0) {
      return res.status(200).json({
        message: `No registered works found for wallet ID: ${walletId}.`,
        data: [],
      });
    }

    res.status(200).json({
      wallet_id: walletId,
      count: works.length,
      data: works,
    });
  } catch (error) {
    console.error(`Error fetching works for wallet ${walletId}:`, error);
    res.status(500).json({
      message: "Failed to retrieve works by wallet ID.",
      error: error.message,
    });
  }
};

module.exports = {
  registerWork,
  getAllWorks,
  getWorksByWallet,
};
