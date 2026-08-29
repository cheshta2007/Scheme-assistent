import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import ProfileForm from "./pages/ProfileForm";
import Results from "./pages/Results";
import "./index.css";

export default function App() {
  const [sharedResults, setSharedResults] = useState(null);

  const handleResultsFetched = (apiData, userProfile) => {
    setSharedResults({ apiData, userProfile });
  };

  return (
    <div className="app-layout">
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">🏛️</span>
            <div>
              <span className="brand-title">Scheme Assistant</span>
              <span className="brand-badge">Phase 4 AI Agent</span>
            </div>
          </Link>
          <div className="navbar-tagline">
            Deterministic Rules Decide • AI Explains
          </div>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<ProfileForm onResultsFetched={handleResultsFetched} />}
          />
          <Route
            path="/results"
            element={<Results sharedResults={sharedResults} />}
          />
          <Route
            path="*"
            element={<ProfileForm onResultsFetched={handleResultsFetched} />}
          />
        </Routes>
      </main>

      <footer className="footer">
        <p>AI-Powered Scheme Assistance Agent • Deterministic Eligibility Engine with LLM Explanations</p>
      </footer>
    </div>
  );
}
