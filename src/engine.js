import { FILMS, byFilmId, TALENT, byTalentId, DEMO_STUDIOS, STARTING_CASH, SEASON_WEEKS } from './data.js';

export const SLOTS = ['title', 'lead', 'support1', 'support2', 'director'];
export const SLOT_LABELS = { title: 'Title', lead: 'Lead Actor', support1: 'Supporting Actor', support2: 'Supporting Actor', director: 'Director' };
const SLOT_ROLE = { title: 'title', lead: 'lead', support1: 'support', support2: 'support', director: 'director' };
const round = v => Math.round((v + Number.EPSILON) * 10000) / 10000;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hash = s => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
export const money = (n, digits = 1) => `${Number(n) < 0 ? '-' : ''}$${Math.abs(Number(n || 0)).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}M`;
export const studio = (game, id) => game.studios.find(s => s.id === id);
export const asset = (game, talentId) => game.holdings.find(a => a.talentId === talentId);
export const owned = (game, studioId) => game.holdings.filter(a => a.ownerId === studioId);
export const primaryFilm = t => byFilmId[t.roles[0].filmId];
export const roleName = r => ({ title: 'TITLE', lead: 'LEAD', support: 'SUPPORT', director: 'DIRECTOR' }[r] || r);
export const effectiveAsk = (t, week) => round(Math.max(.1, t.reserve * Math.pow(.74, Math.max(0, week - t.firstWeek))));
export const bidStep = price => round(Math.max(.1, Math.ceil(price * .08 * 10) / 10));

export function weekendFilmStats(film, week) {
  const offset = week - film.week;
  return { gross: offset >= 0 ? film.gross[offset] || 0 : 0, screens: offset >= 0 ? film.screens[offset] || 0 : 0 };
}

export function filmRankings(week) {
  return FILMS.map(f => ({ filmId: f.id, ...weekendFilmStats(f, week) }))
    .filter(m => m.gross > 0).sort((a, b) => b.gross - a.gross)
    .map((m, index) => ({ ...m, rank: index + 1 }));
}

export function scoreTalent(talent, week) {
  return round(talent.roles.reduce((total, r) => {
    const film = byFilmId[r.filmId];
    const { gross, screens } = weekendFilmStats(film, week);
    if (!gross) return total;
    if (r.role === 'title') return total + gross;
    if (r.role === 'lead') return total + gross * .75;
    if (r.role === 'support') return total + gross * .4 * (film.rt / 100);
    if (r.role === 'director') return total + (screens ? gross * 1000 / screens : 0);
    return total;
  }, 0));
}

export function budgetForAsset(holding, week) {
  const talent = byTalentId[holding.talentId];
  const denominator = talent.reserve || 1;
  return round(talent.roles.reduce((n, r) => {
    const age = week - byFilmId[r.filmId].week;
    const factor = age >= 5 ? 0 : age <= 0 ? 1 : Math.pow(.5, age);
    return n + holding.purchasePrice * (r.reserve / denominator) * factor;
  }, 0));
}

export function weeklyProduction(game, studioId) {
  const lineup = game.lineups[studioId] || {};
  const ids = [...new Set(Object.values(lineup).filter(Boolean))];
  const contributions = ids.map(id => ({ talentId: id, name: byTalentId[id].name, score: scoreTalent(byTalentId[id], game.week) }));
  const gross = round(contributions.reduce((n, c) => n + c.score, 0));
  const budget = round(ids.reduce((n, id) => n + budgetForAsset(asset(game, id), game.week), 0));
  return { contributions, gross, budget };
}

export function projectedScore(talent, week) {
  return round(talent.roles.reduce((total, r) => {
    const f = byFilmId[r.filmId];
    const age = week - f.week;
    if (age < 0 || age >= 6) return total;
    const estimateGross = (f.budget * .28) * Math.pow(.53, age);
    if (r.role === 'title') return total + estimateGross;
    if (r.role === 'lead') return total + estimateGross * .75;
    if (r.role === 'support') return total + estimateGross * .4 * (f.rt / 100);
    if (r.role === 'director') return total + estimateGross * 1000 / 3100;
    return total;
  }, 0));
}

