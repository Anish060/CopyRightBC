import axios from "axios";
import stringSimilarity from "string-similarity";

/**
 * Downloads file text content from IPFS via local gateway
 */
const getFileFromIPFS = async (ipfsHash) => {
  try {
    const res = await axios.get(`http://127.0.0.1:8080/ipfs/${ipfsHash}`, {
      responseType: "text",
      timeout: 15000, // 15s safety timeout
    });
    return res.data?.toString() || "";
  } catch (err) {
    console.error(`Error fetching IPFS file ${ipfsHash}:`, err.message);
    return "";
  }
};

/**
 * Compares two text documents locally and returns similarity percentage (0–100)
 */
const compareDocumentsLocal = (text1, text2) => {
  if (!text1 || !text2) return 0;
  const similarity = stringSimilarity.compareTwoStrings(text1, text2);
  return similarity * 100; // convert to percentage
};

/**
 * Optimized: Given a new IPFS hash, compares it against all existing IPFS hashes in DB.
 * Returns early if similarity > 80% with any document.
 */
export const isCopiedWork = async (newIpfsHash, existingHashes) => {
  const newDoc = await getFileFromIPFS(newIpfsHash);
  if (!newDoc) return { copied: false };

  // Fetch all existing docs in parallel
  const existingDocs = await Promise.all(
    existingHashes.map((hash) =>
      getFileFromIPFS(hash).then((text) => ({ hash, text }))
    )
  );

  for (const { hash, text } of existingDocs) {
    if (!text) continue;

    const similarity = compareDocumentsLocal(newDoc, text);
    console.log(
      `Local similarity between ${newIpfsHash} and ${hash}: ${similarity.toFixed(
        2
      )}%`
    );

    if (similarity >= 80) {
      return { copied: true, match: hash, similarity };
    }
  }

  return { copied: false };
};
