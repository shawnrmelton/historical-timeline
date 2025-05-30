// Vercel serverless function for Wikipedia API integration
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
    // Search for Wikipedia pages related to the topic
    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(topic + ' timeline history events')}&srlimit=5&origin=*`
    );
    
    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.length) {
      return res.status(404).json({ error: 'No Wikipedia pages found for this topic' });
    }

    // Get the most relevant page
    const pageTitle = searchData.query.search[0].title;
    
    // Fetch page content
    const contentResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro=false&explaintext=true&origin=*`
    );
    
    const contentData = await contentResponse.json();
    const pages = contentData.query.pages;
    const pageId = Object.keys(pages)[0];
    const pageContent = pages[pageId]?.extract || '';

    // Simple event extraction (this is basic - you'd want more sophisticated parsing)
    const events = extractEvents(pageContent, topic);

    return res.status(200).json({
      topic,
      source: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
      events
    });

  } catch (error) {
    console.error('Wikipedia API error:', error);
    return res.status(500).json({ error: 'Failed to fetch data from Wikipedia' });
  }
}

function extractEvents(content, topic) {
  const events = [];
  
  // Simple regex to find years and associated text
  // This is a basic implementation - you'd want more sophisticated parsing
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
    .slice(0, 10); // Limit to 10 events per topic
}