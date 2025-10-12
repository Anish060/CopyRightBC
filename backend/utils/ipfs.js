import { create } from "ipfs-http-client";

// Use a local IPFS daemon for stability
const ipfs = create({ url: "http://localhost:5001" });

export const uploadToIPFS = async (fileBuffer) => {
  const result = await ipfs.add(fileBuffer);
  return result.path;
};