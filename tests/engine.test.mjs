import test from 'node:test';
import assert from 'node:assert/strict';
import { FILMS, TALENT, byTalentId, byFilmId, LEAD_HISTORY } from '../src/data.js';
import { createGame, placeBid, closeBidding, freeAgents, signFreeAgent, setLineup, autoCast,
  missingSlots, scoreTalent, scoreWeekend, nextWeek, asset, owned, budgetForAsset, filmRankings,
  effectiveAsk, bidAvailable, buyAdSupport, buyBadReview, offerCoProduction, tradeTalent,
  standings, weekendFilmStats } from '../src/engine.js';

function approximate(a,b,tolerance=.00015) { assert.ok(Math.abs(a-b)<=tolerance, `Expected ${a} to be within ${tolerance} of ${b}`); }
function freshLineup() {
  const game = createGame();
  closeBidding(game);
  // Acquire affordable talent for every required category. These are all unclaimed in this fixture.
  for (const role of ['title','lead','support','support','director']) {
    const eligible = freeAgents(game,role).sort((a,b)=>effectiveAsk(a,game.week)-effectiveAsk(b,game.week));
    assert.ok(eligible.length, `Expected available ${role}`);
    signFreeAgent(game,eligible[0].id);
  }
  autoCast(game);
  assert.equal(missingSlots(game).length,0);
  return game;
}

test('fixture market starts with 4 studios, 50M cash, opening-week and following-week releases', () => {
  const g=createGame();
  assert.equal(g.studios.length,4);
  assert.ok(g.studios.every(s=>s.cash===50));
  assert.equal(g.week,1);assert.equal(g.phase,'bidding');
  assert.ok(g.auctions.every(a=>byTalentId[a.talentId].firstWeek<=2));
  assert.ok(!g.auctions.some(a=>byTalentId[a.talentId].firstWeek>=3));
});

test('title / lead / support / director formulas follow the supplied rules', () => {
  const eclipse=byFilmId.eclipse;
  const title=byTalentId['title-eclipse'];
  const lead=byTalentId['p-mara-voss'];
  const support=byTalentId['p-theo-grant'];
  const director=byTalentId['p-leah-monroe'];
  approximate(scoreTalent(title,1),31);
  approximate(scoreTalent(lead,1),31*.75);
  approximate(scoreTalent(support,1),31*.4*.81);
  approximate(scoreTalent(director,1),31*1000/3650);
  assert.ok(lead.roles.some(r=>r.filmId==='summer'&&r.role==='support'));
  assert.equal(lead.primaryRole,'lead');
  assert.ok(lead.reserve>lead.roles[0].reserve);
  assert.ok(TALENT.every(t=>t.reserve>=.5));
});

test('one asset scores across all applicable films and pays all role opening fees',()=>{
  const t=byTalentId['p-mara-voss'];
  approximate(scoreTalent(t,3),8.8*.75+15.2*.4*.88);
  approximate(t.reserve,t.roles.reduce((n,r)=>n+r.reserve,0));
});

test('market bids reserve available cash and transfer property after auction closes',()=>{
  const g=createGame();
  const choice=g.auctions.find(a=>!a.highBidder&&a.highBid<15);
  assert.ok(choice);
  const cash=g.studios[0].cash;
  placeBid(g,choice.talentId);
  assert.equal(g.auctions.find(a=>a.talentId===choice.talentId).highBidder,'you');
  assert.ok(bidAvailable(g,'you')<50);
  assert.throws(()=>placeBid(g,choice.talentId),/already have the high bid/);
  closeBidding(g);
  assert.equal(asset(g,choice.talentId).ownerId,'you');
  approximate(g.studios[0].cash,cash-asset(g,choice.talentId).purchasePrice);
  assert.equal(g.phase,'lineup');
});

test('a full cast can score, save a result, and advance into the next auction',()=>{
  const g=freshLineup();
  const cash=g.studios[0].cash;
  scoreWeekend(g);
  assert.equal(g.phase,'results');
  assert.equal(g.history.length,1);
  assert.equal(g.history[0].cards.length,4);
  assert.ok(g.studios[0].cash>=cash);
  assert.equal(g.history[0].rankings[0].filmId,'eclipse');
  nextWeek(g);
  assert.equal(g.week,2);assert.equal(g.phase,'bidding');
  assert.ok(g.auctions.some(a=>byTalentId[a.talentId].firstWeek===3));
  assert.equal(missingSlots(g).length,5);
});

