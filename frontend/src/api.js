/**
 * API client module for Scheme Assistance Agent.
 * Uses relative URL paths so it works seamlessly on same-origin deployment (Render)
 * and via Vite dev proxy in local development.
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "";

/**
 * Checks scheme eligibility for a given user profile with AI explanations.
 * @param {Object} userProfile 
 * @returns {Promise<Object>} API response with total_schemes_checked, eligible_count, and results
 */
export async function checkEligibilityWithExplanation(userProfile) {
  const endpoint = `${BASE_URL}/check-eligibility-with-explanation`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userProfile)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Server returned status ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
}

/**
 * Checks scheme eligibility without AI explanations (pure rule engine).
 * @param {Object} userProfile 
 * @returns {Promise<Object>} API response
 */
export async function checkEligibilityRaw(userProfile) {
  const endpoint = `${BASE_URL}/check-eligibility`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userProfile)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Server returned status ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
}

/**
 * Fetches all schemes from backend database.
 * @returns {Promise<Array>} List of scheme definitions
 */
export async function fetchSchemes() {
  const endpoint = `${BASE_URL}/schemes`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to fetch schemes: status ${response.status}`);
  }

  return await response.json();
}
