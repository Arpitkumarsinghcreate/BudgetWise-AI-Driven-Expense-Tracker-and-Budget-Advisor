package com.expense.tracker.controller;

import com.expense.tracker.dto.AIInsightsResponse;
import com.expense.tracker.service.AIInsightsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*")
public class AIController {

    @Autowired
    private AIInsightsService aiInsightsService;

    @GetMapping("/insights")
    public ResponseEntity<AIInsightsResponse> insights(@RequestParam("month") String month) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month);
        return ResponseEntity.ok(aiInsightsService.getInsights(userId, ym));
    }
}
