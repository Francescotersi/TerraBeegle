import { GridComponentProps } from '../views/grid/grid.component';

export const MOCK_GAME_COVERS: Record<number, string> = {
  1: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_616x353.jpg', // The Witcher 3
  2: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_616x353.jpg', // Cyberpunk 2077
  3: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg', // Elden Ring
  4: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/capsule_616x353.jpg', // Hollow Knight
  5: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_616x353.jpg', // Red Dead Redemption 2
  6: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_616x353.jpg', // Baldur's Gate 3
  7: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/capsule_616x353.jpg', // Hades
  8: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/capsule_616x353.jpg', // God of War
  9: 'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg', // Zelda BOTW
  10: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/capsule_616x353.jpg', // Persona 5 Royal
  11: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/capsule_616x353.jpg', // Sekiro
  12: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/capsule_616x353.jpg', // Dark Souls III
  13: 'https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg', // Bloodborne
  14: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/capsule_616x353.jpg', // Monster Hunter: World
  15: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/capsule_616x353.jpg', // GTA V
  16: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/capsule_616x353.jpg', // Celeste
  17: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632470/capsule_616x353.jpg', // Disco Elysium
  18: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1328670/capsule_616x353.jpg', // Mass Effect
  19: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/22380/capsule_616x353.jpg', // Fallout New Vegas
  20: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/capsule_616x353.jpg', // DOOM Eternal
  21: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/capsule_616x353.jpg', // Portal 2
  22: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/546560/capsule_616x353.jpg', // Half-Life: Alyx
  23: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/capsule_616x353.jpg', // Resident Evil 4 Remake
  24: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/capsule_616x353.jpg', // Ghost of Tsushima
  25: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1462040/capsule_616x353.jpg', // FF VII Remake
};

const DEFAULT_FALLBACK_IMAGE =
  'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_616x353.jpg';

export function createMockGame(
  game: Partial<GridComponentProps> &
    Pick<GridComponentProps, 'rawgGameId' | 'name' | 'released' | 'rating' | 'metacritic'>
): GridComponentProps {
  const cover =
    game.coverImage ||
    MOCK_GAME_COVERS[game.rawgGameId] ||
    DEFAULT_FALLBACK_IMAGE;

  return {
    description: '',
    tba: false,
    website: '',
    coverImage: cover,
    developer: '',
    publisher: '',
    genres: [],
    platforms: [6, 48, 49],
    ...game,
    tags: game.tags ?? [],
  };
}

