export interface Session {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: "user" | "developer" | "admin";
  developerId?: string | null;
}

export interface Application {
  id: string;
  developerId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  iconUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  license?: string;
  isFree: boolean;
  price?: string;
  platforms: string[];
  categoryId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  developer?: Developer;
  category?: Category;
  versions?: ApplicationVersion[];
  screenshots?: Screenshot[];
  reviews?: Review[];
  _count?: {
    reviews: number;
    downloads: number;
    favorites: number;
  };
  averageRating?: number;
}

export interface Developer {
  id: string;
  userId: string;
  displayName: string;
  description?: string;
  website?: string;
  avatar?: string;
  createdAt: Date;
  user?: {
    username: string;
    avatar?: string;
  };
  _count?: {
    applications: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  _count?: {
    applications: number;
  };
}

export interface ApplicationVersion {
  id: string;
  applicationId: string;
  version: string;
  changelog?: string;
  releaseDate: Date;
  platform: string;
  architecture?: string;
  fileSize?: string;
  downloadUrl: string;
  provider: string;
  externalFileId?: string;
  checksum?: string;
  status?: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  applicationId: string;
  userId: string;
  rating: number;
  text?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    username: string;
    avatar?: string;
  };
}

export interface Screenshot {
  id: string;
  applicationId: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
}

export interface Download {
  id: string;
  applicationId: string;
  versionId?: string;
  userId?: string;
  platform?: string;
  timestamp: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  applicationId: string;
  createdAt: Date;
}
