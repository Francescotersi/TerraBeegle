import { GridComponentProps } from '../views/grid/grid.component';

export function createMockGame(
  game: Partial<GridComponentProps> &
    Pick<GridComponentProps, 'rawgGameId' | 'name' | 'released' | 'rating' | 'metacritic'>
): GridComponentProps {
  return {
    description: '',
    tba: false,
    website: '',
    coverImage:
      'https://imgs.search.brave.com/a1EsFjU-WvxTYpFAexmjkr9I7R1sdZ5L3-Gwc3AhY9A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvMTA0/NTg1NzUuanBn',
    developer: '',
    publisher: '',
    genres: [],
    platforms: [6, 48, 49],
    ...game,
    tags: game.tags ?? [],
  };
}

