package com.myProjects.mindWeave.dto;

public class LoginResponse {
    private Long userId;
    private String username;
    private String email;
    private String description;
    private String profilePictureUrl;
    private boolean hasProfileImage;
    private String token;

    public LoginResponse() {}

    public LoginResponse(Long userId, String username, String email,
                         String description, String profilePictureUrl,
                         boolean hasProfileImage, String token) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.description = description;
        this.profilePictureUrl = profilePictureUrl;
        this.hasProfileImage = hasProfileImage;
        this.token = token;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String url) { this.profilePictureUrl = url; }

    public boolean isHasProfileImage() { return hasProfileImage; }
    public void setHasProfileImage(boolean hasProfileImage) { this.hasProfileImage = hasProfileImage; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