export function projectedStudioGross(game, studioId) {
  let picks = Object.values(game.lineups[studioId] || {}).filter(Boolean);
  // Before AI lineups lock, estimate a rival's best available owned talent.
  if (!picks.length && studioId !== 'you') {
    const options = owned(game, studioId).map(h => byTalentId[h.talentId]);
    picks = SLOTS.map(slot => options.filter(t => t.primaryRole === SLOT_ROLE[slot])
      .sort((a,b) => projectedScore(b, game.week) - projectedScore(a, game.week))[slot === 'support2' ? 1 : 0]?.id).filter(Boolean);
  }
  return round(picks.reduce((n, id) => n + projectedScore(byTalentId[id], game.week), 0));
}

export function canListTalent(t, week) {
  return t.firstWeek <= (week === 1 ? 2 : week + 2);
}

export function bidAvailable(game, studioId, excludingId = null) {
  const holds = game.auctions.filter(a => a.highBidder === studioId && a.talentId !== excludingId)
    .reduce((sum, a) => sum + a.highBid, 0);
  return round(studio(game, studioId).cash - holds);
}

function prepareAuctions(game) {
  game.auctions = TALENT.filter(t => !asset(game, t.id) && canListTalent(t, game.week)).map(t => {
    const opening = effectiveAsk(t, game.week);
    const auction = { talentId: t.id, opening, highBid: opening, highBidder: null };
    const h = hash(`${t.id}/${game.week}`);
    if (h % 7 === 0 || h % 7 === 3) {
      const id = ['nova', 'silver', 'monarch'][h % 3];
      const price = round(opening + bidStep(opening));
      if (bidAvailable(game, id) >= price) {
        auction.highBid = price;
        auction.highBidder = id;
      }
    }
    return auction;
  });
  // Make initial opponent offers visible before player bidding; do not reserve more than any studio has.
  const totals = {};
  for (const auction of game.auctions) {
    if (!auction.highBidder) continue;
    const id = auction.highBidder;
    totals[id] = (totals[id] || 0) + auction.highBid;
    if (totals[id] > studio(game, id).cash) {
      totals[id] -= auction.highBid;
      auction.highBid = auction.opening;
      auction.highBidder = null;
    }
  }
}

export function createGame() {
  const game = {
    version: 1, week: 1, phase: 'bidding', selected: 'overview',
    studios: DEMO_STUDIOS.map(s => ({ ...s, cash: STARTING_CASH, totalGross: 0, blockbusterProfit: 0 })),
    holdings: [], auctions: [],
    lineups: Object.fromEntries(DEMO_STUDIOS.map(s => [s.id, {}])),
    campaigns: Object.fromEntries(DEMO_STUDIOS.map(s => [s.id, { ads: 0, attacks: [] }])),
    deals: [], history: [], journal: [],
  };
  prepareAuctions(game);
  return game;
}

export function clone(game) { return structuredClone(game); }
function log(game, text, type = 'info') {
  game.journal.unshift({ week: game.week, text, type });
  game.journal = game.journal.slice(0, 45);
}

export function placeBid(game, talentId) {
  assert(game.phase === 'bidding', 'Bidding is closed for this week.');
  const a = game.auctions.find(x => x.talentId === talentId);
  assert(a, 'This talent is not available to bid on.');
  assert(a.highBidder !== 'you', 'You already have the high bid.');
  const offer = round(a.highBid + bidStep(a.highBid));
  assert(bidAvailable(game, 'you') >= offer, `Not enough available cash to bid ${money(offer)}.`);
  a.highBid = offer;
  a.highBidder = 'you';
  log(game, `You bid ${money(offer)} for ${byTalentId[talentId].name}.`, 'bid');
  return game;
}

function acquire(game, studioId, t, price, label) {
  assert(!asset(game, t.id), 'Talent has already been sold.');
  assert(studio(game, studioId).cash + 1e-8 >= price, 'Insufficient studio cash.');
  studio(game, studioId).cash = round(studio(game, studioId).cash - price);
  game.holdings.push({ talentId: t.id, ownerId: studioId, purchasePrice: price, purchasedWeek: game.week });
  log(game, `${studio(game, studioId).name} ${label} ${t.name} for ${money(price)}.`, 'sale');
}

