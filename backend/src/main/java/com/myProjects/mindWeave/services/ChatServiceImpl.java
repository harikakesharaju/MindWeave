package com.myProjects.mindWeave.services;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.myProjects.mindWeave.dto.ChatDto;
import com.myProjects.mindWeave.dto.ChatMessageDto;
import com.myProjects.mindWeave.dto.ChatSummaryDto;
import com.myProjects.mindWeave.entities.Chat;
import com.myProjects.mindWeave.entities.ChatMessage;
import com.myProjects.mindWeave.entities.User;
import com.myProjects.mindWeave.repositories.ChatMessageRepository;
import com.myProjects.mindWeave.repositories.ChatRepository;
import com.myProjects.mindWeave.repositories.UserRepository;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatServiceImpl(ChatRepository chatRepository,
                           ChatMessageRepository chatMessageRepository,
                           UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ChatDto getOrCreateChat(Long userAId, Long userBId) {
        if (userAId.equals(userBId)) {
            throw new IllegalArgumentException("Cannot chat with yourself");
        }

        User userA = userRepository.findById(userAId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userAId));
        User userB = userRepository.findById(userBId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userBId));

        // Normalize order
        User first = userA.getUserId() < userB.getUserId() ? userA : userB;
        User second = first == userA ? userB : userA;

        Optional<Chat> existing = chatRepository.findByUser1AndUser2(first, second);

        Chat chat = existing.orElseGet(() -> {
            Chat c = new Chat();
            c.setUser1(first);
            c.setUser2(second);
            return chatRepository.save(c);
        });

        // map to ChatDto from perspective of userA
        User other = userA.getUserId().equals(chat.getUser1().getUserId())
                ? chat.getUser2()
                : chat.getUser1();

        ChatDto dto = new ChatDto();
        dto.setChatId(chat.getChatId());
        dto.setOtherUserId(other.getUserId());
        dto.setOtherUsername(other.getUsername());
        dto.setOtherProfilePictureUrl(other.getProfilePictureUrl());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessages(Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found: " + chatId));

        List<ChatMessage> messages = chatMessageRepository.findByChatOrderByTimestampAsc(chat);

        return messages.stream()
                .sorted(Comparator.comparing(ChatMessage::getTimestamp))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChatMessageDto saveMessage(Long chatId, Long senderId, String content) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found: " + chatId));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));

        ChatMessage m = new ChatMessage();
        m.setChat(chat);
        m.setSender(sender);
        m.setContent(content);

        ChatMessage saved = chatMessageRepository.save(m);
        return toDto(saved);
    }

    private ChatMessageDto toDto(ChatMessage m) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setMessageId(m.getMessageId());
        dto.setChatId(m.getChat().getChatId());
        dto.setSenderId(m.getSender().getUserId());
        dto.setSenderUsername(m.getSender().getUsername());
        dto.setContent(m.getContent());
        dto.setTimestamp(m.getTimestamp());
        return dto;
    }
    
    public List<ChatSummaryDto> getChatsForUser(Long userId) {
        List<Chat> chats = chatRepository.findAllByUser(userId);

        List<ChatSummaryDto> dtoList = new ArrayList<>();

        for (Chat chat : chats) {

            User other = chat.getUser1().getUserId() == userId
                    ? chat.getUser2()
                    : chat.getUser1();

            ChatMessage lastMsg = chatMessageRepository.findTopByChatOrderByTimestampDesc(chat);

            Long unread = chatMessageRepository.countByChatAndSender_UserIdNotAndReadFlagFalse
(chat, userId);

            dtoList.add(new ChatSummaryDto(
                    chat.getChatId(),
                    other.getUserId(),
                    other.getUsername(),
                    other.getProfilePictureUrl(),
                    lastMsg != null ? lastMsg.getContent() : null,
                    lastMsg != null ? lastMsg.getTimestamp() : null,
                    unread
            ));
        }

        // Sort by latest message first
        dtoList.sort(Comparator.comparing(ChatSummaryDto::getLastMessageTime, Comparator.nullsLast(Comparator.reverseOrder())));

        return dtoList;
    }
    
    @Transactional
    public void markChatAsRead(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        chatMessageRepository.markMessagesAsRead(chat, userId);
    }


}
