// src/pages/Upload.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { connectWallet, registerWork, listenWorkRegistered } from "../utils/contract";

function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAccount(addr);
      setMessage(`Connected: ${addr}`);
    } catch (err) {
      setMessage(`Wallet connection failed: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    if (!file) return setMessage("⚠️ Select a file first!");
    if (!account) return setMessage("⚠️ Connect your wallet first!");

    try {
      // Upload to backend (which stores in IPFS)
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:8081/api/register", formData);
      const ipfsHash = res.data.ipfsHash;

      // Register on blockchain
      const receipt = await registerWork(ipfsHash);

      setMessage(
        `✅ Work registered!\n📦 IPFS Hash: ${ipfsHash}\n🔗 Tx: ${receipt.transactionHash}`
      );
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  // Listen for new registrations (optional)
  useEffect(() => {
    listenWorkRegistered((data) => {
      console.log("New work registered on chain:", data);
    });
  }, []);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "auto",
        padding: 30,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        ⬆️ Upload & Register Work
      </h2>

      {!account && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleConnect}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            🔗 Connect Wallet
          </button>
        </div>
      )}

      {account && (
        <div style={{ textAlign: "center" }}>
          <input
            type="file"
            onChange={handleFileChange}
            style={{
              display: "block",
              margin: "20px auto",
              border: "1px solid #d1d5db",
              padding: "8px",
              borderRadius: 6,
              background: "white",
            }}
          />
          <button
            onClick={handleUpload}
            style={{
              marginTop: 10,
              background: "#16a34a",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            ✅ Upload & Register
          </button>
        </div>
      )}

      {message && (
        <p
          style={{
            marginTop: 20,
            whiteSpace: "pre-wrap",
            textAlign: "center",
            color: message.startsWith("✅") ? "green" : message.startsWith("❌") ? "red" : "#b45309",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default Upload;
