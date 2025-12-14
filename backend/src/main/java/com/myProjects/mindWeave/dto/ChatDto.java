package com.myProjects.mindWeave.dto;

public class ChatDto {
    private Long chatId;
    private Long otherUserId;
    private String otherUsername;
    private String otherProfilePictureUrl;

    // getters/setters
    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public Long getOtherUserId() { return otherUserId; }
    public void setOtherUserId(Long otherUserId) { this.otherUserId = otherUserId; }

    public String getOtherUsername() { return otherUsername; }
    public void setOtherUsername(String otherUsername) { this.otherUsername = otherUsername; }

    public String getOtherProfilePictureUrl() { return otherProfilePictureUrl; }
    public void setOtherProfilePictureUrl(String otherProfilePictureUrl) { this.otherProfilePictureUrl = otherProfilePictureUrl; }
}
