package com.expense.tracker.controller;

import com.expense.tracker.dto.TransactionRequest;
import com.expense.tracker.dto.TransactionResponse;
import com.expense.tracker.service.TransactionService;
import com.expense.tracker.service.TransactionReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;
    @Autowired
    private TransactionReportService transactionReportService;

    @PostMapping
    public ResponseEntity<TransactionResponse> add(@Valid @RequestBody TransactionRequest request) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(transactionService.addTransaction(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> listByMonth(@RequestParam("month") String month) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month);
        return ResponseEntity.ok(transactionService.getTransactionsByMonth(userId, ym));
    }

    @GetMapping("/report")
    public org.springframework.http.ResponseEntity<byte[]> report(@RequestParam("month") String month) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month);
        byte[] pdf = transactionReportService.generateMonthlyReport(userId, ym);
        return org.springframework.http.ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=transactions-" + month + ".pdf")
                .body(pdf);
    }

    @GetMapping("/reserved")
    public ResponseEntity<List<TransactionResponse>> listReserved(@RequestParam(value = "month", required = false) String month) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        if (month != null && !month.isBlank()) {
            YearMonth ym = YearMonth.parse(month);
            return ResponseEntity.ok(transactionService.getReservedTransactionsByMonth(userId, ym));
        }
        return ResponseEntity.ok(transactionService.getReservedTransactions(userId));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<TransactionResponse> complete(@PathVariable Long id) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(transactionService.completeReserved(userId, id));
    }

    @PostMapping("/{id}/revert")
    public ResponseEntity<TransactionResponse> revert(@PathVariable Long id) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(transactionService.revertReserved(userId, id));
    }
}
