package com.expense.tracker.controller;

import com.expense.tracker.service.TransactionReportService;
import com.expense.tracker.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*")
public class ReportsController {

    @Autowired
    private TransactionService transactionService;
    @Autowired
    private TransactionReportService transactionReportService;

    @GetMapping("/monthly")
    public ResponseEntity<byte[]> monthly(@RequestParam("month") String month,
                                          @RequestParam(value = "type", defaultValue = "csv") String type) {
        Long userId = com.expense.tracker.security.SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month);
        if ("pdf".equalsIgnoreCase(type)) {
            byte[] pdf = transactionReportService.generateMonthlyReport(userId, ym);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=transactions-" + month + ".pdf")
                    .body(pdf);
        } else {
            List<com.expense.tracker.dto.TransactionResponse> items = transactionService.getTransactionsByMonth(userId, ym);
            StringBuilder sb = new StringBuilder();
            sb.append("Date,Type,Category,Amount,Description,Status\n");
            for (com.expense.tracker.dto.TransactionResponse t : items) {
                sb.append(escape(t.getDate().toString())).append(",");
                sb.append(escape(t.getType())).append(",");
                sb.append(escape(t.getCategory())).append(",");
                sb.append(t.getAmount().toPlainString()).append(",");
                sb.append(escape(t.getDescription())).append(",");
                sb.append(escape(t.getStatus())).append("\n");
            }
            byte[] csv = sb.toString().getBytes(StandardCharsets.UTF_8);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv; charset=UTF-8")
                    .header("Content-Disposition", "attachment; filename=transactions-" + month + ".csv")
                    .body(csv);
        }
    }

    private String escape(String s) {
        if (s == null) return "";
        boolean needQuotes = s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r");
        String escaped = s.replace("\"", "\"\"");
        return needQuotes ? ("\"" + escaped + "\"") : escaped;
    }
}
