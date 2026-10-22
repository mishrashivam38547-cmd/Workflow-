export type CategoryId = 'artist' | 'designer' | 'architect';

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  price: number;
  tag: string;
  year: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  deliverables: string[];
  popular?: boolean;
  active: boolean;
}

export interface Review {
  id: string;
  name: string;
  role?: string;
  rating: number;
  date: string;
  text: string;
}

export interface Creator {
  id: string;
  name: string;
  role: string;
  category: CategoryId;
  location: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  projects: number;
  responseTime: string;
  startingPrice: number;
  verified: boolean;
  featured: boolean;
  online: boolean;
  joined: string;
  tags: string[];
  about: string;
  languages: string[];
  portfolio: PortfolioItem[];
  services: Service[];
  reviews: Review[];
  earnings: number;
  /** auth user id who owns this profile (set for profiles created via Register) */
  ownerId?: string;
  profileViews: number;
}

export type RequestStatus = 'new' | 'accepted' | 'declined' | 'done';

export interface HireRequest {
  id: string;
  creatorId: string;
  serviceTitle: string;
  clientName: string;
  contact: string;
  budget: number;
  date: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
}
