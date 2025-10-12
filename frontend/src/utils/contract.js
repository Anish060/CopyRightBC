// utils/contract.js
import { ethers } from "ethers";
import abi from "../../../smart-contracts/artifacts/contracts/copyright.sol/Copyright.json"
// ======= CONFIG =======
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Paste your compiled ABI JSON here (from Hardhat artifacts)
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "registerWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "works",
    "outputs": [
      { "internalType": "address", "name": "author", "type": "address" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "WorkRegistered",
    "type": "event"
  }
];

// ======= PROVIDER & CONTRACT =======
let provider;
let signer;
let contract;

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
const address = await signer.getAddress();
return address;
};

// ======= FUNCTIONS =======
export const registerWork = async (ipfsHash) => {
  if (!contract) throw new Error("Connect wallet first");
  const tx = await contract.registerWork(ipfsHash);
  const receipt = await tx.wait();
  return receipt; // includes transaction info
};

export const getWork = async (ipfsHash) => {
  if (!contract) throw new Error("Connect wallet first");
  const work = await contract.works(ipfsHash);
  return {
    author: work.author,
    ipfsHash: work.ipfsHash,
    timestamp: Number(work.timestamp) * 1000 // convert to ms
  };
};

// Listen to new works registered
export const listenWorkRegistered = (callback) => {
  if (!contract) throw new Error("Connect wallet first");
  contract.on("WorkRegistered", (author, ipfsHash, timestamp) => {
    callback({ author, ipfsHash, timestamp: Number(timestamp) * 1000 });
  });
};
