import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { FieldPath } from "firebase-admin/firestore";

export const db = () => getFirebaseAdminDb();

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: Date;
}

export interface DeveloperDoc {
  id: string;
  userId: string;
  displayName: string;
  description?: string;
  website?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationDoc {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  status: string;
  platforms?: string[];
  iconUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  license?: string;
  isFree?: boolean;
  price?: string;
  developerId: string;
  developerName?: string;
  averageRating?: number;
  reviewsCount?: number;
  downloadsCount?: number;
  favoritesCount?: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    reviews: number;
    downloads: number;
    favorites: number;
  };
}

export interface VersionDoc {
  id: string;
  applicationId: string;
  version: string;
  changelog?: string;
  releaseDate?: Date;
  platform: string;
  architecture?: string;
  fileSize?: string;
  downloadUrl: string;
  provider?: string;
  externalFileId?: string;
  checksum?: string;
  status: string;
  createdAt?: Date;
}

export interface ScreenshotDoc {
  id: string;
  applicationId: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
}

export interface ReviewDoc {
  id: string;
  applicationId: string;
  userId: string;
  username?: string;
  avatar?: string;
  rating: number;
  text?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FavoriteDoc {
  id?: string;
  userId: string;
  applicationId: string;
  createdAt?: Date;
}

export interface DownloadDoc {
  id?: string;
  applicationId: string;
  versionId?: string;
  userId?: string;
  platform?: string;
  timestamp?: Date;
}

export interface UserDoc {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCategories(): Promise<CategoryDoc[]> {
  const snapshot = await db().collection("categories").orderBy("name").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryDoc));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDoc | null> {
  const snapshot = await db().collection("categories").where("slug", "==", slug).limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CategoryDoc;
}

export async function createCategory(data: Omit<CategoryDoc, "id">): Promise<CategoryDoc> {
  const docRef = await db().collection("categories").add(data);
  return { id: docRef.id, ...data };
}

export async function getApplications(filters?: {
  categoryId?: string;
  status?: string;
  developerId?: string;
  search?: string;
  platform?: string;
}): Promise<ApplicationDoc[]> {
  let query = db().collection("applications") as any;

  if (filters?.status) {
    query = query.where("status", "==", filters.status);
  }
  if (filters?.developerId) {
    query = query.where("developerId", "==", filters.developerId);
  }
  if (filters?.categoryId) {
    query = query.where("categoryId", "==", filters.categoryId);
  }

  const snapshot: any = await query.get();
  let apps: ApplicationDoc[] = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as ApplicationDoc));

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    apps = apps.filter((app) =>
      app.name?.toLowerCase().includes(term) ||
      app.shortDescription?.toLowerCase().includes(term)
    );
  }

  if (filters?.platform) {
    apps = apps.filter((app) => app.platforms?.includes(filters.platform!));
  }

  const developerIds = [...new Set(apps.map((a) => a.developerId).filter(Boolean))];
  const categoryIds = [...new Set(apps.map((a) => a.categoryId).filter(Boolean))];

  const developersMap = new Map<string, DeveloperDoc>();
  const categoriesMap = new Map<string, CategoryDoc>();

  for (let i = 0; i < developerIds.length; i += 10) {
    const batch = developerIds.slice(i, i + 10);
    const snap = await db().collection("developers").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => developersMap.set(d.id, { id: d.id, ...d.data() } as DeveloperDoc));
  }

  for (let i = 0; i < categoryIds.length; i += 10) {
    const batch = categoryIds.slice(i, i + 10);
    const snap = await db().collection("categories").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => categoriesMap.set(d.id, { id: d.id, ...d.data() } as CategoryDoc));
  }

  const reviewCounts = new Map<string, number>();
  const downloadCounts = new Map<string, number>();
  const favoriteCounts = new Map<string, number>();

  if (apps.length > 0) {
    const appIds = apps.map(a => a.id);
    const reviewSnaps = await db().collection("reviews").where("applicationId", "in", appIds.slice(0, 10)).get();
    reviewSnaps.docs.forEach(d => {
      const aid = d.data().applicationId as string;
      reviewCounts.set(aid, (reviewCounts.get(aid) || 0) + 1);
    });

    const downloadSnaps = await db().collection("downloads").where("applicationId", "in", appIds.slice(0, 10)).get();
    downloadSnaps.docs.forEach(d => {
      const aid = d.data().applicationId as string;
      downloadCounts.set(aid, (downloadCounts.get(aid) || 0) + 1);
    });

    const favoriteSnaps = await db().collection("favorites").where("applicationId", "in", appIds.slice(0, 10)).get();
    favoriteSnaps.docs.forEach(d => {
      const aid = d.data().applicationId as string;
      favoriteCounts.set(aid, (favoriteCounts.get(aid) || 0) + 1);
    });
  }

  return apps.map((app) => {
    const developer = developersMap.get(app.developerId) || null;
    const category = categoriesMap.get(app.categoryId) || null;
    return {
      ...app,
      developer: developer ? { userId: developer.userId, displayName: developer.displayName, avatar: developer.avatar } : null,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      _count: {
        reviews: reviewCounts.get(app.id) || 0,
        downloads: downloadCounts.get(app.id) || 0,
        favorites: favoriteCounts.get(app.id) || 0,
      },
    };
  });
}