export const MOCK_GAMES: GridComponentProps[] = [
  createMockGame({
    rawgGameId: 1,
    name: 'The Witcher 3: Wild Hunt',
    released: '2015-05-19',
    rating: 4.8,
    metacritic: 93,
    description:
      'Geralt di Rivia, un cacciatore di mostri mutato, viaggia attraverso un mondo devastato dalla guerra alla ricerca della figlia della profezia.',
    genres: ['RPG', 'Adventure'],
    tags: ['open world', 'fantasy', 'story rich'],
    developer: 'CD PROJEKT RED',
    publisher: 'CD PROJEKT RED',
  }),
  createMockGame({
    rawgGameId: 2,
    name: 'Cyberpunk 2077',
    released: '2020-12-10',
    rating: 4.3,
    metacritic: 86,
    description:
      "Un GDR d'avventura a mondo aperto ambientato nella megalopoli di Night City, dove il potere, il lusso e le modifiche corporee regnano sovrani.",
    genres: ['Action', 'RPG'],
    tags: ['cyberpunk', 'sci-fi', 'open world'],
    developer: 'CD PROJEKT RED',
    publisher: 'CD PROJEKT RED',
  }),
  createMockGame({
    rawgGameId: 3,
    name: 'Elden Ring',
    released: '2022-02-25',
    rating: 4.9,
    metacritic: 96,
    description:
      "L'Interregno ti attende. Alzati, Senzaluce, e lasciati guidare dalla grazia per brandire il potere dell'Anello ancestrale.",
    genres: ['RPG', 'Action'],
    tags: ['souls-like', 'dark fantasy', 'difficult'],
    developer: 'FromSoftware Inc.',
    publisher: 'Bandai Namco Entertainment',
  }),
  createMockGame({
    rawgGameId: 4,
    name: 'Hollow Knight',
    released: '2017-02-24',
    rating: 4.7,
    metacritic: 90,
    description:
      'Forgia il tuo percorso attraverso un vasto regno sotterraneo di insetti ed eroi caduti.',
    genres: ['Platformer', 'Adventure', 'Indie'],
    tags: ['metroidvania', 'indie', 'difficult'],
    developer: 'Team Cherry',
    publisher: 'Team Cherry',
  }),
  createMockGame({
    rawgGameId: 5,
    name: 'Red Dead Redemption 2',
    released: '2018-10-26',
    rating: 4.9,
    metacritic: 97,
    description:
      'America, 1899. Arthur Morgan e la banda di Van der Linde sono fuorilegge in fuga attraverso il cuore selvaggio degli Stati Uniti.',
    genres: ['Action', 'Adventure'],
    tags: ['western', 'open world', 'story rich'],
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
  }),
  createMockGame({
    rawgGameId: 6,
    name: "Baldur's Gate 3",
    released: '2023-08-03',
    rating: 4.9,
    metacritic: 96,
    description:
      'Ritorna nei Forgotten Realms in una storia di amicizia e tradimento, sacrificio e sopravvivenza, e il fascino del potere assoluto.',
    genres: ['RPG', 'Strategy'],
    tags: ['turn-based', 'choice matters', 'd&d'],
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
  }),
  createMockGame({
    rawgGameId: 7,
    name: 'Hades',
    released: '2020-09-17',
    rating: 4.8,
    metacritic: 93,
    description:
      'Sfida il dio dei morti e fatti strada a colpi di spada fuori dagli Inferi in questo frenetico roguelike dungeon crawler.',
    genres: ['Action', 'Indie'],
    tags: ['roguelike', 'mythology', 'hack and slash'],
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
  }),
  createMockGame({
    rawgGameId: 8,
    name: 'God of War',
    released: '2018-04-20',
    rating: 4.8,
    metacritic: 94,
    description:
      'Kratos vive ora come un uomo nel regno delle divinità e dei mostri norreni, insieme al figlio Atreus in una missione profondamente personale.',
    genres: ['Action', 'Adventure'],
    tags: ['mythology', 'action', 'story rich'],
    developer: 'Santa Monica Studio',
    publisher: 'PlayStation Publishing',
  }),
  createMockGame({
    rawgGameId: 9,
    name: 'The Legend of Zelda: Breath of the Wild',
    released: '2017-03-03',
    rating: 4.9,
    metacritic: 97,
    description:
      'Risvegliati da un sonno centenario per scoprire un mondo in rovina ed esplorare le vaste terre di Hyrule in totale libertà.',
    genres: ['Adventure', 'Action'],
    tags: ['exploration', 'open world', 'fantasy'],
    developer: 'Nintendo EPD',
    publisher: 'Nintendo',
  }),
  createMockGame({
    rawgGameId: 10,
    name: 'Persona 5 Royal',
    released: '2020-03-31',
    rating: 4.8,
    metacritic: 95,
    description:
      'Indossa la maschera di Joker e unisciti ai Ladri Fantasma di Cuori per liberare Tokyo dai desideri corrotti e dalle ingiustizie.',
    genres: ['RPG'],
    tags: ['anime', 'turn-based', 'soundtrack'],
    developer: 'ATLUS',
    publisher: 'SEGA',
  }),
  createMockGame({
    rawgGameId: 11,
    name: 'Sekiro: Shadows Die Twice',
    released: '2019-03-22',
    rating: 4.7,
    metacritic: 90,
    description:
      'Nel Giappone dell’era Sengoku, un guerriero dal braccio di ferro deve salvare il suo giovane maestro e compiere la sua vendetta.',
    genres: ['Action', 'Adventure'],
    tags: ['souls-like', 'stealth', 'difficult'],
    developer: 'FromSoftware Inc.',
    publisher: 'Activision',
  }),
  createMockGame({
    rawgGameId: 12,
    name: 'Dark Souls III',
    released: '2016-04-12',
    rating: 4.7,
    metacritic: 89,
    description:
      'Mentre i fuochi svaniscono e il mondo cade in rovina, viaggia in un universo colmo di bestie titaniche e oscurità insondabile.',
    genres: ['RPG', 'Action'],
    tags: ['dark fantasy', 'difficult', 'souls-like'],
    developer: 'FromSoftware Inc.',
    publisher: 'Bandai Namco Entertainment',
  }),
  createMockGame({
    rawgGameId: 13,
    name: 'Bloodborne',
    released: '2015-03-24',
    rating: 4.8,
    metacritic: 92,
    description:
      'Affronta i tuoi incubi nella città gotica in rovina di Yharnam, afflitta da una misteriosa piaga endemica.',
    genres: ['RPG', 'Action'],
    tags: ['lovecraftian', 'horror', 'gothic'],
    developer: 'FromSoftware Inc.',
    publisher: 'Sony Computer Entertainment',
  }),
  createMockGame({
    rawgGameId: 14,
    name: 'Monster Hunter: World',
    released: '2018-01-26',
    rating: 4.6,
    metacritic: 90,
    description:
      'Caccia mostri giganteschi in paesaggi mozzafiato come parte della commissione di ricerca nel Nuovo Mondo.',
    genres: ['Action', 'RPG'],
    tags: ['hunting', 'co-op', 'multiplayer'],
    developer: 'CAPCOM Co., Ltd.',
    publisher: 'CAPCOM Co., Ltd.',
  }),
  createMockGame({
    rawgGameId: 15,
    name: 'Grand Theft Auto V',
    released: '2013-09-17',
    rating: 4.7,
    metacritic: 97,
    description:
      'Tre criminali molto diversi pianificano una serie di audaci colpi a Los Santos e Blaine County.',
    genres: ['Action', 'Adventure'],
    tags: ['open world', 'multiplayer', 'crime'],
    developer: 'Rockstar North',
    publisher: 'Rockstar Games',
  }),
  createMockGame({
    rawgGameId: 16,
    name: 'Celeste',
    released: '2018-01-25',
    rating: 4.8,
    metacritic: 92,
    description:
      'Aiuta Madeline a scalare la montagna Celeste affrontando le sue paure interiori in questo platform di precisione.',
    genres: ['Platformer', 'Indie'],
    tags: ['precision', 'pixel art', 'great soundtrack'],
    developer: 'Maddy Makes Games',
    publisher: 'Maddy Makes Games',
  }),
  createMockGame({
    rawgGameId: 17,
    name: 'Disco Elysium',
    released: '2019-10-15',
    rating: 4.8,
    metacritic: 97,
    description:
      'Sei un detective con un set di abilità unico a tua disposizione e un intero isolato urbano da esplorare ed interrogare.',
    genres: ['RPG'],
    tags: ['detective', 'narrative', 'dialogue'],
    developer: 'ZA/UM',
    publisher: 'ZA/UM',
  }),
  createMockGame({
    rawgGameId: 18,
    name: 'Mass Effect Legendary Edition',
    released: '2021-05-14',
    rating: 4.7,
    metacritic: 90,
    description:
      'Rivivi la leggenda del Comandante Shepard nell’acclamata trilogia sci-fi rimasterizzata con grafica 4K Ultra HD.',
    genres: ['RPG', 'Action'],
    tags: ['sci-fi', 'space', 'story rich'],
    developer: 'BioWare',
    publisher: 'Electronic Arts',
  }),
  createMockGame({
    rawgGameId: 19,
    name: 'Fallout: New Vegas',
    released: '2010-10-19',
    rating: 4.7,
    metacritic: 84,
    description:
      'Benvenuto a New Vegas. Una città dove ti scaverai la fossa prima ancora di ricevere un proiettile in testa.',
    genres: ['RPG', 'Action'],
    tags: ['post-apocalyptic', 'classic', 'open world'],
    developer: 'Obsidian Entertainment',
    publisher: 'Bethesda Softworks',
  }),
  createMockGame({
    rawgGameId: 20,
    name: 'DOOM Eternal',
    released: '2020-03-20',
    rating: 4.6,
    metacritic: 88,
    description:
      'Gli eserciti dell’Inferno hanno invaso la Terra. Diventa lo Slayer in un’epica campagna per salvare l’umanità e conquistare i demoni.',
    genres: ['Action', 'Shooter'],
    tags: ['fast-paced', 'demons', 'heavy metal'],
    developer: 'id Software',
    publisher: 'Bethesda Softworks',
  }),
  createMockGame({
    rawgGameId: 21,
    name: 'Portal 2',
    released: '2011-04-19',
    rating: 4.9,
    metacritic: 95,
    description:
      'Ritorna nei laboratori Aperture Science per nuove camere di prova rompicapo con GLaDOS e Wheatley.',
    genres: ['Puzzle', 'Adventure'],
    tags: ['co-op', 'comedy', 'sci-fi'],
    developer: 'Valve',
    publisher: 'Valve',
  }),
  createMockGame({
    rawgGameId: 22,
    name: 'Half-Life: Alyx',
    released: '2020-03-23',
    rating: 4.8,
    metacritic: 93,
    description:
      'La lotta contro una feroce razza aliena conosciuta come Combine nei panni di Alyx Vance in un’esperienza VR pionieristica.',
    genres: ['Action', 'VR'],
    tags: ['sci-fi', 'vr', 'masterpiece'],
    developer: 'Valve',
    publisher: 'Valve',
  }),
  createMockGame({
    rawgGameId: 23,
    name: 'Resident Evil 4 Remake',
    released: '2023-03-24',
    rating: 4.8,
    metacritic: 93,
    description:
      'La sopravvivenza è solo l’inizio. Leon S. Kennedy viene inviato in un remoto villaggio europeo per salvare la figlia rapita del presidente.',
    genres: ['Action', 'Horror'],
    tags: ['survival horror', 'action', 'remake'],
    developer: 'CAPCOM Co., Ltd.',
    publisher: 'CAPCOM Co., Ltd.',
  }),
  createMockGame({
    rawgGameId: 24,
    name: 'Ghost of Tsushima',
    released: '2020-07-17',
    rating: 4.7,
    metacritic: 87,
    description:
      'Alla fine del XIII secolo, il guerriero samurai Jin Sakai deve proteggere il suo popolo e riconquistare l’isola di Tsushima contro l’invasione mongola.',
    genres: ['Action', 'Adventure'],
    tags: ['samurai', 'open world', 'historical'],
    developer: 'Sucker Punch Productions',
    publisher: 'PlayStation Publishing',
  }),
  createMockGame({
    rawgGameId: 25,
    name: 'Final Fantasy VII Remake',
    released: '2020-04-10',
    rating: 4.6,
    metacritic: 87,
    description:
      'Il mondo è caduto sotto il controllo della Shinra Electric Power Company. L’ex soldato Cloud Strife si unisce al gruppo ecoterrorista Avalanche.',
    genres: ['RPG', 'Action'],
    tags: ['jrpg', 'remake', 'fantasy'],
    developer: 'Square Enix',
    publisher: 'Square Enix',
  }),
];