export function closeBidding(game) {
  assert(game.phase === 'bidding', 'Auctions are not open.');
  for (const a of game.auctions) {
    if (!a.highBidder) continue;
    const bidder = studio(game, a.highBidder);
    if (bidder.cash + 1e-8 >= a.highBid) acquire(game, a.highBidder, byTalentId[a.talentId], a.highBid, 'signed');
  }
  game.auctions = [];
  game.phase = 'lineup';
  log(game, 'Auctions closed. Cast your five talent slots and prepare your release.', 'system');
  return game;
}

export function freeAgents(game, role = null) {
  return TALENT.filter(t => !asset(game, t.id) && canListTalent(t, game.week) && (!role || t.primaryRole === role));
}

export function signFreeAgent(game, talentId) {
  assert(game.phase === 'lineup', 'Free-agent signing is available after auctions close.');
  const t = byTalentId[talentId];
  assert(t && !asset(game, talentId) && canListTalent(t, game.week), 'This talent is unavailable.');
  acquire(game, 'you', t, effectiveAsk(t, game.week), 'signed as a free agent');
  return game;
}

export function setLineup(game, slot, talentId, studioId = 'you') {
  assert(game.phase === 'lineup', 'Lineups can be changed only before weekend scoring.');
  assert(SLOTS.includes(slot), 'Invalid lineup slot.');
  if (talentId) {
    assert(asset(game, talentId)?.ownerId === studioId, 'You do not own that talent.');
    assert(byTalentId[talentId].primaryRole === SLOT_ROLE[slot], 'Talent must play in their highest applicable category.');
  }
  const selected = game.lineups[studioId] || {};
  for (const k of SLOTS) if (selected[k] === talentId && k !== slot) selected[k] = null;
  selected[slot] = talentId || null;
  game.lineups[studioId] = selected;
  return game;
}

export function autoCast(game, studioId = 'you') {
  assert(game.phase === 'lineup', 'Lineups are currently locked.');
  const eligible = owned(game, studioId).map(h => byTalentId[h.talentId]);
  const result = {};
  const used = new Set();
  for (const slot of SLOTS) {
    const best = eligible.filter(t => t.primaryRole === SLOT_ROLE[slot] && !used.has(t.id))
      .sort((a, b) => projectedScore(b, game.week) - projectedScore(a, game.week))[0];
    result[slot] = best?.id || null;
    if (best) used.add(best.id);
  }
  game.lineups[studioId] = result;
  return game;
}

export function missingSlots(game, studioId = 'you') {
  return SLOTS.filter(s => !game.lineups[studioId]?.[s]);
}

function autoCastRivals(game) {
  const rolesBySlot = { title: 'title', lead: 'lead', support1: 'support', support2: 'support', director: 'director' };
  for (const id of ['nova', 'silver', 'monarch']) {
    autoCast(game, id);
    for (const slot of SLOTS) {
      if (game.lineups[id][slot]) continue;
      const options = freeAgents(game, rolesBySlot[slot])
        .filter(t => effectiveAsk(t, game.week) <= studio(game, id).cash)
        .sort((a, b) => (projectedScore(b, game.week) / Math.max(.4, effectiveAsk(b, game.week))) - (projectedScore(a, game.week) / Math.max(.4, effectiveAsk(a, game.week))));
      const t = options[0];
      if (!t) continue;
      acquire(game, id, t, effectiveAsk(t, game.week), 'picked up');
      game.lineups[id][slot] = t.id;
    }
    autoCast(game, id);
  }
}

export function buyAdSupport(game) {
  assert(game.phase === 'lineup', 'Marketing is available before the weekend.');
  assert(studio(game, 'you').cash >= 1, 'You need at least $1M to buy ad support.');
  assert(game.campaigns.you.ads < 20, 'Ad support is capped at 100%.');
  studio(game, 'you').cash = round(studio(game, 'you').cash - 1);
  game.campaigns.you.ads += 1;
  log(game, 'You bought 5% ad protection for $1M.', 'ad');
  return game;
}