export async function getApplicationBySlug(slug: string): Promise<(ApplicationDoc & { versions: VersionDoc[] }) | null> {
  const snapshot = await db().collection("applications").where("slug", "==", slug).limit(1).get();
  if (snapshot.empty) return null;
  const appDoc = snapshot.docs[0];

  const versionsSnapshot = await db().collection("applications").doc(appDoc.id).collection("versions").orderBy("releaseDate", "desc").get();
  const versions = versionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as VersionDoc));

  return { id: appDoc.id, ...appDoc.data(), versions } as ApplicationDoc & { versions: VersionDoc[] };
}

export async function createApplication(data: Omit<ApplicationDoc, "id">): Promise<ApplicationDoc> {
  const { id: _id, ...rest } = data as any;
  const docRef = await db().collection("applications").add({
    ...rest,
    status: data.status || "published",
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  });
  return { id: docRef.id, ...rest } as ApplicationDoc;
}

export async function updateApplication(id: string, data: Partial<ApplicationDoc>): Promise<ApplicationDoc> {
  await db().collection("applications").doc(id).update({ ...data, updatedAt: new Date() } as any);
  const doc = await db().collection("applications").doc(id).get();
  return { id: doc.id, ...doc.data() } as ApplicationDoc;
}

export async function deleteApplication(id: string): Promise<void> {
  await db().collection("applications").doc(id).delete();
}

export async function getVersions(applicationId: string): Promise<VersionDoc[]> {
  const snapshot = await db().collection("applications").doc(applicationId).collection("versions").orderBy("releaseDate", "desc").get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VersionDoc));
}

export async function updateVersion(applicationId: string, versionId: string, data: Partial<VersionDoc>): Promise<VersionDoc> {
  await db().collection("applications").doc(applicationId).collection("versions").doc(versionId).update({ ...data } as any);
  const doc = await db().collection("applications").doc(applicationId).collection("versions").doc(versionId).get();
  return { id: doc.id, ...doc.data() } as VersionDoc;
}

export async function createVersion(applicationId: string, data: Omit<VersionDoc, "id" | "applicationId">): Promise<VersionDoc> {
  const docRef = await db().collection("applications").doc(applicationId).collection("versions").add({
    ...data,
    applicationId,
    createdAt: data.releaseDate || new Date(),
  });
  return { id: docRef.id, applicationId, ...data } as VersionDoc;
}

export async function getLatestVersion(applicationId: string, platform?: string): Promise<VersionDoc | null> {
  let query = db().collection("applications").doc(applicationId).collection("versions") as any;
  if (platform) {
    query = query.where("platform", "==", platform);
  }
  const snapshot = await query.orderBy("releaseDate", "desc").limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as VersionDoc;
}

export async function getLatestPublishedVersion(applicationId: string, platform?: string): Promise<VersionDoc | null> {
  let query = db().collection("applications").doc(applicationId).collection("versions") as any;
  if (platform) {
    query = query.where("platform", "==", platform);
  }
  query = query.where("status", "==", "published");
  const snapshot = await query.orderBy("releaseDate", "desc").limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as VersionDoc;
}

export async function deleteVersion(applicationId: string, versionId: string): Promise<void> {
  await db().collection("applications").doc(applicationId).collection("versions").doc(versionId).delete();
}

