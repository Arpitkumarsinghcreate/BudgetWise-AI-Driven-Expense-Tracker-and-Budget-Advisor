package com.expense.tracker.service;

import com.expense.tracker.dto.ProfileResponse;
import com.expense.tracker.dto.ProfileUpdateRequest;
import com.expense.tracker.entity.User;
import com.expense.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getName() != null) user.setName(request.getName());
        if (request.getContact() != null) user.setContact(request.getContact());
        if (request.getBio() != null) user.setBio(request.getBio());
        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public ProfileResponse uploadPhoto(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file uploaded");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            Path dir = Path.of(uploadDir, "profile-photos");
            Files.createDirectories(dir);
            String ext = getExtension(file.getOriginalFilename());
            String filename = "user-" + userId + "-" + System.currentTimeMillis() + (ext.isEmpty() ? "" : "." + ext);
            Path dest = dir.resolve(filename);
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            user.setProfileImageUrl("/uploads/profile-photos/" + filename);
            userRepository.save(user);
            return toResponse(user);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file");
        }
    }

    private String getExtension(String name) {
        if (name == null) return "";
        int idx = name.lastIndexOf('.');
        if (idx == -1) return "";
        return name.substring(idx + 1);
    }

    private ProfileResponse toResponse(User user) {
        ProfileResponse resp = new ProfileResponse();
        resp.setName(user.getName());
        resp.setEmail(user.getEmail());
        resp.setContact(user.getContact());
        resp.setBio(user.getBio());
        resp.setProfileImageUrl(user.getProfileImageUrl());
        return resp;
    }
}