export function buyBadReview(game, targetId, story = '') {
  assert(game.phase === 'lineup', 'Bad reviews may only be purchased before the weekend.');
  assert(targetId !== 'you' && studio(game, targetId), 'Choose another producer.');
  assert(studio(game, 'you').cash >= 1.5, 'You need $1.5M for a bad review.');
  const existing = game.campaigns.you.attacks.filter(a => a.targetId === targetId).length;
  assert(existing < 20, 'Bad reviews against this producer are capped at 100%.');
  studio(game, 'you').cash = round(studio(game, 'you').cash - 1.5);
  game.campaigns.you.attacks.push({ targetId, story: String(story).trim().slice(0, 280) });
  log(game, `An anonymous bad review targeted ${studio(game, targetId).name}.`, 'review');
  return game;
}

export function offerCoProduction(game, otherId, direction, percent, price) {
  assert(game.phase === 'lineup', 'Co-productions are negotiated before a weekend.');
  assert(otherId !== 'you' && studio(game, otherId), 'Choose another producer.');
  assert(['sell', 'buy'].includes(direction), 'Invalid direction.');
  assert(Number.isFinite(percent) && percent >= 5 && percent <= 50 && percent % 5 === 0, 'Stake must be 5% to 50% in 5% increments.');
  assert(Number.isFinite(price) && price >= .1, 'A positive price is required.');
  const sellerId = direction === 'sell' ? 'you' : otherId;
  const buyerId = direction === 'sell' ? otherId : 'you';
  const alreadySold = game.deals.filter(d => d.week === game.week && d.sellerId === sellerId)
    .reduce((n, d) => n + d.percent, 0);
  assert(alreadySold + percent <= 50, 'A producer can sell at most 50% of a weekly film.');
  const expectedShare = projectedStudioGross(game, sellerId) * percent / 100;
  if (direction === 'sell') assert(price <= round(expectedShare * 1.25) && expectedShare > 0, 'The buyer declined that asking price. Try a smaller fee or cast your film first.');
  if (direction === 'buy') assert(price >= round(expectedShare * .8) && expectedShare > 0, 'The other producer declined your offer. Offer more.');
  assert(studio(game, buyerId).cash >= price, 'The buyer cannot afford the co-production.');
  studio(game, buyerId).cash = round(studio(game, buyerId).cash - price);
  studio(game, sellerId).cash = round(studio(game, sellerId).cash + price);
  game.deals.push({ week: game.week, sellerId, buyerId, percent, price: round(price) });
  log(game, `${studio(game, buyerId).name} bought ${percent}% of ${studio(game, sellerId).name}'s weekly gross for ${money(price)}.`, 'deal');
  return game;
}

export function tradeTalent(game, talentId, direction, otherId, price) {
  assert(game.phase === 'lineup', 'Trades are open only before weekend lock.');
  assert(otherId !== 'you' && studio(game, otherId), 'Choose a valid opposing producer.');
  const holding = asset(game, talentId);
  assert(holding, 'That talent is not owned by any studio.');
  assert(['buy', 'sell'].includes(direction), 'Invalid trade direction.');
  const sellerId = direction === 'sell' ? 'you' : otherId;
  const buyerId = direction === 'sell' ? otherId : 'you';
  assert(holding.ownerId === sellerId, 'The seller does not own that talent.');
  assert(Number.isFinite(price) && price >= .1, 'Trade price must be at least $0.1M.');
  const fair = Math.max(effectiveAsk(byTalentId[talentId], game.week), holding.purchasePrice);
  if (direction === 'sell') assert(price <= round(fair * 1.3), 'The buyer declined your price.');
  if (direction === 'buy') assert(price >= round(fair * 1.1), 'The seller wants a higher offer.');
  assert(studio(game, buyerId).cash >= price, 'The buyer cannot afford the trade.');
  studio(game, buyerId).cash = round(studio(game, buyerId).cash - price);
  studio(game, sellerId).cash = round(studio(game, sellerId).cash + price);
  holding.ownerId = buyerId;
  holding.purchasePrice = round(price); // new owner's purchase cost drives their production budget
  holding.purchasedWeek = game.week;
  for (const lineup of Object.values(game.lineups)) for (const slot of SLOTS) if (lineup[slot] === talentId) lineup[slot] = null;
  log(game, `${studio(game, buyerId).name} traded for ${byTalentId[talentId].name} at ${money(price)}.`, 'deal');
  return game;
}