export async function getReviews(applicationId: string): Promise<ReviewDoc[]> {
  const snapshot = await db().collection("reviews").where("applicationId", "==", applicationId).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ReviewDoc));
}

export async function createReview(data: Omit<ReviewDoc, "id">): Promise<ReviewDoc> {
  const docRef = await db().collection("reviews").add({
    ...data,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  });
  return { id: docRef.id, ...data } as ReviewDoc;
}

export async function updateReview(id: string, data: { rating: number; text?: string }): Promise<ReviewDoc> {
  await db().collection("reviews").doc(id).update({ ...data, updatedAt: new Date() } as any);
  const doc = await db().collection("reviews").doc(id).get();
  return { id: doc.id, ...doc.data() } as ReviewDoc;
}

export async function getFavorites(userId: string): Promise<FavoriteDoc[]> {
  const snapshot = await db().collection("favorites").where("userId", "==", userId).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FavoriteDoc));
}

export async function createFavorite(data: Omit<FavoriteDoc, "id">): Promise<FavoriteDoc> {
  const docRef = await db().collection("favorites").add({
    ...data,
    createdAt: data.createdAt || new Date(),
  });
  return { id: docRef.id, ...data } as FavoriteDoc;
}

export async function deleteFavorite(userId: string, applicationId: string): Promise<void> {
  const snapshot = await db().collection("favorites")
    .where("userId", "==", userId)
    .where("applicationId", "==", applicationId)
    .get();

  const batch = db().batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

export async function getDownloads(applicationId: string): Promise<DownloadDoc[]> {
  const snapshot = await db().collection("downloads").where("applicationId", "==", applicationId).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DownloadDoc));
}

export async function createDownload(data: Omit<DownloadDoc, "id">): Promise<DownloadDoc> {
  const docRef = await db().collection("downloads").add({
    ...data,
    timestamp: data.timestamp || new Date(),
  });
  return { id: docRef.id, ...data } as DownloadDoc;
}

export async function getDevelopers(): Promise<DeveloperDoc[]> {
  const snapshot = await db().collection("developers").get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DeveloperDoc));
}

export async function getDeveloperByUserId(userId: string): Promise<DeveloperDoc | null> {
  const snapshot = await db().collection("developers").where("userId", "==", userId).limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DeveloperDoc;
}

export async function getDeveloperBySlug(slug: string): Promise<(DeveloperDoc & { apps: ApplicationDoc[] }) | null> {
  const snapshot = await db().collection("developers").where("slug", "==", slug).limit(1).get();
  if (snapshot.empty) return null;
  const dev = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DeveloperDoc;

  const appsSnapshot = await db().collection("applications").where("developerId", "==", dev.id).get();
  const apps = appsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));

  return { ...dev, apps };
}

export async function createDeveloper(data: Omit<DeveloperDoc, "id">): Promise<DeveloperDoc> {
  const docRef = await db().collection("developers").add({
    ...data,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  });
  return { id: docRef.id, ...data } as DeveloperDoc;
}

export async function updateDeveloper(id: string, data: Partial<DeveloperDoc>): Promise<DeveloperDoc> {
  await db().collection("developers").doc(id).update({ ...data, updatedAt: new Date() } as any);
  const doc = await db().collection("developers").doc(id).get();
  return { id: doc.id, ...doc.data() } as DeveloperDoc;
}

export async function getDeveloperApps(developerId: string): Promise<ApplicationDoc[]> {
  const snapshot = await db().collection("applications").where("developerId", "==", developerId).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
}

export async function getStats() {
  const [appsSnapshot, downloadsSnapshot, reviewsSnapshot, usersSnapshot] = await Promise.all([
    db().collection("applications").get(),
    db().collection("downloads").get(),
    db().collection("reviews").get(),
    db().collection("users").get(),
  ]);

  return {
    totalApps: appsSnapshot.size,
    totalUsers: usersSnapshot.size,
    totalDownloads: downloadsSnapshot.size,
    totalReviews: reviewsSnapshot.size,
  };
}

