package com.expense.tracker.service;

import com.expense.tracker.dto.UserSettingsRequest;
import com.expense.tracker.dto.UserSettingsResponse;
import com.expense.tracker.entity.ThemeMode;
import com.expense.tracker.entity.UserSettings;
import com.expense.tracker.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    public UserSettingsResponse getSettings(Long userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserSettings def = new UserSettings();
                    def.setUserId(userId);
                    return userSettingsRepository.save(def);
                });
        return toResponse(settings);
    }

    @Transactional
    public UserSettingsResponse updateSettings(Long userId, UserSettingsRequest request) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserSettings def = new UserSettings();
                    def.setUserId(userId);
                    return def;
                });
        if (request.getCurrency() != null) settings.setCurrency(request.getCurrency());
        if (request.getDateFormat() != null) settings.setDateFormat(request.getDateFormat());
        if (request.getLanguage() != null) settings.setLanguage(request.getLanguage());
        if (request.getThemeMode() != null) settings.setThemeMode(ThemeMode.valueOf(request.getThemeMode().toUpperCase()));
        if (request.getAccentColor() != null) settings.setAccentColor(request.getAccentColor());
        if (request.getFontSize() != null) settings.setFontSize(request.getFontSize());
        userSettingsRepository.save(settings);
        return toResponse(settings);
    }

    private UserSettingsResponse toResponse(UserSettings s) {
        UserSettingsResponse resp = new UserSettingsResponse();
        resp.setCurrency(s.getCurrency());
        resp.setDateFormat(s.getDateFormat());
        resp.setLanguage(s.getLanguage());
        resp.setThemeMode(s.getThemeMode().name());
        resp.setAccentColor(s.getAccentColor());
        resp.setFontSize(s.getFontSize());
        return resp;
    }
}
