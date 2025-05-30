// In fetchTopicData function, add this priority order:
async function fetchTopicData(topicName) {
    // 1. Check curated data first
    const curatedEvents = searchCuratedData(topicName);
    if (curatedEvents) return curatedEvents;
    
    // 2. Try Wikidata API
    const wikidataEvents = await fetchFromWikidata(topicName);
    if (wikidataEvents.length > 0) return wikidataEvents;
    
    // 3. Fall back to sample data
    return sampleData[topicName.toLowerCase()] || null;
}