export async function getDeveloperStats(developerId: string) {
  const appsSnapshot = await db().collection("applications").where("developerId", "==", developerId).get();
  const appIds = appsSnapshot.docs.map(d => d.id);

  const [reviewsSnapshot, favoritesSnapshot, downloadsSnapshot] = await Promise.all([
    db().collection("reviews").where("applicationId", "in", appIds.slice(0, 10)).get(),
    db().collection("favorites").where("applicationId", "in", appIds.slice(0, 10)).get(),
    db().collection("downloads").where("applicationId", "in", appIds.slice(0, 10)).get(),
  ]);

  return {
    appCount: appsSnapshot.size,
    totalReviews: reviewsSnapshot.size,
    totalFavorites: favoritesSnapshot.size,
    totalDownloads: downloadsSnapshot.size,
  };
}

export async function searchApplications(query: string): Promise<ApplicationDoc[]> {
  const snapshot = await db().collection("applications").where("status", "==", "published").get();
  const apps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  const term = query.toLowerCase();
  return apps.filter(app =>
    app.name?.toLowerCase().includes(term) ||
    app.shortDescription?.toLowerCase().includes(term)
  );
}

export async function getAppById(id: string): Promise<ApplicationDoc | null> {
  const doc = await db().collection("applications").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as ApplicationDoc;
}

export async function getUserById(id: string): Promise<UserDoc | null> {
  const doc = await db().collection("users").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as UserDoc;
}

export async function updateUser(id: string, data: Partial<UserDoc>): Promise<UserDoc> {
  await db().collection("users").doc(id).update({ ...data, updatedAt: new Date() } as any);
  const doc = await db().collection("users").doc(id).get();
  return { id: doc.id, ...doc.data() } as UserDoc;
}

export async function getApplicationsByDeveloper(developerId: string): Promise<ApplicationDoc[]> {
  const snapshot = await db().collection("applications").where("developerId", "==", developerId).get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
}

export async function getAllApplications(): Promise<ApplicationDoc[]> {
  const snapshot = await db().collection("applications").get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
}

export async function updateApplicationStatus(id: string, status: string): Promise<ApplicationDoc> {
  await db().collection("applications").doc(id).update({ status, updatedAt: new Date() } as any);
  const doc = await db().collection("applications").doc(id).get();
  return { id: doc.id, ...doc.data() } as ApplicationDoc;
}

export async function getCategoryById(id: string): Promise<CategoryDoc | null> {
  const doc = await db().collection("categories").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as CategoryDoc;
}

export async function getVersionById(applicationId: string, versionId: string): Promise<VersionDoc | null> {
  const doc = await db().collection("applications").doc(applicationId).collection("versions").doc(versionId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as VersionDoc;
}

export async function getScreenshots(applicationId: string): Promise<ScreenshotDoc[]> {
  const snapshot = await db().collection("applications").doc(applicationId).collection("screenshots").orderBy("order", "asc").get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScreenshotDoc));
}

export async function getFirstScreenshot(applicationId: string): Promise<ScreenshotDoc | null> {
  const snapshot = await db().collection("applications").doc(applicationId).collection("screenshots").orderBy("order", "asc").limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ScreenshotDoc;
}

export async function getUserByUsername(username: string): Promise<UserDoc | null> {
  const snapshot = await db().collection("users").where("username", "==", username).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserDoc;
}

export async function getDevelopersWithUserInfo(): Promise<(DeveloperDoc & { user?: { username: string; avatar?: string }; appCount?: number })[]> {
  const snapshot = await db().collection("developers").get();
  const developers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DeveloperDoc));
  const userIds = [...new Set(developers.map(d => d.userId).filter(Boolean))];
  const usersMap = new Map<string, UserDoc>();
  for (let i = 0; i < userIds.length; i += 10) {
    const batch = userIds.slice(i, i + 10);
    const snap = await db().collection("users").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => usersMap.set(d.id, { id: d.id, ...d.data() } as UserDoc));
  }
  const appCounts = new Map<string, number>();
  const appsSnapshot = await db().collection("applications").get();
  appsSnapshot.docs.forEach(d => {
    const devId = d.data().developerId as string;
    appCounts.set(devId, (appCounts.get(devId) || 0) + 1);
  });
  return developers.map(dev => {
    const user = usersMap.get(dev.userId);
    return {
      ...dev,
      user: user ? { username: user.username, avatar: user.avatar } : undefined,
      appCount: appCounts.get(dev.id) || 0,
    };
  });
}

