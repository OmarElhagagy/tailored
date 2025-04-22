import api from './index';

/**
 * Update seller profile information
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} - Promise with response data
 */
export const updateSellerProfile = async (profileData) => {
  return api.put('/users/seller-profile', profileData);
};

/**
 * Get seller profile information
 * @returns {Promise} - Promise with response data
 */
export const getSellerProfile = async () => {
  return api.get('/users/seller-profile');
};

/**
 * Update seller contact information
 * @param {Object} contactData - Contact data to update
 * @returns {Promise} - Promise with response data
 */
export const updateSellerContact = async (contactData) => {
  return api.put('/users/seller-profile/contact', contactData);
};

/**
 * Get public seller profile information
 * @param {string} sellerId - Seller ID to retrieve
 * @returns {Promise} - Promise with response data
 */
export const getPublicSellerProfile = async (sellerId) => {
  return api.get(`/users/seller/${sellerId}/public-profile`);
};

/**
 * Add a portfolio project
 * @param {Object} projectData - Portfolio project data
 * @returns {Promise} - Promise with response data
 */
export const addPortfolioProject = async (projectData) => {
  return api.post('/users/seller-profile/portfolio', projectData);
};

/**
 * Update a portfolio project
 * @param {string} projectId - Project ID to update
 * @param {Object} projectData - Updated project data
 * @returns {Promise} - Promise with response data
 */
export const updatePortfolioProject = async (projectId, projectData) => {
  return api.put(`/users/seller-profile/portfolio/${projectId}`, projectData);
};

/**
 * Delete a portfolio project
 * @param {string} projectId - Project ID to delete
 * @returns {Promise} - Promise with response data
 */
export const deletePortfolioProject = async (projectId) => {
  return api.delete(`/users/seller-profile/portfolio/${projectId}`);
}; 