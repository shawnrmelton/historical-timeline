// Sample data - this will be replaced with API calls
const sampleData = {
    'world wars': [
        { year: 1914, title: 'WWI Begins', description: 'Archduke Franz Ferdinand assassinated, triggering World War I' },
        { year: 1917, title: 'US Enters WWI', description: 'United States declares war on Germany' },
        { year: 1918, title: 'WWI Ends', description: 'Armistice signed, ending World War I' },
        { year: 1939, title: 'WWII Begins', description: 'Germany invades Poland, starting World War II' },
        { year: 1941, title: 'Pearl Harbor', description: 'Japan attacks Pearl Harbor, US enters WWII' },
        { year: 1945, title: 'WWII Ends', description: 'Germany and Japan surrender, ending World War II' }
    ],
    'space exploration': [
        { year: 1957, title: 'Sputnik Launch', description: 'Soviet Union launches first artificial satellite' },
        { year: 1961, title: 'First Human in Space', description: 'Yuri Gagarin becomes first human to orbit Earth' },
        { year: 1969, title: 'Moon Landing', description: 'Apollo 11 lands on the moon, Neil Armstrong walks on lunar surface' },
        { year: 1981, title: 'Space Shuttle Era', description: 'First Space Shuttle Columbia launches' },
        { year: 1998, title: 'ISS Construction', description: 'International Space Station construction begins' },
        { year: 2020, title: 'Commercial Spaceflight', description: 'SpaceX Crew Dragon carries astronauts to ISS' }
    ],
    'industrial revolution': [
        { year: 1760, title: 'Steam Engine Improved', description: 'James Watt improves the steam engine' },
        { year: 1807, title: 'Steamboat Invented', description: 'Robert Fulton demonstrates practical steamboat' },
        { year: 1825, title: 'First Railway', description: 'First passenger railway opens in England' },
        { year: 1876, title: 'Telephone Invented', description: 'Alexander Graham Bell patents the telephone' },
        { year: 1879, title: 'Light Bulb', description: 'Thomas Edison creates practical incandescent light bulb' },
        { year: 1886, title: 'Automobile', description: 'Karl Benz patents the first practical automobile' }
    ],
    'scientific revolution': [
        { year: 1543, title: 'Heliocentric Theory', description: 'Copernicus publishes heliocentric model of solar system' },
        { year: 1609, title: 'Telescope Astronomy', description: 'Galileo first uses telescope for astronomical observations' },
        { year: 1687, title: 'Laws of Motion', description: 'Newton publishes Principia, establishing laws of motion and gravity' },
        { year: 1859, title: 'Evolution Theory', description: 'Darwin publishes Origin of Species' },
        { year: 1905, title: 'Relativity Theory', description: 'Einstein publishes special theory of relativity' },
        { year: 1953, title: 'DNA Structure', description: 'Watson and Crick discover structure of DNA' }
    ],
    'renaissance art': [
        { year: 1495, title: 'The Last Supper', description: 'Leonardo da Vinci begins painting The Last Supper' },
        { year: 1503, title: 'Mona Lisa', description: 'Leonardo da Vinci starts painting the Mona Lisa' },
        { year: 1508, title: 'Sistine Chapel', description: 'Michelangelo begins painting Sistine Chapel ceiling' },
        { year: 1520, title: 'Raphael Dies', description: 'Raphael dies at age 37, ending High Renaissance triumvirate' },
        { year: 1564, title: 'Shakespeare Born', description: 'William Shakespeare born, Renaissance literature flourishes' },
        { year: 1600, title: 'Baroque Begins', description: 'Baroque art movement begins, succeeding Renaissance' }
    ]
};

let activeTopics = [];
let timelineWrapper = null;
let allYears = [];
let yearToPosition = {};

const topicColors = ['topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5'];

// API function to fetch topic data (placeholder for Wikipedia API)
async function fetchTopicData(topicName) {
    // For now, return sample data
    // Later, this will call your Wikipedia API
    if (sampleData[topicName.toLowerCase()]) {
        return sampleData[topicName.toLowerCase()];
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to fetch from Wikipedia API (placeholder)
    try {
        const response = await fetch(`/api/wikipedia?topic=${encodeURIComponent(topicName)}`);
        if (response.ok) {
            const data = await response.json();
            return data.events || [];
        }
    } catch (error) {
        console.log('API not available, using sample data');
    }
    
    return null;
}

async function addTopic() {
    const input = document.getElementById('topicInput');
    const topicName = input.value.trim().toLowerCase();
    
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

        activeTopics.push(topicName);
        input.value = '';
        updateUI();
        
    } catch (error) {
        showError('Failed to fetch topic data. Please try again.');
        if (activeTopics.length === 0) {
            container.innerHTML = getEmptyStateHTML();
        }
    }
}

function removeTopic(topicName) {
    activeTopics = activeTopics.filter(topic => topic !== topicName);
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
        const events = sampleData[topic] || [];
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
        
        // Topic label
        const label = document.createElement('div');
        label.className = `topic-label ${colorClass}`;
        label.innerHTML = `
            <div class="topic-label-color ${colorClass}"></div>
            <span>${topic.charAt(0).toUpperCase() + topic.slice(1)}</span>
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
        const events = sampleData[topic] || [];
        
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'timeline-event';
            eventElement.style.left = `${yearToPosition[event.year]}vw`;
            
            eventElement.innerHTML = `
                <div class="event-marker"></div>
                <div class="event-card">
                    <div class="event-year">${event.year}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-description">${event.description}</div>
                </div>
            `;
            
            eventsContainer.appendChild(eventElement);
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
