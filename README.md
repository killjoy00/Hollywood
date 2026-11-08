# Hollywood — the fantasy box office

**You call the shots.** Build a movie production by acquiring a title, a lead actor, two supporting actors, and a director. Earn simulated domestic weekend grosses, trade talent, undermine rival studios, protect your slate with ads, and chase the biggest profit in weeks seven and eight.

## Current state

This repository contains a **working, mobile-friendly, single-browser demo** against three computer-controlled studios. It is **not** yet a public multiplayer game. It ships with 16 **fictional films**, invented stars, invented budgets, invented Rotten Tomatoes-style scores, and invented box-office results. Nothing is represented as current real-world movie data. All demo progress is saved in the browser's `localStorage` and can be reset from the UI.

No API keys, external services, paid infrastructure, database, or npm dependencies are required for the prototype.

## Play locally

Requires Node.js 20 or newer.

```sh
npm start
```

Visit <http://localhost:4173>. You can also deploy the site to any static web host. Root `index.html`, `styles.css`, and `src/*.js` use relative paths, so GitHub Pages works without a build step.

```sh
npm run check  # syntax checks + 11 game-engine tests
npm test
```

### Gameplay

1. **Market:** Start with $50M. Place incremental bids on upcoming releases (opening week and following week at season start), or sign unclaimed free agents after the auction closes. Simulated rival producers also bid.
2. **Cast:** Fill exactly one title, one lead, two supporting actors, and one director from your holdings. Multi-film/multi-role talent scores in *all* applicable films and categories, but can occupy only its highest applicable casting slot. All applicable salary components apply.
3. **Promote and negotiate:** Buy ad protection, place anonymous bad reviews on other studios, trade talent, or negotiate a weekly co-production stake with a simulated opponent.
4. **Reveal the weekend:** All four studios score their productions and receive their earnings. Study movie rankings and league standings.
5. **Repeat:** Over an eight-week season, build cash and adjust your roster. Weeks 7–8 are the championship: highest **combined film profit** (adjusted gross minus depreciating production budget) wins; cash is the tiebreaker.

### Scoring and prices

All amounts below are in USD, with internal values stored in *millions*.

| Talent | Weekly score | Starting asking price |
|---|---|---|
| Title | 100% × domestic weekend gross | 1/5 film production budget |
| Lead actor | 75% × domestic weekend gross | `(prior 3 films' domestic gross / prior 3 films' production budgets) × (current budget × 0.3) / 4` |
| Supporting actor | 40% × domestic weekend gross × critic score as decimal | 1/10 film production budget |
| Director | Domestic weekend gross ÷ screen count × 1,000 | $500,000 |

Winning prices are actual talent cost bases. A production's current budget is the sum of the cost of played talents, halved for each week after their films open, and zero once those films have been open five weeks. Bad reviews cost $1.5M for 5% lost gross (up to 100%); ad support costs $1M for 5% protection. Weekly co-productions transfer an agreed share of the seller's after-marketing score to the buyer in exchange for cash. Bonuses are $5M for a talent whose film stays top five for five weeks and $10M for top ten for ten weeks, paid at the milestones only.

The eight-week sample cannot reach a 10-week milestone. The 10-week rule is implemented in the scorer, but realizing that bonus needs future seasons to support carryover of eligible prior-season films/talent.

## Source layout

- `index.html`, `styles.css`, `favicon.svg`: static application shell and visual design.
- `src/app.js`: mobile/desktop UI, user actions, status, local save/reset.
- `src/data.js`: **fictional, clearly labeled** fixture releases, participants, actors, and roles.
- `src/engine.js`: independent game engine (bidding, ownership, budgets, casting, scoring, trading, marketing, co-production, league).
- `tests/engine.test.mjs`: deterministic test cases using the Node built-in test runner.
- `scripts/serve.mjs`: tiny local static server.

## Before this becomes a real multiplayer website

There are two separate jobs:

**1. Authoritative film data.** Obtain licensed or otherwise authorized feeds for actual domestic *weekend* grosses and theater counts, verified opening dates and credits, production budgets, and critic ratings. Production budgets and cast billing are inconsistently available, so keep an explicit admin review/override flow with provenance, correction history, and publication times. Do **not** silently replace missing figures with fabricated values or scrape restricted sites. Actual movie posters and actor headshots may also require appropriate licenses.

**2. Server-authoritative multiplayer.** Add account creation, private leagues (four to six producers), invite links, persistent finances, auction deadlines and tie rules, sealed/open bids decision, server-enforced weekly lineup locking, negotiated offers and acceptances, a result settlement ledger, historical corrections, notifications, a league commissioner/admin, and protected access to user data. Client-side demo code and `localStorage` are not safe authorities for competitive multiplayer.

The UI and scoring code are structured to separate fixture data from gameplay. Future phases can keep the interface while replacing the simulated local game with a server-based league API.

### Open product choices

- Does a studio win by **sum of weeks 7 and 8 profits** (demo default), or does each weekend crown an independent winner?
- Do signed talents and 10-week bonuses carry across eight-week seasons? (Required for the 10-week bonus to be payable.)
- Are auctions open ascending bids, sealed bids, or another format? What are deadline/tie/forfeit rules?
- Who approves co-productions and talent trades, and what happens if an opponent declines?
- How are missing budgets, RT scores, and delayed box-office adjustments handled? Which sources will be licensed?

## Deploy as a static preview

Because this is currently a client-only demo, it can run on **GitHub Pages** without deploying to Vercel or provisioning a database. After merging the PR, open repository **Settings → Pages**, set **Deploy from a branch**, select `main` and `/ (root)`, and save. In the deployed URL, all game data remains local to each visitor's browser. **Do not advertise this preview as a real shared league** until accounts, backend, and authoritative data have shipped.
