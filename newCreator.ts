import type { CategoryId, Creator } from './types';

function initialsAvatar(name: string): string {
  const letter = (name.trim()[0] ?? 'W').toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
    `<rect width="200" height="200" fill="#C2482B"/>` +
    `<text x="100" y="128" font-size="96" font-family="sans-serif" font-weight="700" fill="#FAF6EE" text-anchor="middle">${letter.replace(/[<>&"']/g, '')}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildCreator(p: {
  id: string;
  ownerId: string;
  name: string;
  category: CategoryId;
  role: string;
}): Creator {
  return {
    id: p.id,
    ownerId: p.ownerId,
    name: p.name,
    role: p.role,
    category: p.category,
    location: 'India',
    avatar: initialsAvatar(p.name),
    rating: 0,
    reviewsCount: 0,
    projects: 0,
    responseTime: '—',
    startingPrice: 0,
    verified: false,
    featured: false,
    online: true,
    joined: String(new Date().getFullYear()),
    tags: [],
    about: '',
    languages: [],
    portfolio: [],
    services: [],
    reviews: [],
    earnings: 0,
    profileViews: 0,
  };
}
