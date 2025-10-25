// src/App.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  connectWallet,
  registerWork,
  getWork,
  listenWorkRegistered,
} from "./utils/contract";
import "./App.css";

// 🎨 INLINE CSS STYLES FOR DASHBOARD (Best Practice: Define complex styles outside JSX)
const dashboardStyles = {
  section: {
    padding: '40px 0',
    backgroundColor: '#f8f9fa', // Lighter background than the previous example
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 15px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)', // Bootstrap-like shadow
    overflow: 'hidden',
  },
  // Table Styles
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'auto',
  },
  thead: {
    backgroundColor: '#f0f0f0',
    color: '#343a40',
    borderBottom: '2px solid #dee2e6',
  },
  th: {
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  td: {
    padding: '12px 15px',
    verticalAlign: 'middle',
    fontSize: '0.9375rem',
    color: '#495057',
    borderBottom: '1px solid #dee2e6',
  },
  tdTitle: {
    fontWeight: '500',
    color: '#212529',
  },
  tdHash: {
    color: '#6c757d',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
  },
  tdTx: {
    color: '#0d6efd',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100px',
  },
  // Status Badge Styles
  statusRegistered: {
    padding: '4px 10px',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#d1e7dd', // Green-light
    color: '#0f5132', // Green-dark
    display: 'inline-block'
  },
  // Action Button Style (Matching the "View" button in the image)
  actionButton: {
    padding: '6px 12px',
    fontSize: '0.875rem',
    color: '#0d6efd',
    backgroundColor: '#fff',
    border: '1px solid #0d6efd',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    textDecoration: 'none', // Important for an <a> tag styled as a button
    display: 'inline-block',
    textAlign: 'center',
  },
  // Placeholder Styles
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
  },
  error: {
    textAlign: 'center',
    color: '#dc3545',
    padding: '20px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c2c7',
    borderRadius: '0.25rem',
    margin: '15px',
  },
};