export async function getDeveloperByIdWithUser(id: string): Promise<(DeveloperDoc & { user?: { username: string; avatar?: string }; appCount?: number }) | null> {
  const doc = await db().collection("developers").doc(id).get();
  if (!doc.exists) return null;
  const dev = { id: doc.id, ...doc.data() } as DeveloperDoc;
  const user = await getUserById(dev.userId);
  const appsSnapshot = await db().collection("applications").where("developerId", "==", dev.id).get();
  return {
    ...dev,
    user: user ? { username: user.username, avatar: user.avatar } : undefined,
    appCount: appsSnapshot.size,
  };
}

export async function searchCategories(query: string): Promise<CategoryDoc[]> {
  const snapshot = await db().collection("categories").get();
  const categories = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CategoryDoc));
  const term = query.toLowerCase();
  return categories.filter(cat =>
    cat.name?.toLowerCase().includes(term) ||
    cat.slug?.toLowerCase().includes(term)
  );
}

export async function getApplicationsForAdmin(): Promise<(ApplicationDoc & { versions: VersionDoc[]; _count: { reviews: number; downloads: number } })[]> {
  const snapshot = await db().collection("applications").orderBy("createdAt", "desc").get();
  const apps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  const developerIds = [...new Set(apps.map(a => a.developerId).filter(Boolean))];
  const developersMap = new Map<string, DeveloperDoc>();
  for (let i = 0; i < developerIds.length; i += 10) {
    const batch = developerIds.slice(i, i + 10);
    const snap = await db().collection("developers").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => developersMap.set(d.id, { id: d.id, ...d.data() } as DeveloperDoc));
  }
  const usersMap = new Map<string, UserDoc>();
  const devUserIds = [...new Set(developersMap.values().map(d => d.userId).filter(Boolean))];
  for (let i = 0; i < devUserIds.length; i += 10) {
    const batch = devUserIds.slice(i, i + 10);
    const snap = await db().collection("users").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => usersMap.set(d.id, { id: d.id, ...d.data() } as UserDoc));
  }
  const categoriesMap = new Map<string, CategoryDoc>();
  const categoryIds = [...new Set(apps.map(a => a.categoryId).filter(Boolean))];
  for (let i = 0; i < categoryIds.length; i += 10) {
    const batch = categoryIds.slice(i, i + 10);
    const snap = await db().collection("categories").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => categoriesMap.set(d.id, { id: d.id, ...d.data() } as CategoryDoc));
  }
  const reviewCounts = new Map<string, number>();
  const downloadCounts = new Map<string, number>();
  if (apps.length > 0) {
    const appIds = apps.map(a => a.id);
    for (let i = 0; i < appIds.length; i += 10) {
      const batch = appIds.slice(i, i + 10);
      const reviewSnaps = await db().collection("reviews").where("applicationId", "in", batch).get();
      reviewSnaps.docs.forEach(d => {
        const aid = d.data().applicationId as string;
        reviewCounts.set(aid, (reviewCounts.get(aid) || 0) + 1);
      });
      const downloadSnaps = await db().collection("downloads").where("applicationId", "in", batch).get();
      downloadSnaps.docs.forEach(d => {
        const aid = d.data().applicationId as string;
        downloadCounts.set(aid, (downloadCounts.get(aid) || 0) + 1);
      });
    }
  }
  return Promise.all(apps.map(async app => {
    const versions = await getVersions(app.id);
    const developer = developersMap.get(app.developerId);
    const category = categoriesMap.get(app.categoryId);
    const user = developer ? usersMap.get(developer.userId) : undefined;
    return {
      ...app,
      developer: user ? { user: { username: user.username } } : undefined,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      versions: versions.slice(0, 1),
      _count: {
        reviews: reviewCounts.get(app.id) || 0,
        downloads: downloadCounts.get(app.id) || 0,
        favorites: 0,
      },
    };
  }));
}

