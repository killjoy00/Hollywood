// Fictional fixtures, intentionally NOT presented as current box-office facts.
// All monetary amounts in this demo are USD millions, except theatre counts and scores.
export const STARTING_CASH = 50;
export const SEASON_WEEKS = 8;
export const DEMO_STUDIOS = [
  { id: 'you', name: 'Your Studio', owner: 'You', color: '#eac479', initials: 'YS' },
  { id: 'nova', name: 'Nova Pictures', owner: 'Alex', color: '#b49cfa', initials: 'NP' },
  { id: 'silver', name: 'Silverline Films', owner: 'Jordan', color: '#92d5cd', initials: 'SF' },
  { id: 'monarch', name: 'Monarch Studios', owner: 'Casey', color: '#f7a68c', initials: 'MS' },
];

export const LEAD_HISTORY = {
  'Mara Voss': [312, 190], 'Dorian Vale': [221, 171], 'Elena Cross': [405, 248],
  'Adrian Knox': [520, 355], 'Iris Chen': [216, 120], 'Noah Bennett': [115, 104],
  'Rafael Quinn': [318, 215], 'Sloane Mercer': [287, 235], 'Julian West': [134, 92],
  'Amara Ellis': [192, 140], 'Nico Serrano': [430, 274], 'Vivienne Cole': [220, 186],
  'Ezra Blake': [290, 165], 'Clara Wynn': [260, 178], 'Luca Reed': [505, 328],
  'Maeve Turner': [180, 123],
};

export const FILMS = [
  { id: 'eclipse', title: 'Eclipse Protocol', tag: 'The future has a price.', genre: 'SCI-FI', week: 1, budget: 72, rt: 81, gross: [31, 17.1, 8.8, 4.4, 2.1, .8], screens: [3650, 3320, 2780, 1900, 1100, 520], lead: 'Mara Voss', supporting: ['Jules Ardent', 'Theo Grant'], director: 'Leah Monroe', colors: ['#4a6c8c', '#182d46'] },
  { id: 'velvet', title: 'The Velvet Heist', tag: 'Everybody wants a cut.', genre: 'THRILLER', week: 1, budget: 32, rt: 93, gross: [16.8, 10.5, 6.1, 3.0, 1.5], screens: [2800, 2600, 2110, 1450, 720], lead: 'Dorian Vale', supporting: ['Sofia Hart', 'Malik Rhodes'], director: 'Evelyn Park', colors: ['#a7505a', '#452d44'] },
  { id: 'dragon', title: "Dragon's Crown", tag: 'A kingdom will burn.', genre: 'FANTASY', week: 2, budget: 108, rt: 69, gross: [43, 24.1, 13.5, 7.5, 3.0], screens: [4100, 3880, 3100, 2210, 1320], lead: 'Elena Cross', supporting: ['Dorian Vale', 'Tessa Bloom'], director: 'Grant Huxley', colors: ['#c28b51', '#6c3f30'] },
  { id: 'ninth', title: 'The Ninth Floor', tag: 'No one leaves alone.', genre: 'HORROR', week: 2, budget: 18, rt: 95, gross: [11.1, 7.7, 4.0, 2.1, .9], screens: [2300, 2390, 1800, 990, 450], lead: 'Adrian Knox', supporting: ['Lena Torres', 'Jules Ardent'], director: 'Cora Finch', colors: ['#758a8a', '#263a3d'] },
  { id: 'ashes', title: 'King of Ashes', tag: 'The crown is not given.', genre: 'ACTION', week: 3, budget: 96, rt: 56, gross: [38.5, 19.6, 9.8, 4.1, 1.3], screens: [3980, 3520, 2700, 1500, 620], lead: 'Iris Chen', supporting: ['Grant Hale', 'Faye Winters'], director: 'Marco Bell', colors: ['#c05c3b', '#523445'] },
  { id: 'summer', title: 'Summer at Sea', tag: 'One last perfect weekend.', genre: 'ROMANCE', week: 3, budget: 28, rt: 88, gross: [15.2, 10.3, 6.0, 3.4, 1.5], screens: [2620, 2550, 2080, 1600, 700], lead: 'Noah Bennett', supporting: ['Mara Voss', 'Elliot Moss'], director: 'Nina Solis', colors: ['#64abb4', '#457f98'] },
  { id: 'ghost', title: 'Ghost Signal', tag: 'Some calls never end.', genre: 'MYSTERY', week: 4, budget: 53, rt: 78, gross: [22.7, 13.4, 6.5, 3.1, 1.2], screens: [3140, 3050, 2450, 1600, 650], lead: 'Rafael Quinn', supporting: ['Phoebe Lane', 'Miles Rowan'], director: 'Evelyn Park', colors: ['#6f75aa', '#2a3658'] },
  { id: 'encore', title: 'The Last Encore', tag: 'This is their final song.', genre: 'DRAMA', week: 4, budget: 23, rt: 97, gross: [9.3, 7.0, 5.0, 3.2, 1.7], screens: [1970, 2050, 1960, 1580, 900], lead: 'Sloane Mercer', supporting: ['Tessa Bloom', 'Leo Banks'], director: 'Leah Monroe', colors: ['#a26889', '#544269'] },
  { id: 'moonfall', title: 'Moonfall Avenue', tag: 'Home is another planet.', genre: 'SCI-FI', week: 5, budget: 47, rt: 84, gross: [20.5, 12.8, 7.0, 3.7], screens: [3130, 3010, 2550, 1710], lead: 'Julian West', supporting: ['Sofia Hart', 'Aria Hale'], director: 'Tomas Reed', colors: ['#5c7fb0', '#302d69'] },
  { id: 'atlas', title: 'Atlas Rising', tag: 'Our biggest adventure.', genre: 'ADVENTURE', week: 5, budget: 144, rt: 73, gross: [61, 34.5, 19.0, 10.5], screens: [4350, 4130, 3800, 3010], lead: 'Amara Ellis', supporting: ['Theo Grant', 'Grant Hale'], director: 'Marco Bell', colors: ['#76b8a2', '#3e665b'] },
  { id: 'deep', title: 'Deep End', tag: 'The water remembers.', genre: 'HORROR', week: 6, budget: 21, rt: 90, gross: [12.2, 7.9, 4.3], screens: [2350, 2330, 1770], lead: 'Nico Serrano', supporting: ['Lena Torres', 'Benji Cole'], director: 'Cora Finch', colors: ['#5ca79c', '#224c51'] },
  { id: 'kingdom', title: 'Kingdom Lost', tag: 'Every legend ends.', genre: 'FANTASY', week: 6, budget: 107, rt: 60, gross: [42.2, 22.0, 11.5], screens: [4080, 3860, 3200], lead: 'Vivienne Cole', supporting: ['Miles Rowan', 'Faye Winters'], director: 'Grant Huxley', colors: ['#c7aa7b', '#685a51'] },
  { id: 'velocity', title: 'Velocity', tag: 'Never touch the brakes.', genre: 'ACTION', week: 7, budget: 116, rt: 76, gross: [50.3, 28.5], screens: [4210, 4090], lead: 'Ezra Blake', supporting: ['Phoebe Lane', 'Leo Banks'], director: 'Tomas Reed', colors: ['#da6c43', '#704247'] },
  { id: 'orchard', title: 'The Wild Orchard', tag: 'A life in full bloom.', genre: 'DRAMA', week: 7, budget: 27, rt: 96, gross: [12.0, 8.5], screens: [2500, 2440], lead: 'Clara Wynn', supporting: ['Elliot Moss', 'Aria Hale'], director: 'Nina Solis', colors: ['#b88d70', '#5c6f51'] },
  { id: 'neptune', title: 'Neptune Run', tag: 'Beyond the edge of space.', genre: 'SCI-FI', week: 8, budget: 162, rt: 82, gross: [71], screens: [4490], lead: 'Luca Reed', supporting: ['Benji Cole', 'Grant Hale'], director: 'Leah Monroe', colors: ['#647fd0', '#33395f'] },
  { id: 'quiet', title: 'The Quiet Storm', tag: 'Every secret has a sound.', genre: 'THRILLER', week: 8, budget: 36, rt: 91, gross: [16.6], screens: [2900], lead: 'Maeve Turner', supporting: ['Malik Rhodes', 'Sofia Hart'], director: 'Evelyn Park', colors: ['#b388ae', '#584c75'] },
];

