import axios from 'axios';

// Test with minimal axios config to see default headers
const instance = axios.create({
  baseURL: 'https://api.trello.com/1',
  maxRedirects: 0, // Disable redirects to see first response
});

instance.interceptors.request.use(config => {
  config.params = {
    key: process.env.TRELLO_API_KEY,
    token: process.env.TRELLO_TOKEN,
  };

  console.log('AXIOS Headers being sent:');
  Object.entries(config.headers).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  return config;
});

instance.get(`/boards/${process.env.TRELLO_BOARD_ID}/lists`)
  .then(res => console.log('Status:', res.status))
  .catch(err => {
    if (err.response) {
      console.log('\nFirst response status:', err.response.status);
      console.log('First response headers:');
      Object.entries(err.response.headers).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log('Error:', err.message);
    }
  });