export async function getDeveloperAppsDetailed(developerId: string): Promise<(ApplicationDoc & { versions: VersionDoc[]; _count: { reviews: number; downloads: number; favorites: number } })[]> {
  const snapshot = await db().collection("applications").where("developerId", "==", developerId).orderBy("createdAt", "desc").get();
  const apps = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  const categoryIds = [...new Set(apps.map(a => a.categoryId).filter(Boolean))];
  const categoriesMap = new Map<string, CategoryDoc>();
  for (let i = 0; i < categoryIds.length; i += 10) {
    const batch = categoryIds.slice(i, i + 10);
    const snap = await db().collection("categories").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => categoriesMap.set(d.id, { id: d.id, ...d.data() } as CategoryDoc));
  }
  const reviewCounts = new Map<string, number>();
  const downloadCounts = new Map<string, number>();
  const favoriteCounts = new Map<string, number>();
  if (apps.length > 0) {
    const appIds = apps.map(a => a.id);
    for (let i = 0; i < appIds.length; i += 10) {
      const batch = appIds.slice(i, i + 10);
      const reviewSnaps = await db().collection("reviews").where("applicationId", "in", batch).get();
      reviewSnaps.docs.forEach(d => {
        const aid = d.data().applicationId as string;
        reviewCounts.set(aid, (reviewCounts.get(aid) || 0) + 1);
      });
      const downloadSnaps = await db().collection("downloads").where("applicationId", "in", batch).get();
      downloadSnaps.docs.forEach(d => {
        const aid = d.data().applicationId as string;
        downloadCounts.set(aid, (downloadCounts.get(aid) || 0) + 1);
      });
      const favoriteSnaps = await db().collection("favorites").where("applicationId", "in", batch).get();
      favoriteSnaps.docs.forEach(d => {
        const aid = d.data().applicationId as string;
        favoriteCounts.set(aid, (favoriteCounts.get(aid) || 0) + 1);
      });
    }
  }
  return Promise.all(apps.map(async app => {
    const versions = await getVersions(app.id);
    const category = categoriesMap.get(app.categoryId);
    return {
      ...app,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      versions,
      _count: {
        reviews: reviewCounts.get(app.id) || 0,
        downloads: downloadCounts.get(app.id) || 0,
        favorites: favoriteCounts.get(app.id) || 0,
      },
    };
  }));
}

export async function getFavoritesWithApps(userId: string): Promise<(FavoriteDoc & { application: ApplicationDoc & { developer: { user: { username: string; avatar?: string } }; category: CategoryDoc; versions: VersionDoc[]; screenshots: ScreenshotDoc[]; _count: { reviews: number; downloads: number; favorites: number } } })[]> {
  const favoritesSnapshot = await db().collection("favorites").where("userId", "==", userId).orderBy("createdAt", "desc").get();
  const favorites = favoritesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as FavoriteDoc));
  const appIds = favorites.map(f => f.applicationId);
  if (appIds.length === 0) return [];
  const appsSnapshot = await db().collection("applications").where(FieldPath.documentId(), "in", appIds.slice(0, 10)).get();
  const apps = appsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  const developerIds = [...new Set(apps.map(a => a.developerId).filter(Boolean))];
  const developersMap = new Map<string, DeveloperDoc>();
  for (let i = 0; i < developerIds.length; i += 10) {
    const batch = developerIds.slice(i, i + 10);
    const snap = await db().collection("developers").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => developersMap.set(d.id, { id: d.id, ...d.data() } as DeveloperDoc));
  }
  const usersMap = new Map<string, UserDoc>();
  const devUserIds = [...new Set(developersMap.values().map(d => d.userId).filter(Boolean))];
  for (let i = 0; i < devUserIds.length; i += 10) {
    const batch = devUserIds.slice(i, i + 10);
    const snap = await db().collection("users").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => usersMap.set(d.id, { id: d.id, ...d.data() } as UserDoc));
  }
  const categoriesMap = new Map<string, CategoryDoc>();
  const categoryIds = [...new Set(apps.map(a => a.categoryId).filter(Boolean))];
  for (let i = 0; i < categoryIds.length; i += 10) {
    const batch = categoryIds.slice(i, i + 10);
    const snap = await db().collection("categories").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => categoriesMap.set(d.id, { id: d.id, ...d.data() } as CategoryDoc));
  }
  const reviewCounts = new Map<string, number>();
  const downloadCounts = new Map<string, number>();
  const favoriteCounts = new Map<string, number>();
  if (apps.length > 0) {
    const appIds = apps.map(a => a.id);
    for (let i = 0; i < appIds.length; i += 10) {
      const batch = appIds.slice(i, i + 10);
      const reviewSnaps = await db().collection("reviews").where("applicationId", "in", batch).get();
      reviewSnaps.docs.forEach(d => {
        const aid = d.data().applicationId as string;
        reviewCounts.set(aid, (reviewCounts.get(aid) || 0) + 1);
      });
      const downloadSnaps = await db().collection("downloads").where("applicationId", "in", batch).get();
      downloadSnaps.docs.forEach(d => {
        const aid = d.data().applicationId as string;
        downloadCounts.set(aid, (downloadCounts.get(aid) || 0) + 1);
      });
      const favoriteSnaps = await db().collection("favorites").where("applicationId", "in", batch).get();
      favoriteSnaps.docs.forEach(d => {
        const aid = d.data().applicationId as string;
        favoriteCounts.set(aid, (favoriteCounts.get(aid) || 0) + 1);
      });
    }
  }
  const appsMap = new Map(apps.map(a => [a.id, a]));
  return favorites.map(fav => {
    const app = appsMap.get(fav.applicationId);
    if (!app) return null as any;
    const developer = developersMap.get(app.developerId);
    const category = categoriesMap.get(app.categoryId);
    const user = developer ? usersMap.get(developer.userId) : undefined;
    return {
      ...fav,
      application: {
        ...app,
        developer: user ? { user: { username: user.username, avatar: user.avatar } } : { user: { username: "" } },
        category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
        versions: [],
        screenshots: [],
        _count: {
          reviews: reviewCounts.get(app.id) || 0,
          downloads: downloadCounts.get(app.id) || 0,
          favorites: favoriteCounts.get(app.id) || 0,
        },
      },
    };
  }).filter(Boolean) as any;
}

