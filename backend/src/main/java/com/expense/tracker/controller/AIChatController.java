package com.expense.tracker.controller;

import com.expense.tracker.dto.ChatRequest;
import com.expense.tracker.dto.ChatResponse;
import com.expense.tracker.service.AIChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*")
public class AIChatController {
    @Autowired
    private AIChatService aiChatService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        ChatResponse resp = aiChatService.chat(userId, request);
        return ResponseEntity.ok(resp);
    }
}
