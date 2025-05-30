export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Topic parameter is required' });
  }

  try {
    // For now, let's return some test data to verify the API is working
    const testEvents = [
      {
        year: 2024,
        title: `API Test for ${topic}`,
        description: `This is a test event for ${topic} from the Wikipedia API function.`
      },
      {
        year: 2023,
        title: `Another ${topic} Event`,
        description: `Second test event to verify the API is working properly.`
      }
    ];

    return res.status(200).json({
      topic,
      source: 'Test API',
      events: testEvents
    });

    // TODO: Uncomment below for actual Wikipedia integration once API is working
    /*
    // Search for Wikipedia pages related to the topic
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(topic + ' timeline history events')}&srlimit=3&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.length) {
      return res.status(404).json({ error: 'No Wikipedia pages found for this topic' });
    }

    // Get the most relevant page
    const pageTitle = searchData.query.search[0].title;
    
    // Fetch page content
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro=false&explaintext=true&origin=*`;
    
    const contentResponse = await fetch(contentUrl);
    
    if (!contentResponse.ok) {
      throw new Error(`Wikipedia content fetch failed: ${contentResponse.status}`);
    }
    
    const contentData = await contentResponse.json();
    const pages = contentData.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === '-1') {
      return res.status(404).json({ error: 'Wikipedia page not found' });
    }
    
    const pageContent = pages[pageId]?.extract || '';

    // Extract events from content
    const events = extractEvents(pageContent, topic);

    return res.status(200).json({
      topic,
      source: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
      events
    });
    */

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message 
    });
  }
}

function extractEvents(content, topic) {
  const events = [];
  
  // Simple regex to find years and associated text
  const yearPattern = /\b(1[0-9]{3}|20[0-2][0-9])\b/g;
  const sentences = content.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const yearMatch = sentence.match(yearPattern);
    if (yearMatch) {
      yearMatch.forEach(year => {
        const yearNum = parseInt(year);
        
        // Skip future years or very old years
        if (yearNum < 1000 || yearNum > 2024) return;
        
        // Extract a title from the sentence (first few words)
        const words = sentence.trim().split(' ').slice(0, 8);
        const title = words.join(' ').replace(/^(In |The |On |During )/i, '');
        
        // Clean up the description
        const description = sentence.trim().substring(0, 150) + (sentence.length > 150 ? '...' : '');
        
        // Avoid duplicates
        if (!events.some(e => e.year === yearNum && e.title.includes(title.substring(0, 20)))) {
          events.push({
            year: yearNum,
            title: title || `${topic} event`,
            description: description || `Event related to ${topic} in ${year}`
          });
        }
      });
    }
  });
  
  // Sort by year and limit results
  return events
    .sort((a, b) => a.year - b.year)
    .slice(0, 10);
}
