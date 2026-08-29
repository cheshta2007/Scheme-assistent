import React from "react";

export default function SchemeCard({ schemeResult }) {
  const {
    scheme,
    eligible,
    failed_on = [],
    required_documents = [],
    official_source,
    application_link,
    explanation
  } = schemeResult;

  const applyUrl = application_link || official_source || "#";

  return (
    <div className={`scheme-card ${eligible ? "eligible" : "ineligible"}`}>
      <div className="card-header">
        <h3 className="scheme-title">{scheme}</h3>
        <span className={`status-badge ${eligible ? "badge-success" : "badge-error"}`}>
          {eligible ? "✓ Eligible" : "✗ Not Eligible"}
        </span>
      </div>

      {explanation && (
        <div className="explanation-box">
          <span className="sparkle-icon">✨</span>
          <p className="explanation-text">{explanation}</p>
        </div>
      )}

      {!eligible && failed_on.length > 0 && (
        <div className="failed-criteria">
          <strong>Criteria Not Met:</strong>{" "}
          <span className="failed-tags">
            {failed_on.map((field) => (
              <span key={field} className="tag tag-failed">
                {field}
              </span>
            ))}
          </span>
        </div>
      )}

      {required_documents && required_documents.length > 0 && (
        <div className="documents-section">
          <strong>Required Documents:</strong>
          <ul className="documents-list">
            {required_documents.map((doc, idx) => (
              <li key={idx}>📄 {doc}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-footer">
        {applyUrl !== "#" ? (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-apply"
          >
            Apply on Official Portal ↗
          </a>
        ) : (
          <span className="no-link-text">No direct application link provided</span>
        )}
      </div>
    </div>
  );
}
