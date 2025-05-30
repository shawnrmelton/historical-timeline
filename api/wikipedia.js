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
    console.log(`Searching Wikipedia for: ${topic}`);
    
    // Search for Wikipedia pages related to the topic
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(topic + ' timeline history events chronology')}&srlimit=3&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    console.log(`Found ${searchData.query?.search?.length || 0} pages`);
    
    if (!searchData.query?.search?.length) {
      return res.status(404).json({ 
        error: 'No Wikipedia pages found for this topic',
        events: []
      });
    }

    // Try multiple pages to get more events
    let allEvents = [];
    const pagesToTry = Math.min(3, searchData.query.search.length);
    
    for (let i = 0; i < pagesToTry; i++) {
      const pageTitle = searchData.query.search[i].title;
      console.log(`Fetching content for: ${pageTitle}`);
      
      try {
        // Fetch page content
        const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro=false&explaintext=true&exsectionformat=plain&origin=*`;
        
        const contentResponse = await fetch(contentUrl);
        
        if (!contentResponse.ok) {
          console.log(`Failed to fetch ${pageTitle}: ${contentResponse.status}`);
          continue;
        }
        
        const contentData = await contentResponse.json();
        const pages = contentData.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId === '-1') {
          console.log(`Page not found: ${pageTitle}`);
          continue;
        }
        
        const pageContent = pages[pageId]?.extract || '';
        console.log(`Got ${pageContent.length} characters from ${pageTitle}`);

        // Extract events from this page
        const events = extractEvents(pageContent, topic, pageTitle);
        allEvents = allEvents.concat(events);
        
      } catch (error) {
        console.log(`Error processing ${pageTitle}: ${error.message}`);
      }
    }

    // Remove duplicates and sort
    const uniqueEvents = removeDuplicateEvents(allEvents);
    const sortedEvents = uniqueEvents
      .sort((a, b) => a.year - b.year)
      .slice(0, 15); // Limit to 15 events

    console.log(`Returning ${sortedEvents.length} events for ${topic}`);

    return res.status(200).json({
      topic,
      source: `Wikipedia search for "${topic}"`,
      events: sortedEvents
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data from Wikipedia',
      details: error.message,
      events: []
    });
  }
}

function extractEvents(content, topic, pageTitle) {
  const events = [];
  
  // Enhanced regex patterns for finding years
  const yearPatterns = [
    /\b(1[0-9]{3}|20[0-2][0-9])\b/g,  // Standard years
    /\b(1[0-9]{3}|20[0-2][0-9])s?\b/g, // Years with optional 's'
    /In\s+(1[0-9]{3}|20[0-2][0-9])/g,  // "In YYYY"
    /During\s+(1[0-9]{3}|20[0-2][0-9])/g // "During YYYY"
  ];
  
  // Split content into sentences and paragraphs
  const sentences = content.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length < 20) return; // Skip very short sentences
    
    // Try each year pattern
    yearPatterns.forEach(pattern => {
      const matches = trimmed.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const year = parseInt(match.replace(/[^\d]/g, ''));
          
          // Skip invalid years
          if (year < 1000 || year > 2024) return;
          
          // Extract meaningful title from sentence
          const title = extractTitle(trimmed, topic);
          if (!title || title.length < 5) return;
          
          // Clean description
          const description = trimmed.length > 200 ? 
            trimmed.substring(0, 180) + '...' : 
            trimmed;
          
          events.push({
            year,
            title,
            description,
            source: pageTitle
          });
        });
      }
    });
  });
  
  return events;
}

function extractTitle(sentence, topic) {
  // Remove common prefixes
  let title = sentence.replace(/^(In|During|The|On|At|By|After|Before|Following|Prior to)\s+/i, '');
  
  // Remove year from beginning
  title = title.replace(/^\d{4}[^\w]*/, '');
  
  // Take first meaningful part (up to comma, semicolon, or after 8 words)
  const parts = title.split(/[,;]/);
  title = parts[0];
  
  const words = title.split(' ').slice(0, 8);
  title = words.join(' ');
  
  // Clean up
  title = title.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  return title;
}

function removeDuplicateEvents(events) {
  const seen = new Set();
  return events.filter(event => {
    const key = `${event.year}-${event.title.substring(0, 30)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
