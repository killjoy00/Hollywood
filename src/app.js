import { FILMS, TALENT, byTalentId, byFilmId, SEASON_WEEKS } from './data.js';
import { createGame, clone, money, studio, asset, owned, roleName, weekendFilmStats, filmRankings, projectedScore,
  projectedStudioGross, standings, weeklyProduction, SLOTS, SLOT_LABELS, effectiveAsk, bidStep, bidAvailable,
  placeBid, closeBidding, freeAgents, signFreeAgent, setLineup, autoCast, missingSlots, buyAdSupport,
  buyBadReview, offerCoProduction, tradeTalent, scoreWeekend, nextWeek, restart } from './engine.js';

const KEY = 'hollywood-demo-v1';
const view = { page: 'overview', filter: 'all', search: '', toast: null };
let game = load();
const app = document.getElementById('app');
function load() { try { const value = JSON.parse(localStorage.getItem(KEY)); if (value?.version === 1 && value.studios?.length === 4 && value.phase) return value; } catch {} return createGame(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(game)); } catch {} }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])); }
function amount(n, digits = 1) { return money(n, digits); }
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const roleLabels = { title: 'Title', lead: 'Lead actor', support: 'Supporting actor', director: 'Director' };
const icons = {
  overview: '◈', market: '◉', production: '✦', boxoffice: '▥', league: '♛', rules: '◇',
};
const nav = [
  ['overview', 'Studio HQ'], ['market', 'Talent Market'], ['production', 'My Production'],
  ['boxoffice', 'Box Office'], ['league', 'League Table'], ['rules', 'The Rulebook'],
];
function mutation(cb) { try { const next = clone(game); cb(next); game = next; save(); toast('Updated successfully', 'success'); render(); } catch (error) { toast(error.message || 'Something went wrong.', 'error'); render(); } }
function toast(message, kind = 'success') { view.toast = { message, kind }; }
function status() { return { bidding: 'AUCTIONS OPEN', lineup: 'CASTING OPEN', results: 'WEEKEND RESULTS', finished: 'SEASON COMPLETE' }[game.phase]; }
function primaryText() { return { bidding: 'Close auctions & cast', lineup: 'Lock film & reveal box office', results: game.week === 8 ? 'Crown the champion' : 'Advance to next week', finished: 'Season finished' }[game.phase]; }
function phaseHelp() { return { bidding: 'Bid on talent before the market closes. You can sign unclaimed free agents after the auction.', lineup: 'Fill one title, one lead, two supporting actors, and a director. Your competitors are casting too.', results: 'The box office is in. Check the standings, then move on to the next release weekend.', finished: 'The last two blockbuster weekends determined the champion.' }[game.phase]; }
const premiereType = week => week >= 7 ? 'BLOCKBUSTER SEASON' : 'REGULAR SEASON';
function pill(text, kind = '') { return `<span class="pill ${kind}">${esc(text)}</span>`; }
function filmVisual(f, compact = false) {
  return `<div class="poster ${compact ? 'poster-small' : ''}" style="--a:${f.colors[0]};--b:${f.colors[1]}"><span class="poster-texture"></span><span class="poster-mark">✧</span><div class="poster-content"><span>${esc(f.genre)} · ${String(f.week).padStart(2, '0')}</span><strong>${esc(f.title)}</strong>${compact ? '' : `<small>${esc(f.tag)}</small>`}</div></div>`;
}
function empty(text, sub = '') { return `<div class="empty-state"><span class="empty-icon">✧</span><strong>${esc(text)}</strong>${sub ? `<p>${esc(sub)}</p>` : ''}</div>`; }
function primaryAction() {
  if (game.phase === 'finished') return `<button class="btn btn-gold" data-action="reset">New demo season <span>↗</span></button>`;
  if (game.phase === 'bidding' && view.page === 'overview') return `<button class="btn btn-gold" data-nav="market">Browse the talent market <span>→</span></button>`;
  return `<button class="btn btn-gold" data-action="primary">${primaryText()} <span>→</span></button>`;
}
function metric(label, value, icon, foot, color = '') {
  return `<article class="metric-card"><span class="metric-top"><span>${esc(label)}</span><i>${icon}</i></span><div class="metric-value ${color}">${value}</div><span class="metric-foot">${esc(foot)}</span></article>`;
}
function navMarkup() {
  return nav.map(([id, label]) => `<button class="nav-link ${view.page === id ? 'active' : ''}" data-nav="${id}"><span class="nav-icon">${icons[id]}</span><span>${label}</span>${id === 'market' && game.phase === 'bidding' ? '<em class="nav-dot"></em>' : ''}</button>`).join('');
}
function layout(content) {
  const me = studio(game, 'you');
  return `<div class="app-shell">
  <aside class="sidebar"><div class="brand"><div class="brand-symbol">✶</div><div><strong>HOLLYWOOD</strong><small>THE FANTASY BOX OFFICE</small></div></div>
    <div class="sidebar-kicker">YOUR DIRECTOR'S CHAIR</div><nav class="side-nav">${navMarkup()}</nav>
    <div class="sidebar-bottom"><div class="studio-identity"><div class="avatar">YS</div><div><strong>Your Studio</strong><small>Executive producer</small></div><span class="green-dot"></span></div>
    <button class="reset-link" data-action="reset">↻ Reset demo season</button></div>
  </aside>
  <div class="main-shell"><header class="topbar"><div class="breadcrumbs"><span>DEMO LEAGUE</span><b>/</b><strong>${esc(nav.find(n => n[0] === view.page)?.[1] || 'Studio HQ')}</strong></div>
    <div class="top-right"><span class="demo-tag">✶ SAMPLE DATA</span><span class="top-week">WEEK ${String(game.week).padStart(2,'0')} <i>/ 08</i></span><span class="top-cash">${amount(me.cash)}</span></div></header>
    <div class="content-shell"><main class="main-content">${content}</main><aside class="right-rail">${rightRail()}</aside></div>
  </div>
  <nav class="bottom-nav">${nav.slice(0,5).map(([id,label])=> `<button data-nav="${id}" class="${view.page===id?'selected':''}"><span>${icons[id]}</span><small>${id === 'production' ? 'Cast' : id === 'boxoffice' ? 'Scores' : id === 'overview' ? 'Home' : id === 'market' ? 'Market' : 'League'}</small></button>`).join('')}</nav>
  ${view.toast ? `<div class="toast ${view.toast.kind}" role="status"><span>${view.toast.kind === 'error' ? '!' : '✓'}</span>${esc(view.toast.message)}<button data-action="dismiss-toast" aria-label="Dismiss notice">×</button></div>` : ''}
  </div>`;
}
function weekDots() { return Array.from({length:8}, (_, index) => `<div class="week-dot ${index + 1 === game.week ? 'current' : index+1<game.week ? 'past' : ''} ${index >=6 ? 'finale' : ''}" title="Week ${index+1}"><span>${String(index + 1).padStart(2,'0')}</span></div>`).join(''); }
function rightRail() {
  const upcoming = FILMS.filter(f => f.week >= game.week && f.week <= game.week+1).slice(0,3);
  const leaders = standings(game);
  return `<div class="rail-section"><div class="rail-heading">THE SEASON <span>01—08</span></div><div class="season-dots">${weekDots()}</div><div class="rail-note">${game.week >= 7 ? 'The final two weeks decide the league by film profit, not cash.' : 'Weeks 07–08 are blockbuster rounds. Highest combined profit takes the crown.'}</div></div>
  <div class="rail-section"><div class="rail-heading">LEAGUE STANDINGS <button data-nav="league">VIEW ALL ↗</button></div>
    ${leaders.map((s,i)=> `<div class="rail-standing"><span class="standing-index">0${i+1}</span><span class="standing-avatar" style="--studio-color:${s.color}">${s.initials}</span><div><strong>${esc(s.name)}</strong><small>${game.week >= 7 && game.history.some(h => h.week>=7) ? 'Blockbuster profit' : 'Studio cash'}</small></div><b>${amount(game.week >= 7 && game.history.some(h => h.week>=7) ? s.blockbusterProfit : s.cash)}</b></div>`).join('')}
  </div>
  <div class="rail-section"><div class="rail-heading">UP NEXT <span>PREMIERES</span></div>
    ${upcoming.length ? upcoming.map(f=>`<div class="premiere-rail">${filmVisual(f,true)}<div><small>WEEK ${String(f.week).padStart(2,'0')} · ${esc(f.genre)}</small><strong>${esc(f.title)}</strong><span>Budget ${amount(f.budget,0)}</span></div></div>`).join('') : '<p class="small-muted">All releases are now in theaters.</p>'}
  </div>
  <div class="rail-footer"><span>✦</span><b>YOU CALL THE SHOTS.</b><small>Eight weeks. One champion.</small></div>`;
}
function sectionIntro(eyebrow, title, description, action = '') { return `<div class="section-intro"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div>${action}</div>`; }
function miniStudioStanding() {
  const ranks = standings(game);
  const best = Math.max(...ranks.map(s => game.week >= 7 && game.history.some(h => h.week>=7) ? Math.max(0,s.blockbusterProfit) : s.cash), 1);
  return `<div class="panel"><div class="panel-heading"><div><span class="eyebrow">THE COMPETITION</span><h2>League leaderboard</h2></div><button class="text-link" data-nav="league">Full standings ↗</button></div>
   <div class="leaderboard">${ranks.map((s, i) => { const m = game.week >= 7 && game.history.some(h => h.week>=7) ? s.blockbusterProfit : s.cash; return `<div class="leaderboard-row"><b class="number">${String(i+1).padStart(2,'0')}</b><div class="league-avatar" style="--studio-color:${s.color}">${s.initials}</div><div class="leaderboard-name"><strong>${esc(s.name)}</strong><div class="bar-bg"><span style="width:${Math.max(2,Math.max(0,m)/best*100)}%;background:${s.color}"></span></div></div><strong class="leaderboard-money">${amount(m)}</strong></div>`; }).join('')}</div></div>`;
}
function renderOverview() {
  const isBlockbuster = game.week >= 7;
  const me = studio(game, 'you');
  const weekly = game.history.find(h=>h.week===game.week);
  const projected = game.phase==='lineup' ? weeklyProduction(game,'you').gross : game.phase==='bidding' ? 0 : weekly?.cards.find(c=>c.studioId==='you')?.finalGross || 0;
  const portfolio = owned(game,'you').reduce((n,a)=>n+a.purchasePrice,0);
  const latest = game.history.at(-1);
  return `<section class="hero"><div class="hero-orbit orbit-one"></div><div class="hero-orbit orbit-two"></div><div class="hero-content"><div class="hero-tags">${pill('SEASON 01','outlined')} ${pill(premiereType(game.week), isBlockbuster ? 'highlight' : '')}</div>
    <div class="hero-number">WEEK ${String(game.week).padStart(2,'0')} <span>/ 08</span></div><h1>Make movies.<br/><em>Make millions.</em></h1><p>Build your dream studio. Outbid your rivals. Own the weekend box office.</p><div class="hero-actions">${primaryAction()}<button class="btn btn-outline" data-nav="rules">Learn the game ↗</button></div></div>
    <div class="hero-seal"><span>★</span><strong>HOLLYWOOD</strong><small>PRODUCER'S CLUB</small></div></section>
    <div class="notice-strip"><span class="notice-light"></span><div><strong>${status()}</strong><small>${phaseHelp()}</small></div><span>0${game.week} / 08</span></div>
    <div class="stats-grid">${metric('AVAILABLE CASH',amount(me.cash),'$', 'Your studio bank balance')}${metric('TALENT OWNED',String(owned(game,'you').length).padStart(2,'0'),'✧',`${amount(portfolio)} invested in talent`)}${metric('THIS WEEK GROSS',amount(projected),'↗',game.phase==='lineup'?'Before marketing and bonuses':game.phase==='results'?'Official weekend results':'Cast your lineup to project a gross')}${metric('BLOCKBUSTER PROFIT',amount(me.blockbusterProfit),'♛','Only weeks 07–08 count for the title','gold-text')}</div>
    <div class="dashboard-grid"><div class="dashboard-main">${lineupPanel(true)}${latest ? resultTeaser(latest) : marketTeaser()}</div><div class="dashboard-side">${miniStudioStanding()}${activityPanel()}</div></div>`;
}
function lineupPanel(compact) {
  const lineup = game.lineups.you || {};
  const emptyCount = missingSlots(game).length;
  return `<div class="panel production-panel"><div class="panel-heading"><div><span class="eyebrow">YOUR NEXT PICTURE</span><h2>Production lineup</h2></div>${pill(game.phase==='bidding'?'AUCTION STAGE':game.phase==='lineup'?'CASTING STAGE':game.phase==='finished'?'FINAL CUT':'LOCKED',game.phase==='lineup'?'soft-gold':'')}</div>
   <div class="cast-grid">${SLOTS.map((s,i) => { const id = lineup[s], t = id && byTalentId[id], f = t && byFilmId[t.roles[0].filmId]; return `<div class="cast-slot ${id?'filled':''}"><div class="cast-icon">${['▣','★','✦','✦','◈'][i]}</div><div class="cast-caption">${esc(SLOT_LABELS[s])}</div>${t?`<strong>${esc(t.name)}</strong><span class="cast-film">${esc(f?.title || '')}</span>`:`<strong>${s==='title'?'Greenlight me':s==='director'?'Hire me':'Cast me'}</strong><span class="cast-film">Unfilled position</span>`}</div>`; }).join('')}</div>
   <div class="panel-bottom"><div><strong>${emptyCount?`${emptyCount} open ${emptyCount===1?'slot':'slots'}`:'All five slots filled'}</strong><span>${game.phase==='bidding'?'Acquire talent to build your next production':game.phase==='lineup'?'You can change your cast until the film locks':'Lineups reset for each premiere week'}</span></div><button class="btn btn-dark" data-nav="${game.phase==='bidding'?'market':'production'}">${game.phase==='bidding'?'Browse talent':'Manage lineup'} →</button></div></div>`;
}
function resultTeaser(result) {
  const you = result.cards.find(x => x.studioId==='you');
  return `<div class="panel"><div class="panel-heading"><div><span class="eyebrow">BOX OFFICE REPORT · WEEK ${String(result.week).padStart(2,'0')}</span><h2>Your latest opening</h2></div><button class="text-link" data-nav="boxoffice">View report ↗</button></div>
   <div class="result-feature"><div><small>WEEKEND GROSS</small><strong>${amount(you.finalGross)}</strong></div><div><small>FILM PROFIT</small><strong class="${you.profit>=0?'positive':'negative'}">${amount(you.profit)}</strong></div><div><small>PRODUCTION BUDGET</small><strong>${amount(you.budget)}</strong></div></div></div>`;
}
function marketTeaser() {
  const movies = FILMS.filter(f=>f.week===game.week).slice(0,2);
  return `<div class="panel"><div class="panel-heading"><div><span class="eyebrow">THE MARQUEE</span><h2>In theaters this week</h2></div><button class="text-link" data-nav="market">See the market ↗</button></div>
   <div class="feature-film-grid">${movies.map(f=>`<div class="feature-film">${filmVisual(f)}<div class="feature-film-details"><span>${esc(f.genre)} · ${amount(f.budget,0)} BUDGET</span><strong>${esc(f.title)}</strong></div></div>`).join('')}</div></div>`;
}
function activityPanel() {
  const events = game.journal.slice(0,5);
  return `<div class="panel"><div class="panel-heading"><div><span class="eyebrow">ON THE LOT</span><h2>Studio wire</h2></div></div><div class="activity-feed">${events.length?events.map(e=>`<div class="activity"><div class="activity-dot ${e.type}"></div><div><span>WEEK ${String(e.week).padStart(2,'0')}</span><p>${esc(e.text)}</p></div></div>`).join(''):'<p class="small-muted">Your career begins here. Make your first bid to fill the studio wire.</p>'}</div></div>`;
}
function renderMarket() {
  const bidding = game.phase==='bidding';
  const signing = game.phase==='lineup';
  const lots = bidding ? game.auctions.map(a=>({talent:byTalentId[a.talentId],a})) : signing ? freeAgents(game).map(t=>({talent:t})) : [];
  const categories=['all','title','lead','support','director'];
  return `${sectionIntro('THE OPEN MARKET', 'Talent is everything.', bidding?'Take your shot at the next blockbuster. Every bid makes the studio world a little more dangerous.':signing?'The auction is closed. Sign unclaimed talent at the listed free-agent price before premiere night.':'The talent market reopens when the next week begins.', game.phase==='bidding'||game.phase==='lineup'?primaryAction():'')}
    <div class="notice-strip light"><span class="notice-light"></span><div><strong>${bidding?'LIVE OPEN BIDS':signing?'FREE-AGENT WINDOW':'MARKET CLOSED'}</strong><small>${bidding?'Opening bids reflect the original production-budget formulas. Rival studios may already hold high bids.':signing?'Free-agent deals are immediate and do not need an auction.':'View rival holdings and trading possibilities below.'}</small></div><span>${lots.length} LOTS</span></div>
    <div class="market-tools"><div class="filters">${categories.map(c=>`<button class="filter-btn ${view.filter===c?'selected':''}" data-filter="${c}">${c==='all'?'All talent':roleLabels[c]}</button>`).join('')}</div><label class="search-box"><span>⌕</span><input id="search-talent" placeholder="Search talent or movies..." type="search" value="${esc(view.search)}" /></label></div>
    ${lots.length?`<div class="market-list">${lots.filter(({talent:t})=> view.filter==='all'||t.primaryRole===view.filter).filter(({talent:t})=>!view.search||`${t.name} ${t.roles.map(r=>byFilmId[r.filmId].title).join(' ')}`.toLowerCase().includes(view.search.toLowerCase())).sort((a,b)=>a.talent.firstWeek-b.talent.firstWeek||a.talent.reserve-b.talent.reserve).map(({talent:t,a})=>talentRow(t,a)).join('')}</div>`:empty('No open lots this phase.','You can still see the studio holdings and rulebook.')}
    ${signing?'<p class="disclaimer-inline">Free agents can be signed only before you lock the lineup. A signing is permanent unless you trade the asset.</p>':''}
    ${tradesPanel()}`;
}
function talentRow(t,a) {
  const film=byFilmId[t.roles[0].filmId];
  const price = a ? a.highBid : effectiveAsk(t,game.week);
  const lead = a?.highBidder && studio(game,a.highBidder);
  const selfHigh = a?.highBidder==='you';
  return `<article class="talent-row" data-filter-card="${esc(`${t.name} ${t.roles.map(r=>byFilmId[r.filmId].title).join(' ')}`.toLowerCase())}">
    <div class="talent-portrait" style="--a:${film.colors[0]};--b:${film.colors[1]}">${t.primaryRole==='title'?'▣':t.primaryRole==='lead'?'★':t.primaryRole==='director'?'◈':'✦'}</div>
    <div class="talent-info"><div class="talent-badges">${pill(roleName(t.primaryRole),t.primaryRole)} ${t.roles.length>1?pill(`${t.roles.length} FILMS`,'multirole'):''}</div><h3>${esc(t.name)}</h3><p>W${String(t.firstWeek).padStart(2,'0')} · ${esc(t.roles.slice(0,2).map(r=>byFilmId[r.filmId].title).join(' · '))}${t.roles.length>2?' · + more':''}</p></div>
    <div class="talent-price"><small>${a?'CURRENT BID':'ASKING PRICE'}</small><strong>${amount(price)}</strong><span>${a ? lead?`${esc(lead.name)} leading`:'No bids yet' : `Opens W${String(t.firstWeek).padStart(2,'0')}`}</span></div>
    ${a?`<button class="btn ${selfHigh?'btn-disabled':'btn-gold'}" ${selfHigh?'disabled':''} data-action="bid" data-id="${t.id}" title="Available cash: ${amount(bidAvailable(game,'you',selfHigh?t.id:null))}">${selfHigh?'High bid ✓':`Bid ${amount(price+bidStep(price))} →`}</button>`:`<button class="btn btn-gold" data-action="sign" data-id="${t.id}">Sign ${amount(price)} →</button>`}
   </article>`;
}
function tradesPanel() {
  if (game.phase!=='lineup') return `<div class="section-divider"><span>STUDIO OWNERSHIP</span></div><div class="trade-info">Once auctions close, you can trade purchased talent with rival studios. All talent is an asset, and every applicable film role is included.</div>`;
  const mine=owned(game,'you').slice(0,8), rivals=game.holdings.filter(h=>h.ownerId!=='you').slice(0,8);
  return `<div class="section-divider"><span>THE TRADING FLOOR</span></div><div class="trade-columns"><section class="panel"><div class="panel-heading"><div><span class="eyebrow">YOUR ASSETS</span><h2>Offer to rivals</h2></div></div>
    ${mine.length?mine.map(h=>tradeRow(h,'sell')).join(''):empty('No assets yet','Bid or sign free agents first.')}</section><section class="panel"><div class="panel-heading"><div><span class="eyebrow">RIVAL HOLDINGS</span><h2>Acquire a star</h2></div></div>
    ${rivals.length?rivals.map(h=>tradeRow(h,'buy')).join(''):empty('No rival assets yet','Check after the first auction.')}</section></div>`;
}
function tradeRow(h,direction) {
  const t=byTalentId[h.talentId];
  const starting=direction==='buy'?Math.ceil(Math.max(h.purchasePrice,effectiveAsk(t,game.week))*1.1*10)/10:Math.ceil(h.purchasePrice*10)/10;
  return `<div class="trade-row"><div><strong>${esc(t.name)}</strong><small>${roleName(t.primaryRole)} · ${direction==='buy'?esc(studio(game,h.ownerId).name):'Your roster'}</small>${direction==='sell'?`<select class="trade-buyer" id="buyer-${t.id}" aria-label="Choose buyer for ${esc(t.name)}">${game.studios.filter(s=>s.id!=='you').map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>`:''}</div><label><span>$M</span><input type="number" min="0.1" step="0.1" id="trade-${t.id}" value="${starting.toFixed(1)}" aria-label="Trade offer in millions" /></label><button class="btn btn-tiny" data-action="trade" data-direction="${direction}" data-id="${t.id}" data-other="${direction==='buy'?h.ownerId:'nova'}">${direction==='buy'?'Offer':'Sell'}</button></div>`;
}
function lineUpEditor() {
  const labels={title:'01',lead:'02',support1:'03',support2:'04',director:'05'};
  return `<div class="panel"><div class="panel-heading"><div><span class="eyebrow">YOUR FIVE TALENT SLOTS</span><h2>Casting sheet</h2></div>${game.phase==='lineup'?`<button class="btn btn-dark" data-action="auto-cast">✦ Auto cast</button>`:''}</div>
   <div class="lineup-editor">${SLOTS.map(slot=>{
    const who=game.lineups.you?.[slot]||'';
    const eligible=owned(game,'you').map(h=>byTalentId[h.talentId]).filter(t=>t.primaryRole===(slot.startsWith('support')?'support':slot));
    return `<div class="editor-row"><div class="editor-num">${labels[slot]}</div><div class="editor-title"><strong>${esc(SLOT_LABELS[slot])}</strong><small>${slot==='title'?'100% of movie gross':slot==='lead'?'75% of movie gross':slot.startsWith('support')?'40% × critic score': 'Per-screen average × 1,000'}</small></div>
      <div class="editor-control">${game.phase==='lineup'?`<select data-slot="${slot}" aria-label="Choose ${SLOT_LABELS[slot]}"><option value="">${eligible.length?'Choose talent…':'No eligible talent owned'}</option>${eligible.map(t=>`<option value="${t.id}" ${who===t.id?'selected':''}>${esc(t.name)} · ${amount(projectedScore(t,game.week))} est.</option>`).join('')}</select>`:`<strong>${esc(byTalentId[who]?.name || '— Not cast —')}</strong>`}</div></div>`;
   }).join('')}</div><div class="panel-bottom"><div><strong>${missingSlots(game).length?'Your production is not complete':'Ready for the premiere'}</strong><span>${missingSlots(game).length? 'All five positions are required before scoring.':'You can lock this lineup and score the weekend.'}</span></div>${game.phase==='lineup'?'<button class="btn btn-gold" data-action="primary">Lock & score →</button>':'<button class="btn btn-dark" data-nav="market">Acquire talent →</button>'}</div></div>`;
}
function campaignPanel() {
  const ads=game.campaigns.you.ads;
  const reviews=game.campaigns.you.attacks.length;
  return `<div class="campaign-grid"><section class="panel campaign-panel"><div class="campaign-icon">◈</div><span class="eyebrow">PROTECT YOUR RELEASE</span><h2>Ad support</h2><p>Every $1M protects 5% of your weekend gross against negative campaigns. Max 100%.</p>
    <div class="campaign-level"><strong>${ads*5}%</strong><span>PROTECTED</span></div><div class="bar-bg gold-bar"><span style="width:${ads*5}%"></span></div><button class="btn btn-dark full-width" data-action="ad" ${game.phase!=='lineup'||ads>=20?'disabled':''}>Buy 5% protection · $1M →</button></section>
    <section class="panel campaign-panel"><div class="campaign-icon bad">✦</div><span class="eyebrow">PLAY HARD BALL</span><h2>Bad reviews</h2><p>Spend $1.5M to cut an opponent's gross by 5% before their ad protection. Anonymous, naturally.</p>
    <div class="form-line"><label>Target studio<select id="review-target" ${game.phase!=='lineup'?'disabled':''}>${game.studios.filter(s=>s.id!=='you').map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label></div>
    <div class="form-line"><label>Optional story<input id="review-story" maxlength="280" placeholder="An unnamed source says…" ${game.phase!=='lineup'?'disabled':''}/></label></div><button class="btn btn-dark full-width" data-action="bad-review" ${game.phase!=='lineup'?'disabled':''}>Place anonymous review · $1.5M →</button><small>${reviews} reviews purchased this week</small></section></div>`;
}
function coproductionPanel() {
  const deals = game.deals.filter(d=>d.week===game.week);
  return `<div class="panel"><div class="panel-heading"><div><span class="eyebrow">SPLIT THE DEAL</span><h2>Co-productions</h2></div>${pill('WEEKLY CONTRACT','outlined')}</div>
   <p class="panel-blurb">Buy or sell a percentage of a studio's adjusted weekend gross for cash upfront. The settlement happens when the box office closes.</p>
   <div class="deal-grid"><label>Other producer<select id="deal-studio"><option value="nova">Nova Pictures</option><option value="silver">Silverline Films</option><option value="monarch">Monarch Studios</option></select></label><label>Stake<select id="deal-percent"><option value="5">5%</option><option value="10" selected>10%</option><option value="15">15%</option><option value="20">20%</option><option value="25">25%</option><option value="30">30%</option><option value="40">40%</option><option value="50">50%</option></select></label><label>Upfront price ($M)<input id="deal-price" type="number" min="0.1" step="0.1" value="2.0" /></label></div>
   <div class="deal-actions"><button class="btn btn-gold" data-action="deal" data-direction="sell" ${game.phase!=='lineup'?'disabled':''}>Sell a stake →</button><button class="btn btn-dark" data-action="deal" data-direction="buy" ${game.phase!=='lineup'?'disabled':''}>Buy a stake →</button></div>
   ${deals.length?`<div class="deal-records">${deals.map(d=>`<div><span>${esc(studio(game,d.buyerId).name)} purchased ${d.percent}% of ${esc(studio(game,d.sellerId).name)}</span><b>${amount(d.price)}</b></div>`).join('')}</div>`:'<p class="small-muted">No co-production contracts signed for this week.</p>'}</div>`;
}
function renderProduction() {
  const ready=game.phase==='lineup';
  return `${sectionIntro('STUDIO LOT / CASTING', 'Make your next hit.', ready?'Every slot matters. A talent appearing in multiple movies pays off across all their applicable roles.':'Your roster is locked until this weekend ends or the next market opens.',ready?primaryAction():'')}
    <div class="notice-strip light"><span class="notice-light"></span><div><strong>${status()}</strong><small>${phaseHelp()}</small></div><span>FIVE SLOTS</span></div>
    ${lineUpEditor()}
    <div class="production-summary"><div><span>ESTIMATED LINEUP GROSS</span><strong>${amount(projectedStudioGross(game,'you'))}</strong></div><div><span>WEEKLY PRODUCTION BUDGET</span><strong>${amount(game.phase==='bidding'?0:weeklyProduction(game,'you').budget)}</strong></div><div><span>STUDIO CASH</span><strong>${amount(studio(game,'you').cash)}</strong></div></div>
    <div class="section-divider"><span>PRODUCER'S TOOLS</span></div>${campaignPanel()}${coproductionPanel()}`;
}
function renderBoxOffice() {
  const recent=game.history.at(-1);
  const shown=recent?.week||game.week;
  const ranked=recent?.rankings || [];
  return `${sectionIntro('THE WEEKEND REPORT', 'The numbers are in.', 'Every dollar counts. Weekend box office results determine your lineup gross; profit decides blockbuster week winners.',game.phase==='results'?primaryAction():'')}
    <div class="notice-strip light"><span class="notice-light"></span><div><strong>${recent?`WEEK ${String(shown).padStart(2,'0')} OFFICIAL RESULTS`:'AWAITING PREMIERE NIGHT'}</strong><small>${recent?'The fictional demo results are posted below.':'No week has been scored yet. Finish your auction and lock your cast to see results.'}</small></div><span>DOMESTIC</span></div>
    ${recent?`<div class="result-banner"><span>YOUR STUDIO · WEEK ${String(recent.week).padStart(2,'0')}</span><div><strong>${amount(recent.cards.find(c=>c.studioId==='you').finalGross)}</strong><small>WEEKEND GROSS</small></div><div><strong>${amount(recent.cards.find(c=>c.studioId==='you').profit)}</strong><small>FILM PROFIT</small></div></div>
    <div class="panel"><div class="panel-heading"><div><span class="eyebrow">THE PRODUCER RACE</span><h2>Weekend studio scores</h2></div>${pill(recent.week>=7?'PROFIT ROUND':'GROSS ROUND','soft-gold')}</div>
    <div class="table-scroller"><table class="data-table"><thead><tr><th>PRODUCER</th><th>FILM GROSS</th><th>BUDGET</th><th>PROFIT</th><th>BONUSES</th></tr></thead><tbody>${[...recent.cards].sort((a,b)=>recent.week>=7?b.profit-a.profit:b.finalGross-a.finalGross).map((c,i)=>`<tr class="${c.studioId==='you'?'you-row':''}"><td><span class="rank-cell">0${i+1}</span><strong>${esc(studio(game,c.studioId).name)}</strong></td><td>${amount(c.finalGross)}</td><td>${amount(c.budget)}</td><td class="${c.profit>=0?'positive':'negative'}">${amount(c.profit)}</td><td>${amount(c.bonus)}</td></tr>`).join('')}</tbody></table></div></div>`:empty('No results yet','Start by bidding on talent in the market, then cast your production.')}
    ${recent?`<div class="panel"><div class="panel-heading"><div><span class="eyebrow">THE OFFICIAL CHART</span><h2>Domestic weekend box office</h2></div>${pill('DEMO FIXTURES','outlined')}</div>
    <div class="table-scroller"><table class="data-table movie-table"><thead><tr><th>RANK</th><th>TITLE</th><th>WEEKEND</th><th>THEATERS</th><th>PER SCREEN</th><th>CRITICS</th></tr></thead><tbody>${ranked.map(m=>{const f=byFilmId[m.filmId];return `<tr><td><span class="rank-cell">${String(m.rank).padStart(2,'0')}</span></td><td><strong>${esc(f.title)}</strong><small>${esc(f.genre)} · W${String(f.week).padStart(2,'0')} debut</small></td><td>${amount(m.gross)}</td><td>${Number(m.screens).toLocaleString()}</td><td>$${Math.round(m.gross*1000000/m.screens).toLocaleString()}</td><td>${f.rt}%</td></tr>`;}).join('')}</tbody></table></div></div>`:''}
    <p class="disclaimer-inline">All films, grosses, budgets, theater counts, critic scores, cast, and director credits are fictional fixtures. These results are not real domestic box-office figures.</p>`;
}
function renderLeague() {
  const ranking=standings(game);
  const winner=game.phase==='finished'?ranking[0]:null;
  return `${sectionIntro('THE PRODUCERS CLUB', 'Only one can rule.', 'Four rival studios. Eight release weekends. Build wealth in the regular season, then win with profit in the two blockbuster weeks.')}
   ${winner?`<div class="champion-banner"><span>★  SEASON 01 CHAMPION  ★</span><h2>${esc(winner.name)}</h2><p>Combined blockbuster profit: ${amount(winner.blockbusterProfit)}</p></div>`:''}
   <div class="panel"><div class="panel-heading"><div><span class="eyebrow">LIVE LEAGUE TABLE</span><h2>${game.week>=7 && game.history.some(h=>h.week>=7)?'Blockbuster profit standings':'Studio bank standings'}</h2></div>${pill(`WEEK ${String(game.week).padStart(2,'0')}`,'outlined')}</div>
   ${ranking.map((s,i)=>`<div class="league-detail ${s.id==='you'?'your-studio':''}"><div class="league-rank">${String(i+1).padStart(2,'0')}</div><div class="league-avatar" style="--studio-color:${s.color}">${s.initials}</div><div class="league-detail-info"><strong>${esc(s.name)} ${s.id==='you'?pill('YOU','soft-gold'):''}</strong><small>Executive producer: ${esc(s.owner)}</small></div><div class="league-detail-stats"><div><span>CASH</span><strong>${amount(s.cash)}</strong></div><div><span>ASSETS</span><strong>${owned(game,s.id).length}</strong></div><div><span>BLOCKBUSTER PROFIT</span><strong>${amount(s.blockbusterProfit)}</strong></div></div></div>`).join('')}</div>
   <div class="panel"><div class="panel-heading"><div><span class="eyebrow">FROM OPENING NIGHT TO FINALE</span><h2>Season scoreboard</h2></div></div>
   ${game.history.length?`<div class="table-scroller"><table class="data-table"><thead><tr><th>WEEK</th>${game.studios.map(s=>`<th>${esc(s.name)}</th>`).join('')}</tr></thead><tbody>${game.history.map(h=>`<tr><td><strong>${h.week>=7?'★ ':''}W${String(h.week).padStart(2,'0')}</strong></td>${game.studios.map(s=>{const c=h.cards.find(c=>c.studioId===s.id);return `<td>${amount(h.week>=7?c.profit:c.finalGross)}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`:empty('Your story is yet to be written.','Premiere your first film to populate the scoreboard.')}</div>
   <p class="disclaimer-inline">Regular-season rankings show studio cash. In weeks 7 and 8, the champion is the studio with the highest combined film profit (adjusted gross minus the declining production budget).</p>`;
}
function ruleCard(icon,title,formula,detail) { return `<div class="rule-card"><span class="rule-icon">${icon}</span><h3>${title}</h3><strong>${formula}</strong><p>${detail}</p></div>`; }
function renderRules() {
  return `${sectionIntro('THE RULEBOOK', 'Welcome to Hollywood.', 'You are a big-budget movie producer. Build a cast, battle other producers, and turn a $50M opening bank into a studio empire.')}
   <div class="rule-feature"><span class="eyebrow">THE PRODUCTION</span><h2>Five slots. Every weekend.</h2><p>Fill one movie title, one lead actor, two supporting actors, and one director. In this demo, all talent becomes available when their films enter the auction window. Each acquired asset can score for every applicable film and role, but must occupy its highest eligible lineup category.</p><div class="rule-slot-row"><span>1 TITLE</span><span>1 LEAD</span><span>2 SUPPORTING</span><span>1 DIRECTOR</span></div></div>
   <div class="section-divider"><span>HOW YOU SCORE</span></div><div class="rules-grid">
    ${ruleCard('▣','Movie title','100% × weekend gross','Big opening weekends make a title valuable — but high production budgets also drive the auction price.')}
    ${ruleCard('★','Lead actor','75% × weekend gross','Star power earns a large share of each applicable movie’s weekend domestic gross.')}
    ${ruleCard('✦','Supporting actor','40% × gross × critic score','Critic score is a fraction. A movie with an 80% review score earns 40% × 0.80 × gross.')}
    ${ruleCard('◈','Director','Per-screen average × 1,000','Theater average is weekend gross divided by theater count. Zero screens means zero director points.')}
   </div>
   <div class="section-divider"><span>THE BUSINESS</span></div><div class="rules-grid">
    ${ruleCard('$','Opening bank','$50 million','Spend strategically. Winning auction bids are paid immediately, and your earned weekend score is credited to cash.')}
    ${ruleCard('↗','Opening bids','Film budget–based','Title = 1/5 budget. Lead = (last three films’ domestic gross ÷ budget) × (new budget × .3) ÷ 4. Supporting = 1/10 budget. Director = $500K.')}
    ${ruleCard('✂','Bad reviews','$1.5M for −5%','Each anonymous bad review deducts 5% from a rival’s weekly film score, up to a 100% gross reduction.')}
    ${ruleCard('◉','Ad support','$1M for +5% protection','Each ad-support unit cancels one 5% bad-review unit. Protection cannot exceed 100%.')}
    ${ruleCard('⇄','Co-production','Cash ↔ share of gross','Negotiate a percent of a producer’s weekly gross for a fixed cash payment. The sold stake is settled after marketing effects.')}
    ${ruleCard('✧','Loyalty bonuses','5 weeks +$5M / 10 +$10M','Each owned talent earns a $5M bonus if their film remains top five for five consecutive weeks, and $10M if top ten for ten. Payable only at milestones.')}
    ${ruleCard('⌛','Declining budgets','50% less each week','For the blockbuster profit calculation, a purchased talent’s budget halves every week after each movie opens and reaches zero five weeks after opening.')}
    ${ruleCard('♛','The championship','Weeks 7–8 total profit','Blockbuster season decides the champion. Add your profits from weeks seven and eight; highest total wins. Cash serves as the tiebreaker.')}
   </div>
   <div class="panel data-disclosure"><span class="eyebrow">ABOUT THIS PROTOTYPE</span><h2>Real rules. Sample movies.</h2><p>This version is a single-browser demo against three computer-controlled producer studios. The film catalog and financial outcomes are invented for testing. Game data saves on this device. No real account, shared league, public auctions, or real box-office feed is connected yet.</p><p>Before launching a real-money-data version, the production site needs a licensed weekend domestic box-office feed, confirmed credits and budget data, rights to use critic scores, a central database, and authenticated multiplayer auctions. This demo never scrapes movie websites.</p><button class="btn btn-dark" data-nav="overview">Back to studio HQ →</button></div>`;
}
function render() {
  const body = ({overview:renderOverview,market:renderMarket,production:renderProduction,boxoffice:renderBoxOffice,league:renderLeague,rules:renderRules}[view.page] || renderOverview)();
  app.innerHTML = layout(body);
  document.title=`Hollywood · ${nav.find(n=>n[0]===view.page)?.[1] || 'Studio HQ'}`;
}
function getInput(id) { return document.getElementById(id)?.value; }
function routeAction(action, node) {
  if (action==='dismiss-toast') { view.toast=null; render(); return; }
  if (action==='reset') { if (window.confirm('Reset the entire fictional league and start over? This erases your local demo progress.')) { mutation(g=>restart(g)); view.page='overview'; } return; }
  if (action==='primary') {
    if (game.phase==='bidding') mutation(closeBidding);
    else if (game.phase==='lineup') { mutation(scoreWeekend); if(game.phase==='results') { view.page='boxoffice'; render(); } }
    else if (game.phase==='results') { mutation(nextWeek); view.page=game.phase==='finished'?'league':'overview'; render(); }
    return;
  }
  if (action==='bid') { mutation(g=>placeBid(g,node.dataset.id)); return; }
  if (action==='sign') { mutation(g=>signFreeAgent(g,node.dataset.id)); return; }
  if (action==='auto-cast') { mutation(g=>autoCast(g)); return; }
  if (action==='ad') { mutation(buyAdSupport); return; }
  if (action==='bad-review') { mutation(g=>buyBadReview(g,getInput('review-target'),getInput('review-story'))); return; }
  if (action==='deal') { mutation(g=>offerCoProduction(g,getInput('deal-studio'),node.dataset.direction,Number(getInput('deal-percent')),Number(getInput('deal-price')))); return; }
  if (action==='trade') { mutation(g=>tradeTalent(g,node.dataset.id,node.dataset.direction,node.dataset.direction==='sell'?getInput(`buyer-${node.dataset.id}`):node.dataset.other,Number(getInput(`trade-${node.dataset.id}`)))); return; }
}
app.addEventListener('click', event=>{
  const link=event.target.closest('[data-nav]');
  if (link) { view.page=link.dataset.nav; view.filter='all'; view.search=''; view.toast=null; render(); window.scrollTo({top:0,behavior:'smooth'}); return; }
  const filter=event.target.closest('[data-filter]');
  if (filter) { view.filter=filter.dataset.filter; render(); return; }
  const btn=event.target.closest('[data-action]');
  if (btn && !btn.disabled) routeAction(btn.dataset.action,btn);
});
app.addEventListener('change', event=>{
  const slot=event.target.closest('[data-slot]');
  if (slot) mutation(g=>setLineup(g,slot.dataset.slot,slot.value));
});
app.addEventListener('input',event=>{
  if (event.target.id==='search-talent') {
    view.search=event.target.value;
    const phrase=view.search.toLowerCase();
    for (const card of app.querySelectorAll('[data-filter-card]')) card.hidden=!card.dataset.filterCard.includes(phrase);
  }
});
render();
