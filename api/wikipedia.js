export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { topic } = req.query;
  
  console.log(`=== API CALLED ===`);
  console.log(`Topic: ${topic}`);
  console.log(`Method: ${req.method}`);

  if (!topic) {
    console.log('No topic provided');
    return res.status(400).json({ error: 'Topic parameter is required' });
  }

  try {
    console.log(`Processing topic: ${topic}`);
    
    // For now, just return test data to verify the API is working
    const testEvents = [
      {
        year: 1789,
        title: `${topic} - API Test Event`,
        description: `This proves the API is working for ${topic}`,
        source: 'API Test'
      },
      {
        year: 1795,
        title: `${topic} - Second Test`,
        description: `Another test event for ${topic}`,
        source: 'API Test'
      }
    ];

    console.log(`Returning ${testEvents.length} test events`);

    return res.status(200).json({
      topic,
      source: 'API Test',
      events: testEvents
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'API Error',
      details: error.message,
      events: []
    });
  }
}
