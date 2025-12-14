package com.myProjects.mindWeave.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.myProjects.mindWeave.entities.Chat;
import com.myProjects.mindWeave.entities.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatOrderByTimestampAsc(Chat chat);
    
    ChatMessage findTopByChatOrderByTimestampDesc(Chat chat);

    Long countByChatAndSender_UserIdNotAndReadFlagFalse(Chat chat, Long userId);
    
    @Modifying
    @Query("""
    UPDATE ChatMessage m
    SET m.readFlag = true
    WHERE m.chat = :chat
    AND m.sender.userId <> :userId
    AND m.readFlag = false
    """)
    void markMessagesAsRead(@Param("chat") Chat chat,
                            @Param("userId") Long userId);


}
