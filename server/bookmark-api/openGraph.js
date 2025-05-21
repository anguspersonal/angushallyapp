const ogs = require('open-graph-scraper');

/**
 * Configuration options for the OpenGraph scraper
 */
const OG_OPTIONS = {
  timeout: 10000, // 10 second timeout
  headers: {
    'user-agent': 'Mozilla/5.0 (compatible; BookmarkService/1.0; +http://localhost)',
  },
  onlyGetOpenGraphInfo: false, // Get both OpenGraph and regular metadata
  fetchFromFallback: true, // Try to fetch metadata from regular HTML if OG tags aren't present
};

/**
 * Fetches metadata for a given URL using OpenGraph and fallback methods
 * @param {string} url - The URL to fetch metadata from
 * @returns {Promise<Object>} - Resolved metadata object or null if failed
 */
async function fetchMetadata(url) {
  try {
    const { result } = await ogs({ ...OG_OPTIONS, url });

    // Extract the most relevant metadata
    return {
      title: result.ogTitle || result.twitterTitle || result.title || null,
      description: result.ogDescription || result.twitterDescription || result.description || null,
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || null,
      site_name: result.ogSiteName || null,
      resolved_url: result.requestUrl || url, // In case of redirects
      error: null
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error.message);
    
    // Return a structured error response
    return {
      title: null,
      description: null,
      image: null,
      site_name: null,
      resolved_url: url,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      }
    };
  }
}

/**
 * Validates if a URL is in a format we can process
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

module.exports = {
  fetchMetadata,
  isValidUrl
}; 