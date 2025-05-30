// Curated historical events dataset
// You can expand this with more topics and events
export const historicalDatasets = {
  'world wars': [
    { year: 1914, title: 'World War I Begins', description: 'Archduke Franz Ferdinand assassinated in Sarajevo', category: 'military' },
    { year: 1916, title: 'Battle of Verdun', description: 'Longest single battle of WWI', category: 'military' },
    { year: 1917, title: 'Russian Revolution', description: 'Bolsheviks overthrow Tsarist regime', category: 'political' },
    { year: 1917, title: 'US Enters WWI', description: 'America declares war on Germany', category: 'military' },
    { year: 1918, title: 'WWI Armistice', description: 'Fighting ends on November 11th', category: 'military' },
    { year: 1939, title: 'WWII Begins', description: 'Germany invades Poland', category: 'military' },
    { year: 1940, title: 'Battle of Britain', description: 'RAF defeats German Luftwaffe', category: 'military' },
    { year: 1941, title: 'Pearl Harbor Attack', description: 'Japan attacks US naval base', category: 'military' },
    { year: 1942, title: 'Battle of Stalingrad', description: 'Turning point on Eastern Front', category: 'military' },
    { year: 1944, title: 'D-Day Normandy', description: 'Allied invasion of Nazi-occupied France', category: 'military' },
    { year: 1945, title: 'Hiroshima & Nagasaki', description: 'Atomic bombs dropped on Japan', category: 'military' },
    { year: 1945, title: 'WWII Ends', description: 'Japan surrenders, war officially over', category: 'military' }
  ],

  'space exploration': [
    { year: 1957, title: 'Sputnik 1 Launch', description: 'First artificial satellite orbits Earth', category: 'science' },
    { year: 1957, title: 'Laika in Space', description: 'First living creature to orbit Earth', category: 'science' },
    { year: 1961, title: 'Yuri Gagarin', description: 'First human to journey into space', category: 'science' },
    { year: 1961, title: 'Alan Shepard', description: 'First American in space', category: 'science' },
    { year: 1965, title: 'First Spacewalk', description: 'Alexei Leonov exits spacecraft', category: 'science' },
    { year: 1969, title: 'Apollo 11 Moon Landing', description: 'Neil Armstrong first human on Moon', category: 'science' },
    { year: 1971, title: 'First Space Station', description: 'Salyut 1 launched by Soviet Union', category: 'science' },
    { year: 1975, title: 'Apollo-Soyuz Mission', description: 'First joint US-Soviet space mission', category: 'science' },
    { year: 1981, title: 'Space Shuttle Era', description: 'Columbia first reusable spacecraft', category: 'science' },
    { year: 1998, title: 'ISS Construction Begins', description: 'International Space Station assembly', category: 'science' },
    { year: 2012, title: 'SpaceX Dragon', description: 'First commercial spacecraft to ISS', category: 'science' },
    { year: 2020, title: 'Crew Dragon Demo', description: 'First crewed commercial spaceflight', category: 'science' }
  ],

  'american civil war': [
    { year: 1860, title: 'Lincoln Elected', description: 'Abraham Lincoln wins presidency', category: 'political' },
    { year: 1860, title: 'South Carolina Secedes', description: 'First state to leave the Union', category: 'political' },
    { year: 1861, title: 'Fort Sumter', description: 'First shots of Civil War fired', category: 'military' },
    { year: 1861, title: 'First Battle of Bull Run', description: 'First major battle of the war', category: 'military' },
    { year: 1862, title: 'Battle of Antietam', description: 'Bloodiest single day in American history', category: 'military' },
    { year: 1863, title: 'Emancipation Proclamation', description: 'Lincoln frees slaves in rebel states', category: 'political' },
    { year: 1863, title: 'Battle of Gettysburg', description: 'Turning point of the war', category: 'military' },
    { year: 1863, title: 'Gettysburg Address', description: 'Lincoln\'s famous speech', category: 'political' },
    { year: 1864, title: 'Sherman\'s March', description: 'March to the Sea through Georgia', category: 'military' },
    { year: 1865, title: 'Lee Surrenders', description: 'Confederate surrender at Appomattox', category: 'military' },
    { year: 1865, title: 'Lincoln Assassinated', description: 'President shot by John Wilkes Booth', category: 'political' }
  ],

  'ancient rome': [
    { year: -753, title: 'Founding of Rome', description: 'Legendary founding by Romulus', category: 'political' },
    { year: -509, title: 'Roman Republic', description: 'End of monarchy, republic established', category: 'political' },
    { year: -264, title: 'First Punic War', description: 'Rome vs Carthage begins', category: 'military' },
    { year: -218, title: 'Hannibal Crosses Alps', description: 'Second Punic War escalates', category: 'military' },
    { year: -49, title: 'Caesar Crosses Rubicon', description: 'Civil war begins', category: 'military' },
    { year: -44, title: 'Caesar Assassinated', description: 'Ides of March conspiracy', category: 'political' },
    { year: -27, title: 'Roman Empire Begins', description: 'Augustus becomes first emperor', category: 'political' },
    { year: 64, title: 'Great Fire of Rome', description: 'City burns under Nero', category: 'disaster' },
    { year: 79, title: 'Vesuvius Erupts', description: 'Pompeii and Herculaneum destroyed', category: 'disaster' },
    { year: 313, title: 'Edict of Milan', description: 'Christianity legalized', category: 'religious' },
    { year: 410, title: 'Visigoth Sack Rome', description: 'Alaric I captures the city', category: 'military' },
    { year: 476, title: 'Fall of Western Rome', description: 'Last emperor deposed', category: 'political' }
  ],

  'french revolution': [
    { year: 1789, title: 'Estates-General Called', description: 'First meeting since 1614', category: 'political' },
    { year: 1789, title: 'Tennis Court Oath', description: 'Third Estate forms National Assembly', category: 'political' },
    { year: 1789, title: 'Storming of Bastille', description: 'Revolution begins July 14th', category: 'political' },
    { year: 1789, title: 'Declaration of Rights', description: 'Rights of Man and Citizen adopted', category: 'political' },
    { year: 1792, title: 'Monarchy Abolished', description: 'First French Republic declared', category: 'political' },
    { year: 1793, title: 'Louis XVI Executed', description: 'King guillotined January 21st', category: 'political' },
    { year: 1793, title: 'Reign of Terror Begins', description: 'Mass executions under Robespierre', category: 'political' },
    { year: 1794, title: 'Robespierre Executed', description: 'Terror ends with his death', category: 'political' },
    { year: 1799, title: 'Napoleon\'s Coup', description: 'Bonaparte seizes power', category: 'political' },
    { year: 1804, title: 'Napoleon Crowned Emperor', description: 'Self-coronation at Notre Dame', category: 'political' }
  ],

  'cold war': [
    { year: 1945, title: 'Yalta Conference', description: 'Big Three divide post-war Europe', category: 'political' },
    { year: 1947, title: 'Truman Doctrine', description: 'US commits to containing communism', category: 'political' },
    { year: 1947, title: 'Marshall Plan', description: 'American aid rebuilds Western Europe', category: 'political' },
    { year: 1948, title: 'Berlin Blockade', description: 'Soviets cut off West Berlin', category: 'political' },
    { year: 1949, title: 'NATO Formed', description: 'Western military alliance created', category: 'political' },
    { year: 1949, title: 'Soviet Nuclear Test', description: 'USSR develops atomic bomb', category: 'science' },
    { year: 1950, title: 'Korean War Begins', description: 'First hot war of Cold War era', category: 'military' },
    { year: 1955, title: 'Warsaw Pact', description: 'Eastern bloc military alliance', category: 'political' },
    { year: 1962, title: 'Cuban Missile Crisis', description: 'World on brink of nuclear war', category: 'political' },
    { year: 1975, title: 'Vietnam War Ends', description: 'Saigon falls to North Vietnam', category: 'military' },
    { year: 1989, title: 'Berlin Wall Falls', description: 'Symbol of division comes down', category: 'political' },
    { year: 1991, title: 'Soviet Union Dissolves', description: 'Cold War officially ends', category: 'political' }
  ]
};

// Helper function to search curated datasets
export function searchCuratedData(topic) {
  const normalizedTopic = topic.toLowerCase();
  
  // Direct match
  if (historicalDatasets[normalizedTopic]) {
    return historicalDatasets[normalizedTopic];
  }
  
  // Fuzzy matching
  const matches = [];
  Object.keys(historicalDatasets).forEach(key => {
    if (key.includes(normalizedTopic) || normalizedTopic.includes(key)) {
      matches.push(...historicalDatasets[key]);
    }
  });
  
  return matches.length > 0 ? matches : null;
}
