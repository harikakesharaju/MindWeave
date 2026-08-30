import apiFetch from "./apiFetch";

const imageCache = new Map();

export const getCachedProfileImage = async (userId) => {
  if (imageCache.has(userId)) {
    return imageCache.get(userId);
  }

  try {
    const response = await apiFetch(
      `/api/users/${userId}/profile-image`
    );

    if (!response.ok) {
      console.error(
        "Profile image request failed:",
        response.status,
        response.statusText
      );
      return null;
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      console.warn("Profile image response is empty");
      return null;
    }

    const objectUrl = URL.createObjectURL(blob);

    imageCache.set(userId, objectUrl);

    return objectUrl;
  } catch (err) {
    console.error("Failed to load profile image", err);
    return null;
  }
};

export const clearCachedProfileImage = (userId) => {
  if (imageCache.has(userId)) {
    URL.revokeObjectURL(imageCache.get(userId));
    imageCache.delete(userId);
  }
};