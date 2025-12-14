package com.myProjects.mindWeave.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public class ChatSummaryDto {
    private Long chatId;
    private Long otherUserId;
    private String otherUsername;
    private String otherProfilePictureUrl;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    
    public ChatSummaryDto() {}
    public Long getChatId() {
		return chatId;
	}
	public void setChatId(Long chatId) {
		this.chatId = chatId;
	}
	public Long getOtherUserId() {
		return otherUserId;
	}
	public void setOtherUserId(Long otherUserId) {
		this.otherUserId = otherUserId;
	}
	public ChatSummaryDto(Long chatId, Long otherUserId, String otherUsername, String otherProfilePictureUrl,
			String lastMessage, LocalDateTime lastMessageTime, Long unreadCount) {
		super();
		this.chatId = chatId;
		this.otherUserId = otherUserId;
		this.otherUsername = otherUsername;
		this.otherProfilePictureUrl = otherProfilePictureUrl;
		this.lastMessage = lastMessage;
		this.lastMessageTime = lastMessageTime;
		this.unreadCount = unreadCount;
	}
	public String getOtherUsername() {
		return otherUsername;
	}
	public void setOtherUsername(String otherUsername) {
		this.otherUsername = otherUsername;
	}
	public String getOtherProfilePictureUrl() {
		return otherProfilePictureUrl;
	}
	public void setOtherProfilePictureUrl(String otherProfilePictureUrl) {
		this.otherProfilePictureUrl = otherProfilePictureUrl;
	}
	public String getLastMessage() {
		return lastMessage;
	}
	public void setLastMessage(String lastMessage) {
		this.lastMessage = lastMessage;
	}
	public LocalDateTime getLastMessageTime() {
		return lastMessageTime;
	}
	public void setLastMessageTime(LocalDateTime lastMessageTime) {
		this.lastMessageTime = lastMessageTime;
	}
	public Long getUnreadCount() {
		return unreadCount;
	}
	public void setUnreadCount(Long unreadCount) {
		this.unreadCount = unreadCount;
	}
	private Long unreadCount;
}