export const MOCK_WISHLIST_GAMES: GridComponentProps[] = [
  createMockGame({
    rawgGameId: 2,
    name: 'Cyberpunk 2077',
    released: '2020-12-10',
    rating: 4.3,
    metacritic: 86,
    genres: ['Action', 'RPG'],
    tags: ['cyberpunk', 'sci-fi'],
  }),
  createMockGame({
    rawgGameId: 6,
    name: "Baldur's Gate 3",
    released: '2023-08-03',
    rating: 4.9,
    metacritic: 96,
    genres: ['RPG', 'Strategy'],
    tags: ['turn-based', 'choice matters'],
  }),
  createMockGame({
    rawgGameId: 7,
    name: 'Hades',
    released: '2020-09-17',
    rating: 4.8,
    metacritic: 93,
    genres: ['Action', 'Indie'],
    tags: ['roguelike', 'mythology'],
  }),
];

export const MOCK_FAVORITE_GAMES: GridComponentProps[] = [
  createMockGame({
    rawgGameId: 1,
    name: 'The Witcher 3: Wild Hunt',
    released: '2015-05-19',
    rating: 4.8,
    metacritic: 93,
    genres: ['RPG', 'Adventure'],
    tags: ['open world', 'fantasy'],
  }),
  createMockGame({
    rawgGameId: 3,
    name: 'Elden Ring',
    released: '2022-02-25',
    rating: 4.9,
    metacritic: 96,
    genres: ['RPG', 'Action'],
    tags: ['souls-like', 'dark fantasy'],
  }),
  createMockGame({
    rawgGameId: 4,
    name: 'Hollow Knight',
    released: '2017-02-24',
    rating: 4.7,
    metacritic: 90,
    genres: ['Platformer', 'Adventure'],
    tags: ['metroidvania', 'indie'],
  }),
];

