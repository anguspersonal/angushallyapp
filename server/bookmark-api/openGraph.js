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
  // Validate URL before attempting fetch
  if (!isValidUrl(url)) {
    return {
      title: null,
      description: null,
      image: null,
      site_name: null,
      resolved_url: null,
      error: { message: 'Invalid URL format', code: 'INVALID_URL' }
    };
  }

  try {
    const { result } = await ogs({ ...OG_OPTIONS, url });

    const getImage = (img) => {
      if (!img) return null;
      if (Array.isArray(img)) {
        return img[0]?.url || null;
      }
      if (typeof img === 'object') {
        return img.url || null;
      }
      return null;
    };

    // Extract the most relevant metadata
    return {
      title: result.ogTitle || result.twitterTitle || result.title || null,
      description: result.ogDescription || result.twitterDescription || result.description || null,
      image: getImage(result.ogImage) || getImage(result.twitterImage),
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