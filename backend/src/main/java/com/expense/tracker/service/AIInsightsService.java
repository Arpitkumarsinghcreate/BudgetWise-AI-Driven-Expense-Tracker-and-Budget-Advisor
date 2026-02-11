package com.expense.tracker.service;

import com.expense.tracker.dto.AIInsightsResponse;
import com.expense.tracker.dto.SpendingWarning;
import com.expense.tracker.entity.Transaction;
import com.expense.tracker.entity.TransactionStatus;
import com.expense.tracker.entity.TransactionType;
import com.expense.tracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIInsightsService {

    @Autowired
    private TransactionRepository transactionRepository;

    public AIInsightsResponse getInsights(Long userId, YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        List<Transaction> current = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        YearMonth prev = month.minusMonths(1);
        List<Transaction> previous = transactionRepository.findByUserIdAndDateBetween(userId, prev.atDay(1), prev.atEndOfMonth());

        BigDecimal income = sum(current, TransactionType.INCOME, TransactionStatus.COMPLETED);
        BigDecimal expense = sum(current, TransactionType.EXPENSE, TransactionStatus.COMPLETED);
        BigDecimal savings = income.subtract(expense).max(BigDecimal.ZERO);
        BigDecimal savingsRate = income.compareTo(BigDecimal.ZERO) > 0
                ? savings.multiply(BigDecimal.valueOf(100)).divide(income, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, BigDecimal> byCategory = aggregateCategories(current);
        BigDecimal totalExpense = expense.max(BigDecimal.ONE);
        List<SpendingWarning> warnings = byCategory.entrySet().stream()
                .map(e -> new SpendingWarning(e.getKey(),
                        e.getValue().multiply(BigDecimal.valueOf(100)).divide(totalExpense, 2, RoundingMode.HALF_UP)))
                .filter(w -> w.getPercent().compareTo(BigDecimal.valueOf(40)) > 0)
                .sorted(Comparator.comparing(SpendingWarning::getPercent).reversed())
                .collect(Collectors.toList());

        BigDecimal prevIncome = sum(previous, TransactionType.INCOME, TransactionStatus.COMPLETED);
        BigDecimal prevExpense = sum(previous, TransactionType.EXPENSE, TransactionStatus.COMPLETED);
        BigDecimal prevSavings = prevIncome.subtract(prevExpense).max(BigDecimal.ZERO);
        BigDecimal prevRate = prevIncome.compareTo(BigDecimal.ZERO) > 0
                ? prevSavings.multiply(BigDecimal.valueOf(100)).divide(prevIncome, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String mom;
        int cmp = savingsRate.compareTo(prevRate);
        if (cmp > 0) {
            mom = "Savings rate improved vs last month";
        } else if (cmp < 0) {
            mom = "Savings rate declined vs last month";
        } else {
            mom = "Savings rate unchanged vs last month";
        }

        List<String> suggestions = new ArrayList<>();
        if (savingsRate.compareTo(BigDecimal.valueOf(20)) < 0) {
            suggestions.add("Increase savings rate above 20%");
        }
        if (!warnings.isEmpty()) {
            SpendingWarning top = warnings.get(0);
            suggestions.add("Reduce spend in " + top.getCategory());
        }

        BigDecimal maxCatPercent = warnings.isEmpty()
                ? BigDecimal.ZERO
                : warnings.get(0).getPercent();
        int score = clamp(0, 100, (int) Math.round(60 + savingsRate.doubleValue()/2 - maxCatPercent.doubleValue()/2));

        AIInsightsResponse resp = new AIInsightsResponse();
        resp.setSavingsRate(savingsRate);
        resp.setHealthScore(score);
        resp.setMonthOverMonth(mom);
        resp.setWarnings(warnings);
        resp.setSuggestions(suggestions);
        return resp;
    }

    private BigDecimal sum(List<Transaction> list, TransactionType type, TransactionStatus status) {
        return list.stream()
                .filter(t -> t.getType() == type && t.getStatus() == status)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Map<String, BigDecimal> aggregateCategories(List<Transaction> list) {
        Map<String, BigDecimal> m = new HashMap<>();
        for (Transaction t : list) {
            if (t.getType() == TransactionType.EXPENSE && t.getStatus() == TransactionStatus.COMPLETED) {
                m.put(t.getCategory(), m.getOrDefault(t.getCategory(), BigDecimal.ZERO).add(t.getAmount()));
            }
        }
        return m;
    }

    private int clamp(int min, int max, int v) {
        return Math.max(min, Math.min(max, v));
    }
}
