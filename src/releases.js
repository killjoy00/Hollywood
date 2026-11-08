// Editorially checked U.S./Canada theatrical slate, reviewed 2026-11-07.
// These are REAL releases and credited people, NOT live box-office data.
// The game designates a featured lead and two supporting performers; these
// fantasy-game categories are not claims about contractual screen billing.
// A pair of co-directors counts as one draftable directing team in the demo.
// Dates are initial wide/expansion dates for this demo's release calendar.
export const RELEASE_SNAPSHOT_DATE = '2026-11-07';
export const SEASON_START = '2026-11-06';
export const RELEASES = [
  {
    id: 'cat', title: 'The Cat in the Hat', releaseDate: '2026-11-06', week: 1,
    genre: 'ANIMATION', lead: 'Bill Hader', supporting: ['Matt Berry', 'Quinta Brunson'],
    director: 'Erica Rivinoja & Alessandro Carloni', directors: ['Erica Rivinoja', 'Alessandro Carloni'],
    sourceUrl: 'https://www.catinthehatfilm.com/home/',
    demoBudget: 70, demoOpening: 23, demoCritic: 78, demoScreens: 3850, colors: ['#ba7059', '#714338'],
  },
  {
    id: 'godzilla', title: 'Godzilla Minus Zero', releaseDate: '2026-11-06', week: 1,
    genre: 'SCI-FI', lead: 'Ryunosuke Kamiki', supporting: ['Minami Hamabe', 'Hidetaka Yoshioka'],
    director: 'Takashi Yamazaki',
    sourceUrl: 'https://godzilla.com/pages/godzilla-minus-zero',
    demoBudget: 82, demoOpening: 31, demoCritic: 91, demoScreens: 3450, colors: ['#456c62', '#253d38'],
  },
  {
    id: 'ebenezer', title: 'Ebenezer', releaseDate: '2026-11-13', week: 2,
    genre: 'FANTASY', lead: 'Johnny Depp', supporting: ['Rupert Grint', 'Andrea Riseborough'],
    director: 'Ti West', sourceUrl: 'https://www.paramount.com/movies/ebenezer',
    demoBudget: 48, demoOpening: 18, demoCritic: 83, demoScreens: 2800, colors: ['#5f725e', '#333f38'],
  },
  {
    id: 'bank', title: 'How to Rob a Bank', releaseDate: '2026-11-13', week: 2,
    genre: 'ACTION', lead: 'Nicholas Hoult', supporting: ['Zoe Kravitz', 'Pete Davidson'],
    director: 'David Leitch', sourceUrl: 'https://www.regmovies.com/movies/how-to-rob-a-bank-ho00022799',
    demoBudget: 58, demoOpening: 25, demoCritic: 84, demoScreens: 3450, colors: ['#9c674f', '#583b34'],
  },
  {
    id: 'hunger', title: 'The Hunger Games: Sunrise on the Reaping', releaseDate: '2026-11-20', week: 3,
    genre: 'ADVENTURE', lead: 'Joseph Zada', supporting: ['Elle Fanning', 'Jesse Plemons'],
    director: 'Francis Lawrence', sourceUrl: 'https://www.rottentomatoes.com/m/the_hunger_games_sunrise_on_the_reaping',
    demoBudget: 160, demoOpening: 63, demoCritic: 80, demoScreens: 4300, colors: ['#b78843', '#664b35'],
  },
  {
    id: 'rocky', title: 'I Play Rocky', releaseDate: '2026-11-20', week: 3,
    genre: 'DRAMA', lead: 'Anthony Ippolito', supporting: ['Matt Dillon', 'AnnaSophia Robb'],
    director: 'Peter Farrelly', releaseNote: 'Wider release after a limited opening',
    sourceUrl: 'https://www.aboutamazon.com/news/entertainment/i-play-rocky-trailer-cast-release-date-amazon-mgm-studios',
    demoBudget: 32, demoOpening: 12, demoCritic: 88, demoScreens: 2600, colors: ['#936c4a', '#4d3932'],
  },
  {
    id: 'hexed', title: 'Hexed', releaseDate: '2026-11-25', week: 4,
    genre: 'ANIMATION', lead: 'Hailee Steinfeld', supporting: ['Rashida Jones', 'Walton Goggins'],
    director: 'Fawn Veerasunthorn & Jason Hand', directors: ['Fawn Veerasunthorn', 'Jason Hand'],
    sourceUrl: 'https://movies.disney.com/Hexed',
    demoBudget: 105, demoOpening: 41, demoCritic: 89, demoScreens: 4200, colors: ['#7967a8', '#474264'],
  },
  {
    id: 'focker', title: 'Focker-In-Law', releaseDate: '2026-11-25', week: 4,
    genre: 'COMEDY', lead: 'Ben Stiller', supporting: ['Robert De Niro', 'Ariana Grande'],
    director: 'John Hamburg', sourceUrl: 'https://www.universalpictures.com/movies/focker-in-law/synopsis/',
    demoBudget: 82, demoOpening: 38, demoCritic: 73, demoScreens: 4000, colors: ['#a26866', '#754845'],
  },
  {
    id: 'behemoth', title: 'Behemoth!', releaseDate: '2026-12-04', week: 5,
    genre: 'DRAMA', lead: 'Pedro Pascal', supporting: ['Olivia Wilde', 'Eva Victor'],
    director: 'Tony Gilroy', sourceUrl: 'https://press.searchlightpictures.com/behemoth',
    demoBudget: 38, demoOpening: 16, demoCritic: 94, demoScreens: 2900, colors: ['#85917a', '#4d5949'],
  },
  {
    id: 'violent', title: 'Violent Night 2', releaseDate: '2026-12-04', week: 5,
    genre: 'ACTION', lead: 'David Harbour', supporting: ['Kristen Bell', 'Jared Harris'],
    director: 'Tommy Wirkola', sourceUrl: 'https://www.rottentomatoes.com/m/violent_night_2',
    demoBudget: 55, demoOpening: 27, demoCritic: 79, demoScreens: 3550, colors: ['#8c4748', '#4f3032'],
  },
  {
    id: 'zero', title: 'Zero A.D.: The Birth of Christ', releaseDate: '2026-12-11', week: 6,
    genre: 'DRAMA', lead: 'Deva Cassel', supporting: ['Sam Worthington', 'Ben Mendelsohn'],
    director: 'Alejandro Monteverde', sourceUrl: 'https://www.angel.com/movies/zero-ad',
    demoBudget: 35, demoOpening: 15, demoCritic: 77, demoScreens: 2850, colors: ['#b69965', '#716141'],
  },
  {
    id: 'elsinore', title: 'Elsinore', releaseDate: '2026-12-11', week: 6,
    genre: 'DRAMA', lead: 'Andrew Scott', supporting: ['Olivia Colman', 'Billie Piper'],
    director: 'Simon Stone', releaseNote: 'Wider release after a November 20 limited opening',
    sourceUrl: 'https://www.focusfeatures.com/article/focus-features-acquires-and-sets-north-american-release-date-for-elsinore',
    demoBudget: 26, demoOpening: 10, demoCritic: 90, demoScreens: 2350, colors: ['#8c827d', '#514b47'],
  },
  {
    id: 'avengers', title: 'Avengers: Doomsday', releaseDate: '2026-12-18', week: 7,
    genre: 'ACTION', lead: 'Robert Downey Jr.', supporting: ['Pedro Pascal', 'Florence Pugh'],
    director: 'Anthony Russo & Joe Russo', directors: ['Anthony Russo', 'Joe Russo'],
    sourceUrl: 'https://movies.disney.com/avengers-doomsday',
    demoBudget: 185, demoOpening: 81, demoCritic: 86, demoScreens: 4450, colors: ['#b95d51', '#573b38'],
  },
  {
    id: 'dune', title: 'Dune: Part Three', releaseDate: '2026-12-18', week: 7,
    genre: 'SCI-FI', lead: 'Timothee Chalamet', supporting: ['Zendaya', 'Florence Pugh'],
    director: 'Denis Villeneuve', sourceUrl: 'https://www.youtube.com/watch?v=rGNc8RRggzo',
    demoBudget: 170, demoOpening: 68, demoCritic: 91, demoScreens: 4200, colors: ['#b38d63', '#6b513c'],
  },
  {
    id: 'angry', title: 'The Angry Birds Movie 3', releaseDate: '2026-12-23', week: 8,
    genre: 'ANIMATION', lead: 'Jason Sudeikis', supporting: ['Josh Gad', 'Rachel Bloom'],
    director: 'John Rice', sourceUrl: 'https://www.angrybirds.movie/synopsis/',
    demoBudget: 108, demoOpening: 37, demoCritic: 73, demoScreens: 4050, colors: ['#b86b52', '#73504a'],
  },
  {
    id: 'jumanji', title: 'Jumanji: Open World', releaseDate: '2026-12-25', week: 8,
    genre: 'ADVENTURE', lead: 'Dwayne Johnson', supporting: ['Kevin Hart', 'Jack Black'],
    director: 'Jake Kasdan', sourceUrl: 'https://jumanji.movie/synopsis/',
    demoBudget: 130, demoOpening: 54, demoCritic: 78, demoScreens: 4300, colors: ['#4e8a64', '#31523b'],
  },
  {
    id: 'werwulf', title: 'Werwulf', releaseDate: '2026-12-25', week: 8,
    genre: 'HORROR', lead: 'Aaron Taylor-Johnson', supporting: ['Willem Dafoe', 'Lily-Rose Depp'],
    director: 'Robert Eggers', sourceUrl: 'https://www.focusfeatures.com/werwulf',
    demoBudget: 44, demoOpening: 19, demoCritic: 92, demoScreens: 2950, colors: ['#50574f', '#292f2a'],
  },
];
