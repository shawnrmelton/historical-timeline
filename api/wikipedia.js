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
    console.log(`Generating AI timeline for: ${topic}`);
    
    // Try AI generation first
    const aiEvents = await generateTimelineWithAI(topic);
    
    if (aiEvents && aiEvents.length > 0) {
      console.log(`AI generated ${aiEvents.length} events for ${topic}`);
      return res.status(200).json({
        topic,
        source: 'AI Generated',
        events: aiEvents
      });
    }
    
    // Fallback to structured prompt if API fails
    const fallbackEvents = generateFallbackTimeline(topic);
    
    return res.status(200).json({
      topic,
      source: 'Structured Fallback',
      events: fallbackEvents
    });

  } catch (error) {
    console.error('AI Timeline Error:', error);
    
    // Always return something useful
    const emergencyEvents = generateFallbackTimeline(topic);
    
    return res.status(200).json({
      topic,
      source: 'Emergency Fallback',
      events: emergencyEvents
    });
  }
}

async function generateTimelineWithAI(topic) {
  // You'll need to add your OpenAI API key as an environment variable in Vercel
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key found, using fallback');
    return null;
  }

  try {
    const prompt = `Create a historical timeline for "${topic}". Return exactly 10-15 of the most important events in JSON format. Each event should have:
- year: (number, use negative numbers for BCE)
- title: (concise event name, 2-8 words)
- description: (brief description, 10-25 words)

Focus on the most historically significant events. Ensure chronological accuracy. Return only valid JSON array format.

Example format:
[
  {"year": 1776, "title": "Declaration of Independence", "description": "American colonies declare independence from British rule"},
  {"year": 1783, "title": "Treaty of Paris", "description": "Formal end to the American Revolutionary War"}
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a historical expert. Generate accurate, concise timelines in JSON format only. No additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.log(`OpenAI API failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.log('No content from OpenAI');
      return null;
    }

    // Parse the JSON response
    const events = JSON.parse(content);
    
    // Validate and clean the events
    return events
      .filter(event => event.year && event.title && event.description)
      .filter(event => event.year >= -3000 && event.year <= 2024)
      .map(event => ({
        year: parseInt(event.year),
        title: event.title.trim(),
        description: event.description.trim(),
        source: 'AI Generated'
      }))
      .sort((a, b) => a.year - b.year)
      .slice(0, 15);

  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

function generateFallbackTimeline(topic) {
  // Intelligent fallback based on topic analysis
  const topicLower = topic.toLowerCase();
  const currentYear = new Date().getFullYear();
  
  // Topic-specific event templates
  const templates = {
    war: [
      { yearOffset: -10, title: 'Conflict Begins', description: `Beginning of the ${topic}` },
      { yearOffset: -5, title: 'Major Battle', description: `Significant military engagement during ${topic}` },
      { yearOffset: 0, title: 'Turning Point', description: `Critical moment in the ${topic}` },
      { yearOffset: 5, title: 'Conflict Ends', description: `Conclusion of the ${topic}` }
    ],
    revolution: [
      { yearOffset: -5, title: 'Growing Tensions', description: `Social and political unrest leading to ${topic}` },
      { yearOffset: 0, title: 'Revolution Begins', description: `Start of the ${topic}` },
      { yearOffset: 2, title: 'Major Uprising', description: `Significant events during ${topic}` },
      { yearOffset: 5, title: 'New Order', description: `Establishment of new government after ${topic}` }
    ],
    empire: [
      { yearOffset: -100, title: 'Early Formation', description: `Origins and early expansion of ${topic}` },
      { yearOffset: 0, title: 'Golden Age', description: `Peak period of ${topic}` },
      { yearOffset: 100, title: 'Decline Begins', description: `Beginning of ${topic}'s decline` },
      { yearOffset: 200, title: 'Fall', description: `End of ${topic}` }
    ]
  };
  
  // Determine base year and template
  let baseYear = 1500; // Default
  let template = templates.war; // Default
  
  // Smart topic analysis
  if (topicLower.includes('revolution')) {
    template = templates.revolution;
    if (topicLower.includes('american')) baseYear = 1776;
    else if (topicLower.includes('french')) baseYear = 1789;
    else if (topicLower.includes('russian')) baseYear = 1917;
  } else if (topicLower.includes('empire') || topicLower.includes('rome') || topicLower.includes('egypt')) {
    template = templates.empire;
    if (topicLower.includes('rome')) baseYear = 100;
    else if (topicLower.includes('egypt')) baseYear = -1500;
  } else if (topicLower.includes('war')) {
    if (topicLower.includes('world war i') || topicLower.includes('wwi')) baseYear = 1916;
    else if (topicLower.includes('world war ii') || topicLower.includes('wwii')) baseYear = 1942;
    else if (topicLower.includes('civil war')) baseYear = 1863;
  }
  
  // Generate events from template
  return template.map(t => ({
    year: baseYear + t.yearOffset,
    title: t.title,
    description: t.description,
    source: 'Template'
  })).filter(event => event.year >= -3000 && event.year <= currentYear);
}
