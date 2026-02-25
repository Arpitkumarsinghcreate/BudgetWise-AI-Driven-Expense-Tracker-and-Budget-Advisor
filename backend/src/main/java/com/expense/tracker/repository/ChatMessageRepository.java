package com.expense.tracker.repository;

import com.expense.tracker.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);
}
