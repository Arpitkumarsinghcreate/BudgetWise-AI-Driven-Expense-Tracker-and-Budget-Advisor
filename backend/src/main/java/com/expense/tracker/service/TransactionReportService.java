package com.expense.tracker.service;

import com.expense.tracker.entity.Transaction;
import com.expense.tracker.entity.TransactionStatus;
import com.expense.tracker.entity.TransactionType;
import com.expense.tracker.repository.TransactionRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class TransactionReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    public byte[] generateMonthlyReport(Long userId, YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        List<Transaction> items = transactionRepository.findByUserIdAndDateBetween(userId, start, end);

        BigDecimal totalIncome = items.stream()
                .filter(t -> t.getType() == TransactionType.INCOME && t.getStatus() == TransactionStatus.COMPLETED)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = items.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getStatus() == TransactionStatus.COMPLETED)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            PDRectangle rect = page.getMediaBox();
            float margin = 40;
            float y = rect.getUpperRightY() - margin;

            PDPageContentStream cs = new PDPageContentStream(doc, page);

            cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
            cs.beginText();
            cs.newLineAtOffset(margin, y);
            cs.showText("Transaction Report — " + month.toString());
            cs.endText();
            y -= 28;

            cs.setFont(PDType1Font.HELVETICA, 12);
            cs.beginText();
            cs.newLineAtOffset(margin, y);
            cs.showText("Total Income: " + totalIncome.toPlainString());
            cs.endText();
            y -= 18;
            cs.beginText();
            cs.newLineAtOffset(margin, y);
            cs.showText("Total Expense: " + totalExpense.toPlainString());
            cs.endText();
            y -= 18;
            cs.beginText();
            cs.newLineAtOffset(margin, y);
            cs.showText("Balance: " + balance.toPlainString());
            cs.endText();
            y -= 28;

            cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
            cs.beginText();
            cs.newLineAtOffset(margin, y);
            cs.showText("Date          Type      Category        Amount       Status    Description");
            cs.endText();
            y -= 16;
            cs.setFont(PDType1Font.HELVETICA, 11);

            for (Transaction t : items) {
                if (y < margin + 50) {
                    cs.close();
                    page = new PDPage(PDRectangle.A4);
                    doc.addPage(page);
                    rect = page.getMediaBox();
                    y = rect.getUpperRightY() - margin;
                    cs = new PDPageContentStream(doc, page);
                    cs.setFont(PDType1Font.HELVETICA, 11);
                }
                String line = String.format("%-12s %-8s %-14s %-11s %-9s %s",
                        t.getDate().toString(),
                        t.getType().name(),
                        truncate(t.getCategory(), 14),
                        t.getAmount().toPlainString(),
                        t.getStatus().name(),
                        truncate(t.getDescription(), 60));
                cs.beginText();
                cs.newLineAtOffset(margin, y);
                cs.showText(line);
                cs.endText();
                y -= 14;
            }

            cs.close();
            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private String truncate(String s, int len) {
        if (s == null) return "";
        return s.length() > len ? s.substring(0, len - 3) + "..." : s;
    }
}