export async function getDeveloperWithApps(developerId: string): Promise<{ developer: DeveloperDoc & { user?: { username: string; avatar?: string }; appCount?: number }; apps: (ApplicationDoc & { category: CategoryDoc | null; versions: VersionDoc[]; _count: { reviews: number; downloads: number; favorites: number }; averageRating: number })[]; stats: { downloadCount: number; appCount: number; averageRating: number } } | null> {
  const devSnapshot = await db().collection("developers").where(FieldPath.documentId(), "==", developerId).limit(1).get();
  if (devSnapshot.empty) return null;
  const dev = { id: devSnapshot.docs[0].id, ...devSnapshot.docs[0].data() } as DeveloperDoc;
  const user = await getUserById(dev.userId);
  const appsSnapshot = await db().collection("applications").where("developerId", "==", dev.id).get();
  const apps = appsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  const categoryIds = [...new Set(apps.map(a => a.categoryId).filter(Boolean))];
  const categoriesMap = new Map<string, CategoryDoc>();
  for (let i = 0; i < categoryIds.length; i += 10) {
    const batch = categoryIds.slice(i, i + 10);
    const snap = await db().collection("categories").where(FieldPath.documentId(), "in", batch).get();
    snap.docs.forEach(d => categoriesMap.set(d.id, { id: d.id, ...d.data() } as CategoryDoc));
  }
  const reviewCounts = new Map<string, number>();
  const downloadCounts = new Map<string, number>();
  const favoriteCounts = new Map<string, number>();
  if (apps.length > 0) {
    const appIds = apps.map(a => a.id);
    const reviewSnaps = await db().collection("reviews").where("applicationId", "in", appIds.slice(0, 10)).get();
    reviewSnaps.docs.forEach(d => {
      const aid = d.data().applicationId as string;
      reviewCounts.set(aid, (reviewCounts.get(aid) || 0) + 1);
    });
    const downloadSnaps = await db().collection("downloads").where("applicationId", "in", appIds.slice(0, 10)).get();
    downloadSnaps.docs.forEach(d => {
      const aid = d.data().applicationId as string;
      downloadCounts.set(aid, (downloadCounts.get(aid) || 0) + 1);
    });
    const favoriteSnaps = await db().collection("favorites").where("applicationId", "in", appIds.slice(0, 10)).get();
    favoriteSnaps.docs.forEach(d => {
      const aid = d.data().applicationId as string;
      favoriteCounts.set(aid, (favoriteCounts.get(aid) || 0) + 1);
    });
  }
  const appsWithRating = await Promise.all(apps.map(async app => {
    const reviews = await getReviews(app.id);
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const versions = await getVersions(app.id);
    const category = categoriesMap.get(app.categoryId);
    return {
      ...app,
      category: category ? { id: category.id, name: category.name, slug: category.slug, createdAt: category.createdAt } : null,
      versions,
      averageRating: avgRating,
    };
  }));
  const totalDownloads = apps.reduce((sum, app) => sum + (downloadCounts.get(app.id) || 0), 0);
  const totalReviews = apps.reduce((sum, app) => sum + (reviewCounts.get(app.id) || 0), 0);
  const overallAvgRating = appsWithRating.length > 0 ? appsWithRating.reduce((sum, app) => sum + app.averageRating, 0) / appsWithRating.length : 0;
  return {
    developer: {
      ...dev,
      user: user ? { username: user.username, avatar: user.avatar } : undefined,
      appCount: apps.length,
    },
    apps: appsWithRating.map(app => ({
      ...app,
      _count: {
        reviews: reviewCounts.get(app.id) || 0,
        downloads: downloadCounts.get(app.id) || 0,
        favorites: favoriteCounts.get(app.id) || 0,
      },
    })),
    stats: {
      downloadCount: totalDownloads,
      appCount: apps.length,
      averageRating: overallAvgRating,
    },
  };
}

