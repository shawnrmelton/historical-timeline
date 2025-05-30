// Sample data - fallback when API fails
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
let topicData = {}; // Store fetched data for each topic
let timelineWrapper = null;
let allYears = [];
let yearToPosition = {};

const topicColors = ['topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5'];

// API function to fetch topic data
async function fetchTopicData(topicName) {
    const normalizedTopic = topicName.toLowerCase();
    
    // First check if we have sample data
    if (sampleData[normalizedTopic]) {
        console.log(`Using sample data for: ${topicName}`);
        return sampleData[normalizedTopic];
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

// Fixed async function with proper error handling
async function handleAddTopic() {
    const input = document.getEl
