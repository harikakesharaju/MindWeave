package com.myProjects.mindWeave.services;

/**
 * Service dedicated to interacting with AI models for image generation.
 */
public interface AiImageService {

    /**
     * Generates an image based on the post content and returns the public URL.
     * * @param heading The main heading of the post.
     * @param content The main content/body of the post.
     * @return The public URL (String) of the generated image, or an empty string if generation fails.
     */
    String generatePostImage(String heading, String content);
}