package com.expense.tracker.controller;

import com.expense.tracker.dto.UserSettingsRequest;
import com.expense.tracker.dto.UserSettingsResponse;
import com.expense.tracker.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping
    public ResponseEntity<UserSettingsResponse> get() {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(settingsService.getSettings(userId));
    }

    @PutMapping
    public ResponseEntity<UserSettingsResponse> update(@RequestBody UserSettingsRequest request) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(settingsService.updateSettings(userId, request));
    }
}