test('a lead cannot be cast as supporting, and the same actor cannot occupy two slots',()=>{
  const g=freshLineup();
  const t=owned(g,'you').map(h=>byTalentId[h.talentId]).find(t=>t.primaryRole==='lead');
  assert.throws(()=>setLineup(g,'support1',t.id),/highest applicable/);
  const support=owned(g,'you').map(h=>byTalentId[h.talentId]).find(t=>t.primaryRole==='support');
  setLineup(g,'support2',support.id);
  assert.notEqual(g.lineups.you.support1,support.id);
});

test('weekly production budget halves after premiere and reaches zero at five weeks',()=>{
  const h={talentId:'title-eclipse',ownerId:'you',purchasePrice:10,purchasedWeek:1};
  approximate(budgetForAsset(h,1),10);
  approximate(budgetForAsset(h,2),5);
  approximate(budgetForAsset(h,3),2.5);
  approximate(budgetForAsset(h,5),.625);
  approximate(budgetForAsset(h,6),0);
});

test('marketing protection offsets attacks exactly once and caps damage',()=>{
  const baseline=freshLineup();
  const defended=structuredClone(baseline);
  const attacked=structuredClone(baseline);
  // Extra cash in tests, since these options are paid up front.
  for(const g of [defended,attacked]) g.studios[0].cash+=100;
  // Enemy attacks your studio (same engine data model as player attacks).
  defended.campaigns.nova.attacks.push({targetId:'you',story:''});
  attacked.campaigns.nova.attacks.push({targetId:'you',story:''});
  buyAdSupport(defended);
  scoreWeekend(defended);scoreWeekend(attacked);
  approximate(defended.history[0].cards[0].damage,0);
  approximate(attacked.history[0].cards[0].damage,5);
  const rival=freshLineup();
  rival.studios[0].cash+=100;
  buyBadReview(rival,'nova','Test anonymous story');
  assert.equal(rival.campaigns.you.attacks[0].targetId,'nova');
  assert.equal(rival.campaigns.you.attacks[0].story,'Test anonymous story');
});

test('coproduction settles percentages of the after-marketing score',()=>{
  const g=freshLineup();
  // Give the counterparty a lineup from its own purchases, not next-week fixtures.
  const alice=g.lineups.you;
  assert.ok(alice.title);
  g.studios.find(s=>s.id==='nova').cash+=200;
  offerCoProduction(g,'nova','sell',10,0.5);
  assert.equal(g.deals.length,1);
  const sellerCashBefore=g.studios[0].cash;
  scoreWeekend(g);
  const you=g.history[0].cards.find(c=>c.studioId==='you');
  const nova=g.history[0].cards.find(c=>c.studioId==='nova');
  approximate(you.dealDelta,-you.gross*.1);
  approximate(nova.dealDelta,you.gross*.1);
  approximate(g.studios[0].cash,sellerCashBefore+you.finalGross+you.bonus);
});

test('trade prices change the new owner cost basis and clear old lineups',()=>{
  const g=freshLineup();
  const holding=owned(g,'you')[0];
  const t=byTalentId[holding.talentId];
  const price=Math.max(0.1,Math.round(holding.purchasePrice*10)/10);
  tradeTalent(g,t.id,'sell','nova',price);
  assert.equal(asset(g,t.id).ownerId,'nova');
  assert.equal(asset(g,t.id).purchasePrice,price);
  assert.ok(Object.values(g.lineups.you).every(id=>id!==t.id));
});

test('season can complete eight weeks and rank champion by blockbuster profit',()=>{
  const g=freshLineup();
  for(let week=1;week<=8;week++){
    if(g.phase==='bidding')closeBidding(g);
    // Reuse owned players and sign missing categories for the user when possible.
    autoCast(g);
    for(const role of ['title','lead','support','support','director']){
      const count=Object.values(g.lineups.you).filter(id=>id&&byTalentId[id].primaryRole===role).length;
      if(count>=(role==='support'?2:1))continue;
      const extras=freeAgents(g,role).filter(t=>g.studios[0].cash>effectiveAsk(t,g.week))
        .sort((a,b)=>effectiveAsk(a,g.week)-effectiveAsk(b,g.week));
      if(extras.length){signFreeAgent(g,extras[0].id);autoCast(g);}
    }
    assert.equal(missingSlots(g).length,0,`Week ${week} missing lineup`);
    scoreWeekend(g);
    nextWeek(g);
  }
  assert.equal(g.phase,'finished');
  assert.equal(g.history.length,8);
  assert.equal(standings(g).length,4);
  const combined=g.history.slice(6).reduce((n,h)=>n+h.cards.find(c=>c.studioId==='you').profit,0);
  approximate(g.studios[0].blockbusterProfit,combined);
});
