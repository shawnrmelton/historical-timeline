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
    
    // First try a simple, reliable Wikidata query
    const events = await queryWikidata(topic);
    
    if (events.length > 0) {
      console.log(`Found ${events.length} Wikidata events for ${topic}`);
      return res.status(200).json({
        topic,
        source: 'Wikidata',
        events: events.slice(0, 15)
      });
    }
    
    // If no Wikidata results, return helpful test data
    console.log(`No Wikidata results for ${topic}, returning test data`);
    return res.status(200).json({
      topic,
      source: 'No Wikidata results - test data',
      events: [
        {
          year: 2024,
          title: `${topic} - No Results Found`,
          description: `Try more specific terms like "French Revolution", "World War II", "Roman Empire", or "Space Race"`,
          source: 'Suggestion'
        }
      ]
    });

  } catch (error) {
    console.error('Wikidata Error:', error);
    return res.status(200).json({
      topic,
      source: 'Error - test data',
      events: [
        {
          year: 2024,
          title: `${topic} - API Error`,
          description: `Error: ${error.message}. Try sample topics like "world wars" or "space exploration"`,
          source: 'Error'
        }
      ]
    });
  }
}

async function queryWikidata(topic) {
  try {
    // Simple, reliable SPARQL query for historical events
    const sparqlQuery = `
SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {
  ?event wdt:P31/wdt:P279* wd:Q1190554 .
  ?event wdt:P585 ?date .
  ?event rdfs:label ?eventLabel .
  
  FILTER(CONTAINS(LCASE(?eventLabel), "${topic.toLowerCase()}"))
  FILTER(LANG(?eventLabel) = "en")
  FILTER(YEAR(?date) >= 1000 && YEAR(?date) <= 2024)
  
  OPTIONAL { 
    ?event schema:description ?description . 
    FILTER(LANG(?description) = "en") 
  }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY ?date
LIMIT 15
    `.trim();

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    console.log('Querying Wikidata...');
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HistoricalTimeline/1.0 (educational-project)'
      }
    });

    if (!response.ok) {
      console.log(`Wikidata query failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (!data.results || !data.results.bindings) {
      console.log('No results in Wikidata response');
      return [];
    }

    console.log(`Raw Wikidata returned ${data.results.bindings.length} results`);

    const events = data.results.bindings
      .map(binding => {
        try {
          const date = new Date(binding.date.value);
          const year = date.getFullYear();
          
          // Skip invalid years
          if (year < 1000 || year > 2024) return null;
          
          return {
            year: year,
            title: cleanTitle(binding.eventLabel.value),
            description: binding.description?.value || `Historical event related to ${topic}`,
            source: 'Wikidata'
          };
        } catch (e) {
          console.log('Error processing event:', e);
          return null;
        }
      })
      .filter(event => event !== null)
      .filter(event => event.title.length > 3);

    console.log(`Processed to ${events.length} valid events`);
    return events;

  } catch (error) {
    console.error('Wikidata query error:', error);
    return [];
  }
}

function cleanTitle(title) {
  if (!title) return 'Historical Event';
  
  return title
    .replace(/^(The |A |An )/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}