function App() {
  const [account, setAccount] = useState("");
  const [file, setFile] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);
  const [hashValue, setHashValue] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [message, setMessage] = useState("");

  // 🔹 Registration states
  const [contentType, setContentType] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // New state for loading

  // 🔹 Dashboard states
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:8081";

  // ---------------------------
  // 🌐 Data Fetching Logic
  // ---------------------------
  const fetchWorks = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = `${API_BASE_URL}/user/all`; 

      if (account) {
        endpoint = `${API_BASE_URL}/user/${account}`;
      }

      const res = await axios.get(endpoint);
      const data = res.data?.data || res.data || [];

      // Sort data by date descending for dashboard
      data.sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));

      setWorks(data);
    } catch (err) {
      console.error("Error fetching works:", err);
      setError("Failed to fetch registered works. Check backend server status.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 🔗 Effects
  // ---------------------------
  // refetch whenever wallet changes
  useEffect(() => {
    if (account) fetchWorks();
  }, [account]);

  // initial load & basic cleanup
  useEffect(() => {
    fetchWorks();
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);


  // ---------------------------
  // 🔑 Event Handlers
  // ---------------------------

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      const addr = await connectWallet();
      setAccount(addr);
      document.getElementById("walletStatus").innerText = `Connected: ${addr.slice(
        0,
        6
      )}...${addr.slice(-4)}`;
      document.getElementById("walletStatus").classList.remove("not-connected");
      document.getElementById("walletStatus").classList.add("connected");
      listenWorkRegistered((data) =>
        console.log("✅ Blockchain Event:", data)
      );
      setMessage("✅ Wallet connected successfully! Dashboard loading...");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  // Register copyright (COMBINED DB, IPFS, and BLOCKCHAIN LOGIC)
const handleRegister = async (e) => {
  e.preventDefault();
  if (!file) return setMessage("⚠️ Please select a file");
  if (!account) return setMessage("⚠️ Connect your wallet first");

  setIsRegistering(true);
  setMessage("⏳ Uploading file to IPFS...");

  try {
    // 1️⃣ Upload file to IPFS
    const formData = new FormData();
    formData.append("file", file);
    const ipfsRes = await axios.post(`${API_BASE_URL}/api/register`, formData);
    const ipfsHash = ipfsRes.data.ipfsHash;

    setMessage(`⏳ IPFS Hash generated: ${ipfsHash}. Checking similarity...`);

    // 2️⃣ Backend similarity check + DB insert
    const dbRes = await axios.post(`${API_BASE_URL}/user/register`, {
      title: workTitle,
      type: contentType,
      creator: creatorName,
      wallet_id: account,
      ipfs_hash: ipfsHash,
      status: "Registered"
    });

    // If backend allowed registration → register on Blockchain
    setMessage(`⏳ Registering work on blockchain... Confirm in MetaMask`);
    await registerWork(ipfsHash); // No receipt check needed

    setMessage(`✅ Successfully registered! IPFS: ${ipfsHash}`);
    fetchWorks(); // refresh dashboard
    document.getElementById("registrationForm").reset();
  } catch (err) {
    console.error(err);

    const similarityMsg = err.response?.data?.similarity
      ? `⚠️ Work rejected! Similarity: ${err.response.data.similarity}% with ${err.response.data.match}`
      : "";

    setMessage(`❌ Registration failed. ${similarityMsg} ${err.message || ""}`);
  } finally {
    setIsRegistering(false);
  }
};

 // Verify copyright (Unchanged, as it uses getWork from contract)
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!hashValue && !verifyFile) return setMessage("⚠️ Provide file or hash");
    if (!account) return setMessage("⚠️ Connect wallet first");

    try {
      const targetHash = hashValue || "dummyHashFromFile";
      const work = await getWork(targetHash);
      if (work.author === "0x0000000000000000000000000000000000000000") {
        setVerifyResult(null);
        setMessage("❌ No record found on the blockchain for that hash.");
      } else {
        setVerifyResult({
          author: work.author,
          timestamp: new Date(Number(work.timestamp) * 1000).toLocaleString(), // Convert seconds to milliseconds
          ipfsHash: work.ipfsHash,
        });
        setMessage("✅ Verification successful! Record found on chain.");
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
        <div className="container">
          <a className="navbar-brand" href="#">
            <i className="fas fa-copyright me-2"></i>CHAINCOPYRIGHT
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link" href="#how-it-works">How It Works</a></li>
              <li className="nav-item"><a className="nav-link" href="#register">Register</a></li>
              <li className="nav-item"><a className="nav-link" href="#verify">Verify</a></li>
              <li className="nav-item"><a className="nav-link" href="#dashboard">Dashboard</a></li>
            </ul>
            <button
              className="btn btn-outline-light ms-3"
              id="connectWallet"
              onClick={handleConnectWallet}
            >
              {account ? "Wallet Connected" : "Connect Wallet"}
            </button>
            <span className="wallet-status not-connected" id="walletStatus">
              Not Connected
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section (Unchanged) */}
      <section className="hero-section">
        <div className="container text-center">
          <div className="row align-items-center min-vh-100">
            <div className="col-12">
              <h1 className="display-4 fw-bold mb-4">
                Protect Your Creative Work with Blockchain
              </h1>
              <p className="lead mb-5">
                Register and verify copyrights for your digital content with
                our tamper-proof, decentralized platform.
              </p>
              <button className="btn btn-light btn-lg me-3">Get Started</button>
              <button className="btn btn-outline-light btn-lg">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Unchanged) */}
      <section id="features" className="py-5">
        <div className="container text-center mb-5">
          <h2 className="fw-bold">Why Choose CHAINCOPYRIGHT?</h2>
          <p className="text-muted">
            Leveraging blockchain technology to revolutionize copyright
            management
          </p>
        </div>
        <div className="container">
          <div className="row g-4">
            {[
              ["shield-alt", "Tamper-Proof Records", "Immutable and secure blockchain records."],
              ["clock", "Timestamped Proof", "Prove exactly when your work was created."],
              ["globe", "Global Verification", "Check authenticity from anywhere."],
            ].map(([icon, title, desc], i) => (
              <div className="col-md-4" key={i}>
                <div className="card feature-card h-100 p-4">
                  <div className="card-body text-center">
                    <i className={`fas fa-${icon} fa-3x text-primary mb-3`}></i>
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (Unchanged) */}
      <section id="how-it-works" className="how-it-works py-5">
        <div className="container text-center mb-5">
          <h2 className="fw-bold">How It Works</h2>
          <p className="text-muted">
            Register and verify copyrights in a few simple steps
          </p>
        </div>
        <div className="container row mx-auto">
          <div className="col-lg-6">
            {["Upload Your Content", "Generate Hash", "Record on Blockchain", "Receive Certificate"].map((step, i) => (
              <div className="step-card mb-4" key={i}>
                <h4>
                  <span className="copyright-badge">{i + 1}</span> {step}
                </h4>
                <p>Placeholder explanation text for {step.toLowerCase()}.</p>
              </div>
            ))}
          </div>
          <div className="col-lg-6 text-center">
            <i className="fas fa-file-upload fa-5x mb-3"></i>
            <h3>Process Visualization</h3>
          </div>
        </div>
      </section>

      {/* Registration Section (Updated with isRegistering state) */}
      <section id="register" className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 text-center">
              <i className="fas fa-file-contract fa-5x mb-3"></i>
              <h3>Register Your Work</h3>
            </div>

            <div className="col-lg-6">
              <h2 className="fw-bold mb-4">Register Your Copyright</h2>
              <form id="registrationForm" onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="contentType" className="form-label">Content Type</label>
                  <select
                    className="form-select"
                    id="contentType"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    required
                  disabled={isRegistering}
                  >
                    <option value="">Select content type</option>
                    <option value="image">Image</option>
                    <option value="music">Music</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="fileUpload" className="form-label">Upload File</label>
                  <input
                    className="form-control"
                    type="file"
                    id="fileUpload"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  disabled={isRegistering}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="creatorName" className="form-label">Creator Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="creatorName"
                    placeholder="Your full name"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    required
                  disabled={isRegistering}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="workTitle" className="form-label">Work Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="workTitle"
                    placeholder="Title of your work"
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    required
                  disabled={isRegistering}
                  />
                </div>

                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="termsCheck" required disabled={isRegistering} />
                  <label className="form-check-label" htmlFor="termsCheck">
                    I agree to the terms and conditions
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" disabled={isRegistering}>
                  {isRegistering ? 'Processing...' : 'Register Copyright'}
                </button>
              </form>

              {message && (
                <p className="mt-3" style={{ whiteSpace: "pre-wrap" }}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Verification Section (Unchanged) */}
      <section id="verify" className="how-it-works py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4">Verify Copyright</h2>
              <form onSubmit={handleVerify}>
                <div className="mb-3">
                  <label className="form-label">Upload File (optional)</label>
                  <input
                    className="form-control"
                    type="file"
                    onChange={(e) => setVerifyFile(e.target.files[0])}
                  />
                </div>
                <div className="mb-3 text-center fw-bold">Or</div>
                <div className="mb-3">
                  <label className="form-label">Enter Hash Value</label>
                  <input
                    type="text"
                    className="form-control"
                    value={hashValue}
                    onChange={(e) => setHashValue(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary btn-lg">Verify</button>
              </form>
              {verifyResult && (
                <div className="card mt-4 p-3">
                  <p><strong>Author:</strong> {verifyResult.author}</p>
                  <p><strong>Timestamp:</strong> {verifyResult.timestamp}</p>
                  <p><strong>Hash:</strong> {verifyResult.ipfsHash}</p>
                </div>
              )}
            </div>
            <div className="col-lg-6 text-center">
              <i className="fas fa-search fa-5x mb-3"></i>
              <h3>Verify Authenticity</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 DASHBOARD SECTION (MODIFIED FOR TX HASH) 🚀 */}
      <section id="dashboard" style={dashboardStyles.section}>
        <div style={dashboardStyles.container}>
          <div style={dashboardStyles.header}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#212529', marginBottom: '8px' }}>Your Dashboard</h2>
            <p style={{ color: '#6c757d', fontSize: '1rem' }}>Manage all your registered content</p>
          </div>

          <div style={dashboardStyles.card}>
            {loading ? (
              <div style={dashboardStyles.loading}>
                {/* Simplified loading spinner */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <div style={{ border: '4px solid rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #0d6efd', borderRadius: '50%', width: '24px', height: '24px' /* animation: 'spin 1s linear infinite' */ }}></div>
                </div>
                Loading registered works...
              </div>
            ) : error ? (
              <div style={dashboardStyles.error}>
                {error}
              </div>
            ) : works.length === 0 ? (
              <div style={dashboardStyles.loading}>
                <p>No registered works found.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Try uploading one to get started!</p>
              </div>
            ) : (
              <div style={dashboardStyles.tableWrapper}>
                <table style={dashboardStyles.table}>
                  <thead style={dashboardStyles.thead}>
                    <tr>
                      <th style={dashboardStyles.th}>Title</th>
                      <th style={dashboardStyles.th}>Type</th>
                      <th style={dashboardStyles.th}>Date</th>
                      <th style={dashboardStyles.th}>IPFS Hash</th> 
                      <th style={dashboardStyles.th}>Tx Hash</th> {/* NEW COLUMN */}
                      <th style={dashboardStyles.th}>Status</th>
                      <th style={dashboardStyles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.map((work) => (
                      <tr key={work.id}>
                        <td style={{ ...dashboardStyles.td, ...dashboardStyles.tdTitle }}>
                          {work.title}
                        </td>
                        <td style={dashboardStyles.td}>{work.type}</td>
                        <td style={dashboardStyles.td}>
                          {new Date(work.registration_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </td>
                        <td style={{ ...dashboardStyles.td, ...dashboardStyles.tdHash }}>
                          {/* Assuming ipfs_hash exists on work object */}
                          {work.ipfs_hash ? `${work.ipfs_hash.slice(0, 5)}...${work.ipfs_hash.slice(-4)}` : 'N/A'}
                        </td>
                        {/* Render Transaction Hash */}
                        <td style={{ ...dashboardStyles.td, ...dashboardStyles.tdTx }}>
                          {work.tx_hash ? `${work.tx_hash.slice(0, 5)}...${work.tx_hash.slice(-4)}` : 'N/A'}
                        </td>
                        <td style={dashboardStyles.td}>
                          <span
                            style={work.status === "Registered" ? dashboardStyles.statusRegistered : { ...dashboardStyles.statusRegistered, backgroundColor: '#fff3cd', color: '#664d03' }}
                          >
                            {work.status}
                          </span>
                        </td>
                        <td style={dashboardStyles.td}>
                          <a
                            href={work.ipfs_hash ? `http://127.0.0.1:8080/ipfs/${work.ipfs_hash}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={dashboardStyles.actionButton}
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer (Unchanged) */}
      <footer className="py-5">
        <div className="container text-center">
          <p>&copy; 2025 CHAINCOPYRIGHT. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default App;