// Services for fetching Vietnam administrative divisions (provinces, districts, wards)
// Using the free API from https://provinces.open-api.vn/

// Base URL for the API
const API_URL = 'https://provinces.open-api.vn/api';

// Cache the data to avoid multiple API calls
let provincesCache = null;
let districtsCache = {};
let wardsCache = {};

const AddressDataService = {
  /**
   * Get all provinces/cities
   * @returns {Promise<Array>} Array of provinces
   */
  async getProvinces() {
    try {
      // Return cached data if available
      if (provincesCache) {
        return provincesCache;
      }

      const response = await fetch(`${API_URL}/p/`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }

      const data = await response.json();
      // Sort provinces alphabetically
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      
      // Cache the result
      provincesCache = sortedData;
      return sortedData;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  /**
   * Get all districts for a province
   * @param {number} provinceCode The province code
   * @returns {Promise<Array>} Array of districts
   */
  async getDistricts(provinceCode) {
    try {
      // Return cached data if available
      if (districtsCache[provinceCode]) {
        return districtsCache[provinceCode];
      }

      const response = await fetch(`${API_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error(`Failed to fetch districts for province ${provinceCode}`);
      }

      const data = await response.json();
      const districts = data.districts || [];
      
      // Sort districts alphabetically
      const sortedDistricts = districts.sort((a, b) => a.name.localeCompare(b.name));
      
      // Cache the result
      districtsCache[provinceCode] = sortedDistricts;
      return sortedDistricts;
    } catch (error) {
      console.error(`Error fetching districts for province ${provinceCode}:`, error);
      return [];
    }
  },

  /**
   * Get all wards for a district
   * @param {number} districtCode The district code
   * @returns {Promise<Array>} Array of wards
   */
  async getWards(districtCode) {
    try {
      // Return cached data if available
      if (wardsCache[districtCode]) {
        return wardsCache[districtCode];
      }

      const response = await fetch(`${API_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error(`Failed to fetch wards for district ${districtCode}`);
      }

      const data = await response.json();
      const wards = data.wards || [];
      
      // Sort wards alphabetically
      const sortedWards = wards.sort((a, b) => a.name.localeCompare(b.name));
      
      // Cache the result
      wardsCache[districtCode] = sortedWards;
      return sortedWards;
    } catch (error) {
      console.error(`Error fetching wards for district ${districtCode}:`, error);
      return [];
    }
  },

  /**
   * Clear all cached data
   */
  clearCache() {
    provincesCache = null;
    districtsCache = {};
    wardsCache = {};
  }
};

export default AddressDataService;
