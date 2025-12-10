import axios from 'axios';

async function testWithUserAgent(userAgent) {
  const instance = axios.create({
    baseURL: 'https://api.trello.com/1',
    maxRedirects: 0,
    headers: {
      'User-Agent': userAgent
    }
  });

  try {
    const response = await instance.get(`/boards/${process.env.TRELLO_BOARD_ID}/lists`, {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN,
      }
    });
    console.log(`✓ SUCCESS with User-Agent: "${userAgent}"`);
    console.log(`  Status: ${response.status}`);
    return true;
  } catch (err) {
    if (err.response?.status === 301) {
      console.log(`✗ REDIRECT with User-Agent: "${userAgent}"`);
      console.log(`  Status: 301`);
      console.log(`  Location: ${err.response.headers.location}`);
    } else {
      console.log(`✗ ERROR with User-Agent: "${userAgent}"`);
      console.log(`  ${err.message}`);
    }
    return false;
  }
}

(async () => {
  console.log('Testing different User-Agent headers...\n');

  await testWithUserAgent('curl/8.16.0');
  await testWithUserAgent('axios/1.12.2');
  await testWithUserAgent('Mozilla/5.0 (compatible)');
  await testWithUserAgent('');

  console.log('\nNow testing with NO User-Agent header...');
  const instance = axios.create({
    baseURL: 'https://api.trello.com/1',
    maxRedirects: 0,
  });

  // Remove User-Agent header
  delete instance.defaults.headers.common['User-Agent'];

  try {
    await instance.get(`/boards/${process.env.TRELLO_BOARD_ID}/lists`, {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN,
      },
      headers: {
        'User-Agent': undefined
      }
    });
    console.log('✓ SUCCESS without User-Agent');
  } catch (err) {
    console.log(`✗ ${err.response?.status === 301 ? 'REDIRECT' : 'ERROR'} without User-Agent`);
  }
})();
