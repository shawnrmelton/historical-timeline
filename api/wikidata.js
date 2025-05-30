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
    console.log(`Searching for: ${topic}`);
    
    // Simple, reliable Wikidata query
    const sparqlQuery = `
      SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {
        ?event rdfs:label ?eventLabel .
        ?event wdt:P31 wd:Q1190554 .
        ?event wdt:P585 ?date .
        
        FILTER(CONTAINS(LCASE(?eventLabel), "${topic.toLowerCase()}"))
        FILTER(LANG(?eventLabel) = "en")
        FILTER(YEAR(?date) >= 1000 && YEAR(?date) <= 2024)
        
        OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
      }
      ORDER BY ?date
      LIMIT 10
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    console.log('Querying Wikidata...');
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HistoricalTimeline/1.0'
      },
      timeout: 8000 // 8 second timeout
    });

    if (!response.ok) {
      console.log(`Wikidata failed: ${response.status}`);
      // Return test data instead of failing
      return res.status(200).json({
        topic,
        source: 'Test data (Wikidata failed)',
        events: [
          {
            year: 2024,
            title: `${topic} - Test Event 1`,
            description: `This is a test event for ${topic} (Wikidata query failed)`,
            source: 'Test'
          },
          {
            year: 2023,
            title: `${topic} - Test Event 2`, 
            description: `Another test event for ${topic}`,
            source: 'Test'
          }
        ]
      });
    }

    const data = await response.json();
    console.log(`Raw Wikidata response:`, data);

    if (!data.results || !data.results.bindings || data.results.bindings.length === 0) {
      console.log('No Wikidata results found');
      // Return test data if no results
      return res.status(200).json({
        topic,
        source: 'Test data (no Wikidata results)',
        events: [
          {
            year: 2024,
            title: `${topic} - No Wikidata Results`,
            description: `Wikidata search for ${topic} returned no results`,
            source: 'Test'
          }
        ]
      });
    }

    const events = data.results.bindings.map(binding => {
      const date = new Date(binding.date.value);
      return {
        year: date.getFullYear(),
        title: binding.eventLabel.value,
        description: binding.description?.value || `Historical event related to ${topic}`,
        source: 'Wikidata'
      };
    });

    console.log(`Returning ${events.length} events`);

    return res.status(200).json({
      topic,
      source: 'Wikidata',
      events: events.slice(0, 10)
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Always return something, never fail completely
    return res.status(200).json({
      topic,
      source: 'Error fallback',
      events: [
        {
          year: 2024,
          title: `${topic} - API Error`,
          description: `Error occurred: ${error.message}`,
          source: 'Error'
        }
      ]
    });
  }
}
