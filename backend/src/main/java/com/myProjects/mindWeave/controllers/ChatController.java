package com.myProjects.mindWeave.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myProjects.mindWeave.dto.ChatDto;
import com.myProjects.mindWeave.dto.ChatMessageDto;
import com.myProjects.mindWeave.dto.ChatMessageRequest;
import com.myProjects.mindWeave.dto.ChatSummaryDto;
import com.myProjects.mindWeave.dto.TypingEventDto;
import com.myProjects.mindWeave.services.ChatService;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    // 1) Get or create chat between logged-in user and other user
    @PostMapping("/with/{otherUserId}")
    public ResponseEntity<ChatDto> getOrCreateChat(
            @RequestHeader("loggedInUserId") Long loggedInUserId,
            @PathVariable Long otherUserId) {

        ChatDto dto = chatService.getOrCreateChat(loggedInUserId, otherUserId);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    // 2) Load messages for a chat
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(@PathVariable Long chatId) {
        List<ChatMessageDto> messages = chatService.getMessages(chatId);
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }

    // 3) WebSocket: send message
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageRequest request) {
        ChatMessageDto saved = chatService.saveMessage(
                request.getChatId(),
                request.getSenderId(),
                request.getContent());

        // Broadcast to both users subscribed to /topic/chat/{chatId}
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getChatId(), saved);
    }

    // 4) WebSocket: typing indicator
    @MessageMapping("/chat.typing")
    public void typing(TypingEventDto typingEvent) {
        // just forward event to /topic/chat/{chatId}/typing
        messagingTemplate.convertAndSend("/topic/chat/" + typingEvent.getChatId() + "/typing", typingEvent);
    }
    
    @GetMapping("/user/{userId}/chats")
    public List<ChatSummaryDto> getUserChats(@PathVariable Long userId) {
        return chatService.getChatsForUser(userId);
    }
    
    @PostMapping("/{chatId}/read")
    public ResponseEntity<Void> markChatRead(
            @PathVariable Long chatId,
            @RequestHeader("loggedInUserId") Long userId) {

        chatService.markChatAsRead(chatId, userId);
        return ResponseEntity.ok().build();
    }


}
