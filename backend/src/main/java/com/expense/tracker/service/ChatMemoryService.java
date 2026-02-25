package com.expense.tracker.service;

import com.expense.tracker.entity.ChatMessage;
import com.expense.tracker.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatMemoryService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public List<ChatMessage> lastMessages(Long userId) {
        return chatMessageRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
    }

    public void saveMessage(ChatMessage msg) {
        chatMessageRepository.save(msg);
    }
}
