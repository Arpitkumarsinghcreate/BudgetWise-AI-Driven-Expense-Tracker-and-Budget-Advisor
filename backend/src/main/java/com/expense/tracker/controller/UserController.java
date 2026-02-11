package com.expense.tracker.controller;

import com.expense.tracker.dto.ProfileResponse;
import com.expense.tracker.dto.ProfileUpdateRequest;
import com.expense.tracker.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*")
public class UserController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> me() {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(userProfileService.getProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> update(@Valid @RequestBody ProfileUpdateRequest request) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(userProfileService.updateProfile(userId, request));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<ProfileResponse> uploadPhoto(@RequestParam("file") MultipartFile file) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(userProfileService.uploadPhoto(userId, file));
    }
}
