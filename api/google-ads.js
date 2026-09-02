const { GoogleAdsApi } = require('google-ads-api');
const config = require('./config');

class GoogleAdsService {
  constructor() {
    this.client = new GoogleAdsApi({
      client_id: config.googleAds.clientId,
      client_secret: config.googleAds.clientSecret,
      developer_token: config.googleAds.developerToken,
      refresh_token: config.googleAds.refreshToken,
    });
  }

  async getCampaignMetrics(startDate, endDate) {
    try {
      const customer = this.client.Customer({
        customer_id: config.googleAds.customerId,
      });

      const query = `
        SELECT
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        ORDER BY metrics.impressions DESC
      `;

      const response = await customer.query(query);
      return this.formatMetrics(response);
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      throw error;
    }
  }

  async getAccountMetrics(startDate, endDate) {
    try {
      const customer = this.client.Customer({
        customer_id: config.googleAds.customerId,
      });

      const query = `
        SELECT
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversion_rate
        FROM customer
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;

      const response = await customer.query(query);
      return response[0] || {};
    } catch (error) {
      console.error('Error fetching account metrics:', error);
      throw error;
    }
  }

  formatMetrics(campaigns) {
    return campaigns.map(campaign => ({
      id: campaign.campaign.id,
      name: campaign.campaign.name,
      impressions: campaign.metrics.impressions,
      clicks: campaign.metrics.clicks,
      cost: campaign.metrics.cost_micros / 1000000,
      conversions: campaign.metrics.conversions,
      ctr: (campaign.metrics.ctr * 100).toFixed(2) + '%',
      cpc: (campaign.metrics.average_cpc / 1000000).toFixed(2),
    }));
  }

  getDateRange(days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    };
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
}

module.exports = GoogleAdsService;
