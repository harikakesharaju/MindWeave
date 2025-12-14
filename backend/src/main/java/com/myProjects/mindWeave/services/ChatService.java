package com.myProjects.mindWeave.services;

import java.util.List;
import com.myProjects.mindWeave.dto.ChatDto;
import com.myProjects.mindWeave.dto.ChatMessageDto;
import com.myProjects.mindWeave.dto.ChatSummaryDto;

public interface ChatService {

    ChatDto getOrCreateChat(Long userAId, Long userBId);

    List<ChatMessageDto> getMessages(Long chatId);

    ChatMessageDto saveMessage(Long chatId, Long senderId, String content);

    // ⭐ ADD THIS
    List<ChatSummaryDto> getChatsForUser(Long userId);

	void markChatAsRead(Long chatId, Long userId);
}
