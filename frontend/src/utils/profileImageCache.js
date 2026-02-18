const imageCache = new Map();

export const getCachedProfileImage = async (userId, baseUrl) => {
  if (imageCache.has(userId)) {
    return imageCache.get(userId);
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/users/${userId}/profile-image`
    );

    if (!response.ok) return null;

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    imageCache.set(userId, objectUrl);
    return objectUrl;
  } catch (err) {
    console.error("Failed to load profile image", err);
    return null;
  }
};