function bonusForTalent(t, week) {
  let amount = 0;
  for (const r of t.roles) {
    const f = byFilmId[r.filmId];
    const age = week - f.week;
    if (![4, 9].includes(age)) continue;
    const n = age === 4 ? 5 : 10;
    const cutoff = age === 4 ? 5 : 10;
    const success = Array.from({ length: cutoff }, (_, k) => filmRankings(week - k)
      .find(row => row.filmId === f.id)?.rank || Infinity).every(rank => rank <= cutoff);
    if (success) amount += n;
  }
  return amount;
}

export function scoreWeekend(game) {
  assert(game.phase === 'lineup', 'Finish your auctions before producing a weekend.');
  const missing = missingSlots(game);
  assert(!missing.length, `Cast all five slots before premiering: ${missing.map(s => SLOT_LABELS[s]).join(', ')}.`);
  autoCastRivals(game);
  const production = Object.fromEntries(game.studios.map(s => [s.id, weeklyProduction(game, s.id)]));
  const cards = game.studios.map(s => {
    const attacked = game.studios.reduce((n, attacker) => n + game.campaigns[attacker.id].attacks
      .filter(a => a.targetId === s.id).length, 0);
    const protectedUnits = game.campaigns[s.id].ads;
    const damage = Math.min(1, Math.max(0, attacked - protectedUnits) * .05);
    const gross = round(production[s.id].gross * (1 - damage));
    return { studioId: s.id, grossBeforeMarketing: production[s.id].gross,
      gross, damage: round(damage * 100), budget: production[s.id].budget,
      contributions: production[s.id].contributions, dealDelta: 0, bonus: 0, finalGross: gross, profit: 0 };
  });
  for (const deal of game.deals.filter(d => d.week === game.week)) {
    const seller = cards.find(c => c.studioId === deal.sellerId);
    const buyer = cards.find(c => c.studioId === deal.buyerId);
    const share = round(seller.gross * deal.percent / 100);
    seller.dealDelta = round(seller.dealDelta - share);
    buyer.dealDelta = round(buyer.dealDelta + share);
  }
  for (const c of cards) {
    c.bonus = round(owned(game, c.studioId).reduce((n, h) => n + bonusForTalent(byTalentId[h.talentId], game.week), 0));
    c.finalGross = round(c.gross + c.dealDelta);
    c.profit = round(c.finalGross - c.budget);
    const s = studio(game, c.studioId);
    s.cash = round(s.cash + c.finalGross + c.bonus);
    s.totalGross = round(s.totalGross + c.finalGross + c.bonus);
    if (game.week >= 7) s.blockbusterProfit = round(s.blockbusterProfit + c.profit);
  }
  game.history.push({ week: game.week, cards, rankings: filmRankings(game.week) });
  game.phase = 'results';
  const winner = [...cards].sort((a, b) => (game.week >= 7 ? b.profit - a.profit : b.finalGross - a.finalGross))[0];
  log(game, `${studio(game, winner.studioId).name} led week ${game.week} with ${money(game.week >= 7 ? winner.profit : winner.finalGross)} ${game.week >= 7 ? 'profit' : 'gross'}.`, 'result');
  return game;
}

export function nextWeek(game) {
  assert(game.phase === 'results', 'Finish the weekend before advancing.');
  if (game.week >= SEASON_WEEKS) {
    game.phase = 'finished';
    log(game, 'The eight-week season has ended. A champion has been crowned!', 'system');
    return game;
  }
  game.week++;
  game.phase = 'bidding';
  game.lineups = Object.fromEntries(game.studios.map(s => [s.id, {}]));
  game.campaigns = Object.fromEntries(game.studios.map(s => [s.id, { ads: 0, attacks: [] }]));
  prepareAuctions(game);
  log(game, `Week ${game.week} is open for bidding.`, 'system');
  return game;
}

export function standings(game) {
  return [...game.studios].sort((a, b) => {
    if (game.phase === 'finished' || game.week >= 7 && game.history.some(h => h.week >= 7)) return b.blockbusterProfit - a.blockbusterProfit || b.cash - a.cash;
    return b.cash - a.cash || b.totalGross - a.totalGross;
  });
}

export function restart(game) { Object.assign(game, createGame()); return game; }
