package com.myProjects.mindWeave.dto;

import java.time.LocalDateTime;

public class ReactionNotificationDto {
    private Long postId;
    private String postHeading; // To quickly identify the post
    private Long reactingUserId;
    private String reactingUsername;
    private String reactionType; // "LIKE" or "DISLIKE"
    private LocalDateTime timestamp;

    // --- Constructor, Getters, and Setters ---
    // (You will need to add these, or use Lombok's @Data)

    public ReactionNotificationDto() {}

    public ReactionNotificationDto(Long postId, String postHeading, Long reactingUserId, String reactingUsername, String reactionType, LocalDateTime timestamp) {
        this.postId = postId;
        this.postHeading = postHeading;
        this.reactingUserId = reactingUserId;
        this.reactingUsername = reactingUsername;
        this.reactionType = reactionType;
        this.timestamp = timestamp;
    }

    // Getters and Setters:
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public String getPostHeading() { return postHeading; }
    public void setPostHeading(String postHeading) { this.postHeading = postHeading; }
    public Long getReactingUserId() { return reactingUserId; }
    public void setReactingUserId(Long reactingUserId) { this.reactingUserId = reactingUserId; }
    public String getReactingUsername() { return reactingUsername; }
    public void setReactingUsername(String reactingUsername) { this.reactingUsername = reactingUsername; }
    public String getReactionType() { return reactionType; }
    public void setReactionType(String reactionType) { this.reactionType = reactionType; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}