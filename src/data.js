// Actual release titles/dates and credited performers are curated separately.
// All monetary amounts, theater counts and ratings in the playable simulation
// remain FAKE demonstration values until approved box-office data is connected.
import { RELEASES, RELEASE_SNAPSHOT_DATE, SEASON_START } from './releases.js';
export { RELEASE_SNAPSHOT_DATE, SEASON_START };
export const STARTING_CASH = 50;
export const SEASON_WEEKS = 8;
export const DEMO_STUDIOS = [
  { id: 'you', name: 'Your Studio', owner: 'You', color: '#5c805e', initials: 'YS' },
  { id: 'nova', name: 'Nova Pictures', owner: 'Alex', color: '#7c6c91', initials: 'NP' },
  { id: 'silver', name: 'Silverline Films', owner: 'Jordan', color: '#69938f', initials: 'SF' },
  { id: 'monarch', name: 'Monarch Studios', owner: 'Casey', color: '#b16b55', initials: 'MS' },
];
// No actual lead-actor history has been sourced. The fallback below is a
// simulated training baseline, NOT these performers' past box-office data.
export const LEAD_HISTORY = {};
const round1 = value => Math.round(value * 10) / 10;
const GROSS_DECAY = [1, .56, .30, .155, .075, .033];
const SCREEN_DECAY = [1, .96, .83, .62, .39, .23];
export const FILMS = RELEASES.map((f) => {
  const { demoBudget, demoOpening, demoCritic, demoScreens, ...real } = f;
  return {
    ...real,
    tag: f.releaseNote || `U.S. theatrical release ${f.releaseDate}`,
    // Simulation fields: never label these as actual revenue, budget, RT or screens.
    budget: demoBudget,
    rt: demoCritic,
    gross: GROSS_DECAY.map((v) => round1(demoOpening * v)),
    screens: SCREEN_DECAY.map((v) => Math.round(demoScreens * v)),
    metricsStatus: 'simulated',
  };
});
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
