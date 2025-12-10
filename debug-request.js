import axios from 'axios';
import https from 'https';

// Create agent to log SSL/TLS details
const httpsAgent = new https.Agent({
  rejectUnauthorized: true,
});

// Create axios instance matching the MCP server config
const instance = axios.create({
  baseURL: 'https://api.trello.com/1',
  maxRedirects: 5,
  validateStatus: (status) => status < 400,
  httpsAgent,
});

// Comprehensive request logging
instance.interceptors.request.use(config => {
  console.log('=== AXIOS REQUEST DEBUG ===');
  console.log('URL:', `${config.baseURL}${config.url}`);
  console.log('Method:', config.method?.toUpperCase());
  console.log('Headers:', JSON.stringify(config.headers, null, 2));

  // Add auth params
  config.params = {
    ...config.params,
    key: process.env.TRELLO_API_KEY,
    token: process.env.TRELLO_TOKEN,
  };

  const queryString = new URLSearchParams(config.params).toString();
  console.log('Query Params:', queryString);
  console.log('Full URL:', `${config.baseURL}${config.url}?${queryString}`);
  console.log('maxRedirects:', config.maxRedirects);
  console.log('validateStatus:', config.validateStatus?.toString());
  console.log('HTTP Version:', config.httpAgent?.protocol || config.httpsAgent?.protocol || 'default');
  console.log('========================\n');

  return config;
});

// Comprehensive response/error logging
instance.interceptors.response.use(
  response => {
    console.log('=== AXIOS RESPONSE SUCCESS ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Data length:', JSON.stringify(response.data).length);
    console.log('=============================\n');
    return response;
  },
  error => {
    console.log('=== AXIOS ERROR ===');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);

    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      console.log('No response received');
      console.log('Request details:', {
        method: error.request.method,
        path: error.request.path,
        headers: error.request.getHeaders?.(),
      });
    }
    console.log('===================\n');
    throw error;
  }
);

// Test the exact endpoint that's failing
async function testRequest() {
  try {
    console.log('Testing GET /boards/{id}/lists endpoint...\n');
    const response = await instance.get(`/boards/${process.env.TRELLO_BOARD_ID}/lists`);
    console.log('✓ SUCCESS! Got', response.data.length, 'lists');
    return response.data;
  } catch (error) {
    console.error('✗ FAILED:', error.message);
    process.exit(1);
  }
}

testRequest();
