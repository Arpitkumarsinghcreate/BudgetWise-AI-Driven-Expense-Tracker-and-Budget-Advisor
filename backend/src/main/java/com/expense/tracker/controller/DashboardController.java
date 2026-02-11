package com.expense.tracker.controller;

import com.expense.tracker.dto.DashboardSummaryResponse;
import com.expense.tracker.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> summary(@RequestParam("month") String month) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month);
        return ResponseEntity.ok(dashboardService.getSummary(userId, ym));
    }
}
