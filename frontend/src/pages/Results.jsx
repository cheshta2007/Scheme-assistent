import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import SchemeCard from "../components/SchemeCard";

export default function Results({ sharedResults }) {
  const location = useLocation();
  const navigate = useNavigate();

  const apiData = location.state?.apiData || sharedResults?.apiData;
  const userProfile = location.state?.userProfile || sharedResults?.userProfile;

  const [filter, setFilter] = useState("all"); // 'all' | 'eligible'

  if (!apiData || !apiData.results) {
    return (
      <div className="page-container">
        <div className="card empty-card">
          <h2>No Results Found</h2>
          <p>Please submit your user profile details first to see scheme eligibility evaluation.</p>
          <Link to="/" className="btn btn-primary">
            Go to Profile Form
          </Link>
        </div>
      </div>
    );
  }

  const { total_schemes_checked, eligible_count, results } = apiData;

  const displayedResults = results.filter((item) => {
    if (filter === "eligible") return item.eligible;
    return true;
  });

  return (
    <div className="page-container">
      <div className="results-header">
        <div>
          <h2>Eligibility Assessment Results</h2>
          {userProfile && (
            <p className="user-summary font-small">
              Evaluated for: {userProfile.age} yrs, ₹{Number(userProfile.income).toLocaleString()} income, {userProfile.occupation}, {userProfile.state} ({userProfile.category}, {userProfile.gender})
            </p>
          )}
        </div>
        <button onClick={() => navigate("/")} className="btn btn-secondary">
          ✎ Edit Profile
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-box">
          <span className="stat-value">{total_schemes_checked}</span>
          <span className="stat-label">Total Schemes Checked</span>
        </div>
        <div className="stat-box success">
          <span className="stat-value">{eligible_count}</span>
          <span className="stat-label">Eligible Schemes</span>
        </div>
        <div className="stat-box warning">
          <span className="stat-value">{total_schemes_checked - eligible_count}</span>
          <span className="stat-label">Ineligible Schemes</span>
        </div>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Schemes ({results.length})
        </button>
        <button
          className={`filter-tab ${filter === "eligible" ? "active" : ""}`}
          onClick={() => setFilter("eligible")}
        >
          Eligible Only ({eligible_count})
        </button>
      </div>

      {displayedResults.length === 0 ? (
        <div className="card empty-card">
          <p>No schemes match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="results-grid">
          {displayedResults.map((item, index) => (
            <SchemeCard key={item.scheme || index} schemeResult={item} />
          ))}
        </div>
      )}
    </div>
  );
}
