package com.expense.tracker.controller;

import com.expense.tracker.service.BudgetTargetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*")
public class BudgetController {
    @Autowired
    private BudgetTargetService budgetTargetService;

    @GetMapping("/target")
    public ResponseEntity<Map<String, Object>> getTarget(@RequestParam("month") String month) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month);
        BigDecimal amt = budgetTargetService.getTarget(userId, ym);
        return ResponseEntity.ok(Map.of("month", ym.toString(), "amount", amt));
    }

    @PutMapping("/target")
    public ResponseEntity<Map<String, Object>> setTarget(@RequestParam("month") String month,
                                                         @RequestBody Map<String, Object> body) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month);
        BigDecimal amount = new BigDecimal(String.valueOf(body.get("amount")));
        com.expense.tracker.entity.BudgetTarget saved = budgetTargetService.upsertTarget(userId, ym, amount);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "month", saved.getMonth(), "amount", saved.getAmount()));
    }
}
