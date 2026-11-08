# Real movie data, simulated game results

## What is real today

The Hollywood holiday 2026 playable preview is an editorially reviewed set of 17 theatrical releases from November 6 through December 25, 2026. The titles, U.S. or North American release dates, and published cast/director credits in `src/releases.js` are taken from official studio, distributor, cinema listings and published film reference pages linked in each film record. Last checked November 7, 2026.

- Release scope: selected U.S./Canada wide or expanding-wide theatrical films, not all films globally, not a live feed and not guaranteed against later scheduling changes.
- `releaseDate` refers to the selected theatrical wide/expansion start. A midweek premiere counts in the following Friday-Sunday weekend for game week allocation.
- `lead` and `supporting` are **Hollywood game classifications** of real credited performers, not claims of official billing rank. Co-director pairs are grouped into a single auctionable directing team for the preview.
- No poster, portrait or copyrighted third-party image is included.
- Each film has a `sourceUrl` linked in the game. Preferred sources: publisher/distributor, then film-specific cinema/industry listings.

## What is still simulated

Until approved feeds are connected, **all** of these remain synthetic game-only figures: weekend domestic gross, screens/theaters, per-screen average, production budget, prior three-film economics, audience/critic score, auction reserve, final scores, and competitors' finances. `src/data.js` produces clearly labeled samples; it does not claim these are estimates from real film performance. There are no actual Rotten Tomatoes percentages in the app.

The public interface explicitly says "Real releases. Simulated numbers." and the game results say "Simulated weekend box office."

## Moving toward real-money-data scoring

1. Choose a **movie metadata** provider with usage terms appropriate to the project. For example, TMDB has an API for film dates, cast and crew; it requires an API credential, attribution, and a separate commercial agreement if the game is monetized. This is distinct from a source of weekend domestic box-office totals. Avoid keeping third-party API credentials in client JavaScript.
2. Choose a licensed/authorized provider for **Friday-Sunday domestic grosses and theater counts** with publication times and corrections. Release calendars are not box-office APIs.
3. Obtain production-budget information, prior-film lead actor data, and a lawful license or approved integration for Rotten Tomatoes critic scores. Missing data must be displayed as unavailable or handled by an explicit league rule; never silently make up 'actual' numbers.
4. Ingest and review into versioned server-side records with source URLs, source timestamps, as-of dates, release change history, score correction rules and visible human overrides. A locked league season must use a frozen catalog version.
5. Replace client-local financial authority with authenticated server-side auctions and settlement before inviting independent players into shared leagues.

## Future refresh strategy

For now the real release catalog is intentionally **fixed for the eight-week demo season**, avoiding silent schedule changes that would corrupt saved auctions or score histories. A rolling automated catalog requires a suitable API license, source normalization and season versioning. The existing Github Pages mirror workflow publishes changes merged to Hollywood main; it does **not** fetch new industry movie listings or actual box-office data.
