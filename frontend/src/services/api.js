/**
 * API Service - Handles all calls to FastAPI backend
 */

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// ==================== DEAL ANALYSIS ====================

export async function analyzeBrandDeal(dealData) {
  /**
   * Analyze a brand deal against market rates
   *
   * dealData: {
   *   creator_name: "Sarah",
   *   niche: "fitness",
   *   platform: "instagram",
   *   followers: 50000,
   *   offered_rate_usd: 3000,
   *   format: "post"
   * }
   */
  const params = new URLSearchParams(dealData).toString();
  return apiCall(`/deals/analyze?${params}`, 'POST');
}

export async function getDealsHistory(creatorName = null) {
  let url = '/deals/history';
  if (creatorName) {
    url += `?creator_name=${encodeURIComponent(creatorName)}`;
  }
  return apiCall(url);
}

// ==================== CONTRACT ANALYSIS ====================

export async function analyzeContract(contractData) {
  /**
   * Analyze a contract for red flags
   *
   * contractData: {
   *   creator_name: "Sarah",
   *   brand_name: "FitnessCo",
   *   contract_text: "...",
   *   creator_niche: "fitness",
   *   deal_value: 5000
   * }
   */
  return apiCall('/contracts/analyze', 'POST', contractData);
}

export async function getContractsHistory(creatorName = null) {
  let url = '/contracts/history';
  if (creatorName) {
    url += `?creator_name=${encodeURIComponent(creatorName)}`;
  }
  return apiCall(url);
}

// ==================== CAMPAIGN GENERATION ====================

export async function generateCampaign(campaignData) {
  /**
   * Generate a 5-email product launch campaign
   *
   * campaignData: {
   *   creator_name: "Sarah",
   *   product_name: "Fitness Masterclass",
   *   product_price: 97,
   *   product_type: "course",
   *   subscriber_count: 10000
   * }
   */
  return apiCall('/campaigns/generate', 'POST', campaignData);
}

export async function getCampaignsHistory(creatorName = null) {
  let url = '/campaigns/history';
  if (creatorName) {
    url += `?creator_name=${encodeURIComponent(creatorName)}`;
  }
  return apiCall(url);
}

// ==================== HISTORY ====================

export async function getAllHistory(creatorName = null) {
  let url = '/history';
  if (creatorName) {
    url += `?creator_name=${encodeURIComponent(creatorName)}`;
  }
  return apiCall(url);
}

// ==================== CONTENT-TO-COMMERCE ====================

export async function getContentPerformance(creatorName = null) {
  /**
   * Get all content with performance metrics
   */
  let url = '/content/performance';
  if (creatorName) {
    url += `?creator_name=${encodeURIComponent(creatorName)}`;
  }
  return apiCall(url);
}

export async function getContentByType() {
  /**
   * Get content grouped by type with analytics
   */
  return apiCall('/content/by-type');
}

export async function getContentByTopic() {
  /**
   * Get content grouped by topic with analytics
   */
  return apiCall('/content/by-topic');
}

export async function getContentSuggestions(contentId) {
  /**
   * Get commerce suggestions for specific content
   */
  return apiCall(`/content/suggestions/${contentId}`);
}

export async function updateContentSales(contentId, salesData) {
  /**
   * Update manual sales data for content
   *
   * salesData: {
   *   manual_sales: 50,
   *   manual_revenue: 2500
   * }
   */
  return apiCall(`/content/update-sales/${contentId}`, 'POST', salesData);
}

export async function getContentCalendar() {
  /**
   * Get weekly calendar with commerce recommendations
   */
  return apiCall('/content/calendar');
}

export async function getContentInsights() {
  /**
   * Get strategic insights and recommendations
   */
  return apiCall('/content/insights');
}

// ==================== HEALTH CHECK ====================

export async function healthCheck() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'offline' };
  }
}
