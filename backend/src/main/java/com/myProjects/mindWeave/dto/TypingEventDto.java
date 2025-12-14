// TypingEventDto.java
package com.myProjects.mindWeave.dto;

public class TypingEventDto {
    private Long chatId;
    private Long senderId;
    private boolean typing;

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public boolean isTyping() { return typing; }
    public void setTyping(boolean typing) { this.typing = typing; }
}
