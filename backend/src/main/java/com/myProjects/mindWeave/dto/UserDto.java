package com.myProjects.mindWeave.dto;

import lombok.Data;

import java.util.List;

//@Data
public class UserDto {
    private Long userId;
    private String email;
    private String username;
    private String description;
    private String profilePictureUrl;
    private List<Long> follows; // List of user IDs this user follows
    private List<Long> followers; // List of user IDs that follow this user
    private boolean hasSentRequestTo;
    private boolean hasSentRequestToMe;
    
    private boolean hasProfileImage;


    public boolean isHasProfileImage() {
		return hasProfileImage;
	}

	public void setHasProfileImage(boolean hasProfileImage) {
		this.hasProfileImage = hasProfileImage;
	}

	public boolean isHasSentRequestToMe() {
        return hasSentRequestToMe;
    }

    public void setHasSentRequestToMe(boolean hasSentRequestToMe) {
        this.hasSentRequestToMe = hasSentRequestToMe;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public List<Long> getFollows() {
        return follows;
    }

    public void setFollows(List<Long> follows) {
        this.follows = follows;
    }

    public List<Long> getFollowers() {
        return followers;
    }

    public void setFollowers(List<Long> followers) {
        this.followers = followers;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isHasSentRequestTo() {
        return hasSentRequestTo;
    }

    public void setHasSentRequestTo(boolean hasSentRequestTo) {
        this.hasSentRequestTo = hasSentRequestTo;
    }
}