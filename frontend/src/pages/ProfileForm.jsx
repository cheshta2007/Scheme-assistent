import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEligibilityWithExplanation } from "../api";

const INDIAN_STATES = [
  "Maharashtra",
  "Delhi",
  "Punjab",
  "Kerala",
  "Karnataka",
  "Gujarat",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "All"
];

const OCCUPATIONS = [
  "Farmer",
  "Student",
  "Artisan",
  "Laborer",
  "Teacher",
  "Senior Citizen",
  "Software Engineer",
  "Self-Employed",
  "Other"
];

const CATEGORIES = ["General", "OBC", "SC", "ST"];
const GENDERS = ["Male", "Female", "Other"];

export default function ProfileForm({ onResultsFetched }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: 30,
    income: 150000,
    state: "Maharashtra",
    occupation: "Farmer",
    category: "General",
    gender: "Male"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        age: Number(formData.age),
        income: Number(formData.income),
        state: formData.state,
        occupation: formData.occupation,
        category: formData.category,
        gender: formData.gender
      };

      const response = await checkEligibilityWithExplanation(payload);
      
      if (onResultsFetched) {
        onResultsFetched(response, payload);
      }
      navigate("/results", { state: { apiData: response, userProfile: payload } });
    } catch (err) {
      console.error("Eligibility check failed:", err);
      setError(err.message || "Failed to connect to backend server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card form-card">
        <div className="form-header">
          <h2>Check Scheme Eligibility</h2>
          <p>Fill in your profile details to evaluate eligibility across verified government schemes with instant AI explanations.</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="age">Age (Years)</label>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                max="120"
                required
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 30"
              />
            </div>

            <div className="form-group">
              <label htmlFor="income">Annual Income (₹)</label>
              <input
                type="number"
                id="income"
                name="income"
                min="0"
                step="1000"
                required
                value={formData.income}
                onChange={handleChange}
                placeholder="e.g. 150000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State of Residence</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="occupation">Occupation</label>
              <select
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
              >
                {OCCUPATIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Social Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner-container">
                <span className="spinner"></span> Evaluating Schemes & Generating AI Explanations...
              </span>
            ) : (
              "Evaluate Eligibility ➔"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
