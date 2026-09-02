const express = require('express');
const cors = require('cors');
const GoogleAdsService = require('./google-ads');
const config = require('./config');

const app = express();
const googleAds = new GoogleAdsService();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Google Ads API server is running' });
});

app.get('/api/campaigns', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const { startDate, endDate } = googleAds.getDateRange(parseInt(days));

    const campaigns = await googleAds.getCampaignMetrics(startDate, endDate);
    res.json({
      success: true,
      data: campaigns,
      period: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/metrics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const { startDate, endDate } = googleAds.getDateRange(parseInt(days));

    const metrics = await googleAds.getAccountMetrics(startDate, endDate);
    res.json({
      success: true,
      data: metrics,
      period: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const { startDate, endDate } = googleAds.getDateRange(parseInt(days));

    const metrics = await googleAds.getAccountMetrics(startDate, endDate);
    const campaigns = await googleAds.getCampaignMetrics(startDate, endDate);

    const summary = {
      period: { startDate, endDate },
      totalImpressions: metrics.metrics?.impressions || 0,
      totalClicks: metrics.metrics?.clicks || 0,
      totalCost: (metrics.metrics?.cost_micros || 0) / 1000000,
      totalConversions: metrics.metrics?.conversions || 0,
      averageCTR: (metrics.metrics?.ctr || 0) * 100,
      averageCPC: (metrics.metrics?.average_cpc || 0) / 1000000,
      totalCampaigns: campaigns.length,
      campaigns,
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Google Ads API server running on port ${PORT}`);
});
