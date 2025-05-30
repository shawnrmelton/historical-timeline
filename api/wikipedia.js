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
    
    // Try multiple SPARQL queries for better coverage
    let events = [];
    
    // Query 1: Direct topic search
    const directEvents = await queryWikidata(buildDirectQuery(topic));
    events = events.concat(directEvents);
    
    // Query 2: Category-based search
    const categoryEvents = await queryWikidata(buildCategoryQuery(topic));
    events = events.concat(categoryEvents);
    
    // Query 3: Subject area search
    const subjectEvents = await queryWikidata(buildSubjectQuery(topic));
    events = events.concat(subjectEvents);

    // Remove duplicates and sort
    const uniqueEvents = removeDuplicates(events);
    const sortedEvents = uniqueEvents
      .sort((a, b) => a.year - b.year)
      .slice(0, 20);

    console.log(`Found ${sortedEvents.length} events for ${topic}`);

    return res.status(200).json({
      topic,
      source: 'Wikidata',
      events: sortedEvents
    });

  } catch (error) {
    console.error('Wikidata API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data from Wikidata',
      details: error.message,
      events: []
    });
  }
}

function buildDirectQuery(topic) {
  return `
    SELECT DISTINCT ?event ?eventLabel ?date ?description ?typeLabel WHERE {
      ?event rdfs:label ?eventLabel .
      ?event wdt:P31 ?type .
      ?event wdt:P585 ?date .
      
      # Filter for historical events and related items
      FILTER(
        ?type = wd:Q1190554 ||  # historical event
        ?type = wd:Q645883 ||   # military operation  
        ?type = wd:Q178561 ||   # battle
        ?type = wd:Q180684 ||   # conflict
        ?type = wd:Q199655 ||   # revolution
        ?type = wd:Q40165 ||    # discovery
        ?type = wd:Q184937      # invention
      )
      
      # Search in labels and descriptions
      FILTER(
        CONTAINS(LCASE(?eventLabel), "${topic.toLowerCase()}") ||
        CONTAINS(LCASE(STR(?description)), "${topic.toLowerCase()}")
      )
      
      OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
      
      FILTER(LANG(?eventLabel) = "en")
      FILTER(YEAR(?date) >= 1000 && YEAR(?date) <= 2024)
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY ?date
    LIMIT 20
  `;
}

function buildCategoryQuery(topic) {
  // Search for events in specific categories related to the topic
  const categoryMap = {
    'war': 'wd:Q198',          # war
    'space': 'wd:Q7481',       # space exploration
    'science': 'wd:Q336',      # science
    'politics': 'wd:Q7163',    # politics
    'revolution': 'wd:Q10931', # revolution
    'battle': 'wd:Q178561',    # battle
    'discovery': 'wd:Q40165',  # discovery
    'invention': 'wd:Q184937', # invention
    'empire': 'wd:Q28171280',  # ancient civilization
    'rome': 'wd:Q2277',       # Roman Empire
    'egypt': 'wd:Q11768',     # Ancient Egypt
    'greece': 'wd:Q11772'     # Ancient Greece
  };

  // Find relevant category
  const searchTerm = topic.toLowerCase();
  let categoryId = null;
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (searchTerm.includes(key)) {
      categoryId = value;
      break;
    }
  }

  if (!categoryId) {
    return buildGenericQuery(topic);
  }

  return `
    SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {
      ?event wdt:P31/wdt:P279* ${categoryId} .
      ?event wdt:P585 ?date .
      ?event rdfs:label ?eventLabel .
      
      OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
      
      FILTER(LANG(?eventLabel) = "en")
      FILTER(YEAR(?date) >= 1000 && YEAR(?date) <= 2024)
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY ?date
    LIMIT 15
  `;
}

function buildSubjectQuery(topic) {
  return `
    SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {
      ?event wdt:P921 ?subject .
      ?subject rdfs:label ?subjectLabel .
      ?event wdt:P585 ?date .
      ?event rdfs:label ?eventLabel .
      
      FILTER(CONTAINS(LCASE(?subjectLabel), "${topic.toLowerCase()}"))
      
      OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
      
      FILTER(LANG(?eventLabel) = "en")
      FILTER(LANG(?subjectLabel) = "en")
      FILTER(YEAR(?date) >= 1000 && YEAR(?date) <= 2024)
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY ?date
    LIMIT 15
  `;
}

function buildGenericQuery(topic) {
  return `
    SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {
      ?event ?p ?o .
      ?event wdt:P585 ?date .
      ?event rdfs:label ?eventLabel .
      
      # Search broadly in any property that might contain our topic
      FILTER(
        CONTAINS(LCASE(?eventLabel), "${topic.toLowerCase()}") ||
        CONTAINS(LCASE(STR(?o)), "${topic.toLowerCase()}")
      )
      
      # Ensure it's some kind of event or historical item
      ?event wdt:P31 ?type .
      FILTER(?type != wd:Q5)  # Not a person
      
      OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
      
      FILTER(LANG(?eventLabel) = "en")
      FILTER(YEAR(?date) >= 1000 && YEAR(?date) <= 2024)
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY ?date
    LIMIT 10
  `;
}

async function queryWikidata(sparqlQuery) {
  try {
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HistoricalTimeline/1.0 (https://historical-timeline-smoky.vercel.app)'
      }
    });

    if (!response.ok) {
      console.log(`Wikidata query failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (!data.results || !data.results.bindings) {
      return [];
    }

    const events = data.results.bindings.map(binding => {
      const date = new Date(binding.date.value);
      const year = date.getFullYear();
      
      // Handle negative years (BCE)
      const yearValue = binding.date.value.startsWith('-') ? 
        -Math.abs(year) : year;
      
      return {
        year: yearValue,
        title: cleanTitle(binding.eventLabel.value),
        description: binding.description?.value || 
                    binding.typeLabel?.value || 
                    'Historical event',
        source: 'Wikidata'
      };
    });

    return events.filter(event => 
      event.year >= -3000 && 
      event.year <= 2024 && 
      event.title.length > 3
    );

  } catch (error) {
    console.log('Wikidata query error:', error);
    return [];
  }
}

function cleanTitle(title) {
  // Remove common prefixes and clean up titles
  return title
    .replace(/^(The |A |An )/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeDuplicates(events) {
  const seen = new Map();
  return events.filter(event => {
    const key = `${event.year}-${event.title.substring(0, 30).toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.set(key, true);
    return true;
  });
}
