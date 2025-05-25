const axios = require('axios');

/**
 * Fetch all collections from Raindrop.io
 * @param {string} accessToken - The access token for Raindrop.io API
 * @returns {Promise<Array>} Array of collections
 */
const getCollections = async (accessToken) => {
  // console.log('getCollections called with accessToken:', {
  //   hasToken: !!accessToken,
  //   tokenLength: accessToken ? accessToken.length : 0,
  //   tokenPreview: accessToken ? accessToken.substring(0, 10) + '...' : 'undefined'
  // });
  
  try {
    const response = await axios.get('https://api.raindrop.io/rest/v1/collections', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.items) {
      throw new Error('Invalid response format from Raindrop.io');
    }

    return response.data.items;
  } catch (error) {
    console.error('Error fetching collections:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch bookmarks from a specific collection
 * @param {string} accessToken - The access token for Raindrop.io API
 * @param {string} collectionId - The ID of the collection to fetch bookmarks from
 * @returns {Promise<Array>} Array of bookmarks
 */
const getBookmarksFromCollection = async (accessToken, collectionId) => {
  // console.log('getBookmarksFromCollection called with:', {
  //   accessToken: accessToken ? 'present' : 'missing',
  //   collectionId
  // });
  
  try {
    const response = await axios.get(`https://api.raindrop.io/rest/v1/raindrops/${collectionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        perpage: 50,  // Maximum allowed by API
        page: 0
      }
    });

    // console.log('Raindrop API response:', {
    //   status: response.status,
    //   hasData: !!response.data,
    //   hasItems: !!response.data?.items,
    //   itemCount: response.data?.items?.length || 0
    // });

    if (!response.data || !response.data.items) {
      throw new Error('Invalid response format from Raindrop.io');
    }

    return response.data.items;
  } catch (error) {
    console.error('Error fetching bookmarks:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Fetch all bookmarks from all collections
 * @param {string} accessToken - The access token for Raindrop.io API
 * @returns {Promise<Array>} Array of all bookmarks
 */
const getAllBookmarks = async (accessToken) => {
  try {
    // First get all collections
    const collections = await getCollections(accessToken);
    
    // Then fetch bookmarks from each collection
    const allBookmarks = [];
    for (const collection of collections) {
      const bookmarks = await getBookmarksFromCollection(accessToken, collection._id);
      allBookmarks.push(...bookmarks);
    }
    
    return allBookmarks;
  } catch (error) {
    console.error('Error fetching all bookmarks:', error.message);
    throw error;
  }
};

module.exports = {
  getCollections,
  getBookmarksFromCollection,
  getAllBookmarks
}; 