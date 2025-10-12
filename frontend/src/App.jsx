import { useState } from "react";
import Upload from "./pages/Upload";
import Dash from "./pages/Dash";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #eef2ff, #fef9c3)",
        padding: "20px",
      }}
    >
      {/* Header */}
      <header
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#1e3a8a",
            marginBottom: "10px",
          }}
        >
          🪙 Copyright Blockchain
        </h1>
        <p style={{ color: "#374151", fontSize: "1rem" }}>
          Securely upload and register your creative works on the blockchain
        </p>
      </header>

      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => setPage("dashboard")}
          style={{
            background: page === "dashboard" ? "#2563eb" : "white",
            color: page === "dashboard" ? "white" : "#2563eb",
            border: "2px solid #2563eb",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setPage("upload")}
          style={{
            background: page === "upload" ? "#16a34a" : "white",
            color: page === "upload" ? "white" : "#16a34a",
            border: "2px solid #16a34a",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ⬆️ Upload
        </button>
      </nav>

      {/* Page Content */}
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        {page === "dashboard" && <Dash />}
        {page === "upload" && <Upload />}
      </main>
    </div>
  );
}

export default App;
