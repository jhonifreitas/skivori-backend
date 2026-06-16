export class GameEntity {
  id: string;
  slug: string;
  title: string;
  providerName: string;
  startUrl?: string;
  thumb?: GameThumb | null;
}

class GameThumb {
  url: string;
}
