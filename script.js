let activeTopics = [];
let topicData = {}; // Store fetched data for each topic
let timelineWrapper = null;
let allYears = [];
let yearToPosition = {};

const topicColors = ['topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5'];

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
    
    // Try to fetch from API
    try {
        console.log(`Fetching from API for: ${topicName}`);
        const response = await fetch(`/api/wikipedia?topic=${encodeURIComponent(topicName)}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.events && data.events.length > 0) {
                return data.events;
            }
        }
        
        console.log('API response not valid, no events found');
    } catch (error) {
        console.error('API call failed:', error);
    }
    
    return null;
}

async function addTopic() {
    const input = document.getElementById('topicInput');
    const topicName = input.value.trim();
    
    if (!topicName || activeTopics.length >= 5) return;
    if (activeTopics.includes(topicName)) {
        showError('Topic already added!');
        return;
    }

    // Show loading state
    const container = document.getElementById('timelinesContainer');
    if (activeTopics.length === 0) {
        container.innerHTML = '<div class="loading">🔍 Searching for historical events...</div>';
    }

    try {
        const events = await fetchTopicData(topicName);
        
        if (!events || events.length === 0) {
            showError(`No data found for "${topicName}". Try: "world wars", "space exploration", "industrial revolution", "scientific revolution", or "renaissance art"`);
            if (activeTopics.length === 0) {
                container.innerHTML = getEmptyStateHTML();
            }
            return;
        }

        // Store the data
        topicData[topicName] = events;
        activeTopics.push(topicName);
        input.value = '';
        
        console.log(`Added topic "${topicName}" with ${events.length} events`);
        updateUI();
        
    } catch (error) {
        console.error('Error adding topic:', error);
        showError('Failed to fetch topic data. Please try again.');
        if (activeTopics.length === 0) {
            container.innerHTML = getEmptyStateHTML();
        }
    }
}

function removeTopic(topicName) {
    activeTopics = activeTopics.filter(topic => topic !== topicName);
    delete topicData[topicName];
    updateUI();
}

function showError(message) {
    const existing = document.querySelector('.error');
    if (existing) existing.remove();
    
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = message;
    document.querySelector('.search-container').appendChild(error);
    
    setTimeout(() => error.remove(), 5000);
}

function getEmptyStateHTML() {
    return `
        <div class="empty-state">
            <h2>🔍 Start Exploring History</h2>
            <p>Search for up to 5 historical topics to see how events unfolded across different areas simultaneously.</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">Try topics like: "World Wars", "Scientific Revolution", "Renaissance Art", "Space Exploration", "Industrial Revolution"</p>
        </div>
    `;
}

function updateUI() {
    updateActiveTopicsDisplay();
    calculateUnifiedTimeline();
    updateTimelines();
    updateYearRuler();
    updateControlsVisibility();
}

function updateActiveTopicsDisplay() {
    const container = document.getElementById('activeTopics');
    container.innerHTML = '';
    
    activeTopics.forEach((topic, index) => {
        const colorClass = topicColors[index % topicColors.length];
        const tag = document.createElement('div');
        tag.className = 'topic-tag';
        tag.innerHTML = `
            <div class="topic-color-dot ${colorClass}"></div>
            <span>${topic.charAt(0).toUpperCase() + topic.slice(1)}</span>
            <button class="topic-remove" onclick="removeTopic('${topic}')">&times;</button>
        `;
        container.appendChild(tag);
    });
}

function calculateUnifiedTimeline() {
    // Get all unique years from all active topics
    const yearSet = new Set();
    activeTopics.forEach(topic => {
        const events = topicData[topic] || [];
        events.forEach(event => {
            yearSet.add(event.year);
        });
    });
    
    allYears = Array.from(yearSet).sort((a, b) => a - b);
    
    // Calculate positions for each year
    yearToPosition = {};
    const timelineWidth = 400; // vw
    const spacing = allYears.length > 1 ? timelineWidth / (allYears.length - 1) : 0;
    
    allYears.forEach((year, index) => {
        yearToPosition[year] = index * spacing;
    });
    
    console.log('Years found:', allYears);
    console.log('Year positions:', yearToPosition);
}

function updateTimelines() {
    const container = document.getElementById('timelinesContainer');
    
    if (activeTopics.length === 0) {
        container.innerHTML = getEmptyStateHTML();
        return;
    }

    container.innerHTML = `
        <div class="unified-timeline-container">
            <div class="timeline-wrapper" id="timelineWrapper">
                <div class="timeline-grid">
                    <div class="topic-labels" id="topicLabels"></div>
                    <div class="timeline-content" id="timelineContent"></div>
                </div>
            </div>
        </div>
    `;

    const topicLabels = document.getElementById('topicLabels');
    const timelineContent = document.getElementById('timelineContent');
    timelineWrapper = document.getElementById('timelineWrapper');

    // Create topic labels and timeline tracks
    activeTopics.forEach((topic, index) => {
        const colorClass = topicColors[index % topicColors.length];
        const events = topicData[topic] || [];
        
        console.log(`Creating timeline for "${topic}" with ${events.length} events`);
        
        // Topic label
        const label = document.createElement('div');
        label.className = `topic-label ${colorClass}`;
        label.innerHTML = `
            <div class="topic-label-color ${colorClass}"></div>
            <span>${topic.charAt(0).toUpperCase() + topic.slice(1)} (${events.length})</span>
        `;
        topicLabels.appendChild(label);

        // Timeline track
        const track = document.createElement('div');
        track.className = `timeline-track ${colorClass}`;
        track.innerHTML = `
            <div class="timeline-line"></div>
            <div class="timeline-events" id="events-${index}"></div>
        `;
        timelineContent.appendChild(track);

        // Add events to this track
        const eventsContainer = track.querySelector('.timeline-events');
        
        events.forEach(event => {
            const position = yearToPosition[event.year];
            if (position !== undefined) {
                const eventElement = document.createElement('div');
                eventElement.className = 'timeline-event';
                eventElement.style.left = `${position}vw`;
                
                eventElement.innerHTML = `
                    <div class="event-marker"></div>
                    <div class="event-card">
                        <div class="event-year">${event.year}</div>
                        <div class="event-title">${event.title}</div>
                        <div class="event-description">${event.description}</div>
                    </div>
                `;
                
                eventsContainer.appendChild(eventElement);
                console.log(`Added event: ${event.year} - ${event.title}`);
            }
        });
    });

    // Sync scrolling with year ruler
    timelineWrapper.addEventListener('scroll', () => {
        const yearRuler = document.getElementById('yearRuler');
        yearRuler.scrollLeft = timelineWrapper.scrollLeft;
    });
}

function updateYearRuler() {
    const ruler = document.getElementById('yearRuler');
    const rulerContent = document.getElementById('rulerContent');
    
    if (activeTopics.length === 0) {
        ruler.style.display = 'none';
        return;
    }

    ruler.style.display = 'block';
    rulerContent.innerHTML = '';
    
    allYears.forEach(year => {
        const mark = document.createElement('div');
        mark.className = 'year-mark';
        mark.style.left = `${yearToPosition[year]}vw`;
        mark.innerHTML = `
            <div class="year-line"></div>
            <span>${year}</span>
        `;
        rulerContent.appendChild(mark);
    });
}

function updateControlsVisibility() {
    const controls = document.getElementById('controls');
    controls.style.display = activeTopics.length > 0 ? 'flex' : 'none';
}

function scrollLeft() {
    if (timelineWrapper) {
        timelineWrapper.scrollBy({ left: -400, behavior: 'smooth' });
    }
}

function scrollRight() {
    if (timelineWrapper) {
        timelineWrapper.scrollBy({ left: 400, behavior: 'smooth' });
    }
}

function scrollToStart() {
    if (timelineWrapper) {
        timelineWrapper.scrollTo({ left: 0, behavior: 'smooth' });
    }
}

function scrollToEnd() {
    if (timelineWrapper) {
        timelineWrapper.scrollTo({ left: timelineWrapper.scrollWidth, behavior: 'smooth' });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addTopicBtn').addEventListener('click', addTopic);
    document.getElementById('topicInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTopic();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (activeTopics.length === 0) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                scrollLeft();
                break;
            case 'ArrowRight':
                scrollRight();
                break;
            case 'Home':
                scrollToStart();
                break;
            case 'End':
                scrollToEnd();
                break;
        }
    });
});