export async function getDeveloperStatsDetailed(developerId: string) {
  const appsSnapshot = await db().collection("applications").where("developerId", "==", developerId).get();
  const appIds = appsSnapshot.docs.map(d => d.id);
  let totalReviews = 0;
  let totalFavorites = 0;
  let totalDownloads = 0;
  for (let i = 0; i < appIds.length; i += 10) {
    const batch = appIds.slice(i, i + 10);
    const [reviewsSnap, favoritesSnap, downloadsSnap] = await Promise.all([
      db().collection("reviews").where("applicationId", "in", batch).get(),
      db().collection("favorites").where("applicationId", "in", batch).get(),
      db().collection("downloads").where("applicationId", "in", batch).get(),
    ]);
    totalReviews += reviewsSnap.size;
    totalFavorites += favoritesSnap.size;
    totalDownloads += downloadsSnap.size;
  }
  const recentDownloads = await db().collection("downloads").where("applicationId", "in", appIds.slice(0, 10)).orderBy("timestamp", "desc").limit(10).get();
  const downloadsWithApps = recentDownloads.docs.map(d => {
    const data = d.data() as any;
    return { ...data, id: d.id };
  });
  return {
    appCount: appsSnapshot.size,
    totalReviews,
    totalFavorites,
    totalDownloads,
    recentDownloads: downloadsWithApps,
  };
}

export async function getApplicationDetails(slug: string): Promise<(ApplicationDoc & { developer: { user: { username: string; avatar?: string } }; category: CategoryDoc | null; versions: VersionDoc[]; screenshots: ScreenshotDoc[]; reviews: ReviewDoc[]; _count: { reviews: number; downloads: number; favorites: number }; reviewCount: number }) | null> {
  const snapshot = await db().collection("applications").where("slug", "==", slug).limit(1).get();
  if (snapshot.empty) return null;
  const appDoc = snapshot.docs[0];
  const app = { id: appDoc.id, ...appDoc.data() } as ApplicationDoc;
  const developer = await getDeveloperByUserId(app.developerId);
  const category = await getCategoryById(app.categoryId);
  const versions = await getVersions(app.id);
  const screenshots = await getScreenshots(app.id);
  const allReviews = await getReviews(app.id);
  const reviews = allReviews.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, 20).map(r => ({
    ...r,
    user: { username: r.username, avatar: r.avatar },
  }));
  const reviewCount = allReviews.length;
  const averageRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
  const user = developer ? await getUserById(developer.userId) : null;
  return {
    ...app,
    developer: user ? { user: { username: user.username, avatar: user.avatar } } : { user: { username: "" } },
    category: category || null,
    versions,
    screenshots,
    reviews,
    _count: {
      reviews: reviewCount,
      downloads: app.downloadsCount || 0,
      favorites: app.favoritesCount || 0,
    },
    averageRating,
    reviewCount,
  };
}
