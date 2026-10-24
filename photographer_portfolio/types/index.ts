export interface ProjectItem {
  id: string;
  number: string;
  total: string;
  slug: string;
  title: string;
  description: string;
  place: string;
  country: string;
  year: string;
  camera: string;
  settings: string;
  series: string;
  edition: string;
  heroImage: string;
  additionalFrames: string[];
  nextSlug: string | null;
  nextTitle: string | null;
  prevSlug: string | null;
}

export interface GalleryItem {
  image: string;
  title: string;
  location: string;
  year: string;
  category: 'Ice' | 'Water' | 'Salt' | 'Sand' | 'Fire' | string;
}