export const byFilmId = Object.fromEntries(FILMS.map(f => [f.id, f]));

function normalizeId(name) { return `p-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`; }
const roles = [];
for (const film of FILMS) {
  roles.push({ id: `title-${film.id}`, name: film.title, filmId: film.id, role: 'title', reserve: film.budget / 5 });
  const [lastDomestic, lastBudgets] = LEAD_HISTORY[film.lead] || [225, 180];
  roles.push({ id: normalizeId(film.lead), name: film.lead, filmId: film.id, role: 'lead', reserve: (lastDomestic / lastBudgets) * (film.budget * .3) / 4 });
  for (const name of film.supporting) roles.push({ id: normalizeId(name), name, filmId: film.id, role: 'support', reserve: film.budget / 10 });
  roles.push({ id: normalizeId(film.director), name: film.director, filmId: film.id, role: 'director', reserve: .5 });
}
const priority = { title: 4, lead: 3, support: 2, director: 1 };
const map = new Map();
for (const role of roles) {
  const talent = map.get(role.id) || { id: role.id, name: role.name, roles: [], primaryRole: role.role, reserve: 0 };
  talent.roles.push({ filmId: role.filmId, role: role.role, reserve: role.reserve });
  talent.reserve += role.reserve;
  if (priority[role.role] > priority[talent.primaryRole]) talent.primaryRole = role.role;
  map.set(talent.id, talent);
}
export const TALENT = [...map.values()].map(t => ({ ...t, reserve: Math.round(t.reserve * 10000) / 10000,
  firstWeek: Math.min(...t.roles.map(r => byFilmId[r.filmId].week)) }));
export const byTalentId = Object.fromEntries(TALENT.map(t => [t.id, t]));
