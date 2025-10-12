// src/pages/Dash.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  connectWallet,
  registerWork,
  getWork,
  listenWorkRegistered,
} from "../utils/contract";

function Dash() {
  const [tab, setTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [account, setAccount] = useState("");

  // Connect wallet
  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAccount(addr);
      setMessage(`Connected: ${addr}`);
    } catch (err) {
      setMessage(`Wallet connection failed: ${err.message}`);
    }
  };

  // Upload & Register Work
  const handleUpload = async () => {
    if (!file) return setMessage("Select a file first!");
    if (!account) return setMessage("Connect your wallet first!");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:8081/api/register", formData);
      const ipfsHash = res.data.ipfsHash;

      const receipt = await registerWork(ipfsHash);

      setMessage(
        `✅ Work registered!\nIPFS Hash: ${ipfsHash}\nTx: ${receipt.transactionHash}`
      );
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // Search Work
  const handleSearch = async () => {
    if (!hash) return setMessage("Enter an IPFS hash to search");
    if (!account) return setMessage("Connect your wallet first!");

    try {
      const work = await getWork(hash);
      if (
        work.author === "0x0000000000000000000000000000000000000000"
      ) {
        setResult(null);
        setMessage("No work found with this hash");
      } else {
        setResult({
          author: work.author,
          timestamp: new Date(work.timestamp).toLocaleString(),
          ipfsHash: work.ipfsHash,
        });
        setMessage("");
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // Listen for new registrations
  useEffect(() => {
    if (account) {
      listenWorkRegistered((data) => {
        console.log("New work registered on chain:", data);
      });
    }
  }, [account]);

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "auto",
        padding: 30,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        📜 Smart Copyright Dashboard
      </h1>

      {!account && (
        <div
          style={{
            textAlign: "center",
            background: "#f9fafb",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ marginBottom: 15 }}>
            Please connect your wallet to use the dashboard.
          </p>
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
        <div>
          {/* Tabs */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button
              onClick={() => setTab("upload")}
              disabled={tab === "upload"}
              style={{
                padding: "10px 20px",
                borderRadius: "8px 0 0 8px",
                border: "1px solid #2563eb",
                background: tab === "upload" ? "#2563eb" : "white",
                color: tab === "upload" ? "white" : "#2563eb",
                cursor: "pointer",
              }}
            >
              ⬆️ Upload
            </button>
            <button
              onClick={() => setTab("search")}
              disabled={tab === "search"}
              style={{
                padding: "10px 20px",
                borderRadius: "0 8px 8px 0",
                border: "1px solid #2563eb",
                background: tab === "search" ? "#2563eb" : "white",
                color: tab === "search" ? "white" : "#2563eb",
                cursor: "pointer",
              }}
            >
              🔍 Search
            </button>
          </div>

          {/* Upload Section */}
          {tab === "upload" && (
            <div
              style={{
                marginTop: 30,
                padding: 20,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#f9fafb",
              }}
            >
              <h2 style={{ marginBottom: 10 }}>Upload & Register Work</h2>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ marginBottom: 15 }}
              />
              <br />
              <button
                onClick={handleUpload}
                style={{
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

          {/* Search Section */}
          {tab === "search" && (
            <div
              style={{
                marginTop: 30,
                padding: 20,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#f9fafb",
              }}
            >
              <h2 style={{ marginBottom: 10 }}>Search Work</h2>
              <input
                type="text"
                placeholder="Enter IPFS hash"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  marginTop: 15,
                  background: "#2563eb",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🔍 Search
              </button>

              {result && (
                <div
                  style={{
                    marginTop: 20,
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    padding: 15,
                    background: "white",
                  }}
                >
                  <p>
                    <strong>IPFS Hash:</strong> {result.ipfsHash}
                  </p>
                  <p>
                    <strong>Author:</strong> {result.author}
                  </p>
                  <p>
                    <strong>Registered At:</strong> {result.timestamp}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {message && (
        <p
          style={{
            marginTop: 20,
            whiteSpace: "pre-wrap",
            textAlign: "center",
            color: message.startsWith("✅") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default Dash;
