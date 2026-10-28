
const backendUrl = process.env['BACKEND_URL'] || 'http://localhost:5144';

module.exports = {
  "/api": {
    "target": backendUrl,
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
};

