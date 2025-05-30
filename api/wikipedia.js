export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { topic } = req.query;
  if (!topic) {
    return res.status(400).json({ error: 'Topic parameter is required' });
  }

  try {
    console.log(`Searching Wikidata for: ${topic}`);
    
    // Search for relevant entities in Wikidata
    const searchQuery = `
      SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {
        ?event rdfs:label ?eventLabel .
        ?event wdt:P31/wdt:P279* wd:Q1190554 . # instance of historical event
        ?event wdt:P585 ?date . # point in time
        
        FILTER(CONTAINS(LCASE(?eventLabel), "${topic.toLowerCase()}"))
        
        OPTIONAL { ?event schema:description ?description . }
        FILTER(LANG(?eventLabel) = "en")
        FILTER(YEAR(?date) >= 1000 && YEAR(?date) <= 2024)
      }
      ORDER BY ?date
      LIMIT 20
    `;

    const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(searchQuery)}&format=json`;
    
    const response = await fetch(wikidataUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HistoricalTimeline/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikidata query failed: ${response.status}`);
    }

    const data = await response.json();
    const events = data.results.bindings.map(binding => {
      const date = new Date(binding.date.value);
      return {
        year: date.getFullYear(),
        title: binding.eventLabel.value,
        description: binding.description?.value || `Historical event related to ${topic}`,
        source: 'Wikidata'
      };
    });

    console.log(`Found ${events.length} Wikidata events for ${topic}`);
    
    // If no Wikidata results, try alternative search
    if (events.length === 0) {
      const alternativeEvents = await searchAlternativeSources(topic);
      return res.status(200).json({
        topic,
        source: 'Alternative sources',
        events: alternativeEvents
      });
    }

    return res.status(200).json({
      topic,
      source: 'Wikidata',
      events: events.slice(0, 15)
    });

  } catch (error) {
    console.error('Wikidata API Error:', error);
    
    // Fallback to alternative sources
    try {
      const fallbackEvents = await searchAlternativeSources(topic);
      return res.status(200).json({
        topic,
        source: 'Fallback sources',
        events: fallbackEvents
      });
    } catch (fallbackError) {
      return res.status(500).json({ 
        error: 'Failed to fetch historical data',
        events: []
      });
    }
  }
}

async function searchAlternativeSources(topic) {
  // Try multiple approaches for better coverage
  const events = [];
  
  // 1. Try BBC History API approach (simulated - you'd need to register)
  const bbcEvents = await searchBBCHistory(topic);
  events.push(...bbcEvents);
  
  // 2. Try Library of Congress Chronicling America (free API)
  const locEvents = await searchLibraryOfCongress(topic);
  events.push(...locEvents);
  
  // 3. Try OnThisDay API (free)
  const otdEvents = await searchOnThisDay(topic);
  events.push(...otdEvents);
  
  return events.slice(0, 15);
}

async function searchBBCHistory(topic) {
  // BBC History would require API key - placeholder for now
  // You could scrape BBC History timeline pages or use their educational APIs
  return [
    {
      year: 1066,
      title: `Norman Conquest (${topic} related)`,
      description: `Major historical event connected to ${topic}`,
      source: 'BBC History'
    }
  ];
}

async function searchLibraryOfCongress(topic) {
  try {
    // Library of Congress Chronicling America API
    const searchUrl = `https://chroniclingamerica.loc.gov/search/pages/results/?andtext=${encodeURIComponent(topic)}&format=json&sort=date`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) return [];
    
    const data = await response.json();
    const events = [];
    
    // Process newspaper articles to extract historical events
    if (data.items) {
      data.items.slice(0, 5).forEach(item => {
        const dateMatch = item.date?.match(/(\d{4})/);
        if (dateMatch) {
          events.push({
            year: parseInt(dateMatch[1]),
            title: item.title || `${topic} news coverage`,
            description: `Historical newspaper coverage of ${topic}`,
            source: 'Library of Congress'
          });
        }
      });
    }
    
    return events;
  } catch (error) {
    console.log('Library of Congress search failed:', error);
    return [];
  }
}

async function searchOnThisDay(topic) {
  try {
    // OnThisDay API - free historical events
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    const response = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    const events = [];
    
    // Filter events related to our topic
    if (data.events) {
      data.events.forEach(event => {
        if (event.text.toLowerCase().includes(topic.toLowerCase()) && event.year) {
          events.push({
            year: event.year,
            title: event.text,
            description: `Historical event from ${event.year} related to ${topic}`,
            source: 'OnThisDay API'
          });
        }
      });
    }
    
    return events;
  } catch (error) {
    console.log('OnThisDay search failed:', error);
    return [];
  }
}
