package com.expense.tracker.service;

import com.expense.tracker.dto.DashboardSummaryResponse;
import com.expense.tracker.dto.TrendPoint;
import com.expense.tracker.entity.Transaction;
import com.expense.tracker.entity.TransactionStatus;
import com.expense.tracker.entity.TransactionType;
import com.expense.tracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    public DashboardSummaryResponse getSummary(Long userId, YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        List<Transaction> monthly = transactionRepository.findByUserIdAndDateBetween(userId, start, end);

        BigDecimal totalIncome = sumByTypeAndStatus(monthly, TransactionType.INCOME, TransactionStatus.COMPLETED);
        BigDecimal totalExpense = sumByTypeAndStatus(monthly, TransactionType.EXPENSE, TransactionStatus.COMPLETED);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        BigDecimal reservedIncome = sumByReservedAndType(monthly, true, TransactionType.INCOME, TransactionStatus.PENDING);
        BigDecimal reservedExpense = sumByReservedAndType(monthly, true, TransactionType.EXPENSE, TransactionStatus.PENDING);
        BigDecimal reservedBalance = reservedIncome.subtract(reservedExpense);

        List<TrendPoint> trend = buildDailyTrend(month, monthly);
        List<com.expense.tracker.dto.CategoryAmount> breakdown = buildCategoryBreakdown(monthly);

        DashboardSummaryResponse resp = new DashboardSummaryResponse();
        resp.setTotalIncome(totalIncome);
        resp.setTotalExpense(totalExpense);
        resp.setBalance(balance);
        resp.setReservedBalance(reservedBalance);
        resp.setDailyTrend(trend);
        resp.setCategoryBreakdown(breakdown);
        return resp;
    }

    private BigDecimal sumByTypeAndStatus(List<Transaction> list, TransactionType type, TransactionStatus status) {
        return list.stream()
                .filter(t -> t.getType() == type && t.getStatus() == status)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumByReservedAndType(List<Transaction> list, boolean reserved, TransactionType type, TransactionStatus status) {
        return list.stream()
                .filter(t -> t.isReserved() == reserved && t.getType() == type && t.getStatus() == status)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<TrendPoint> buildDailyTrend(YearMonth month, List<Transaction> list) {
        Map<LocalDate, BigDecimal> incomeByDay = new HashMap<>();
        Map<LocalDate, BigDecimal> expenseByDay = new HashMap<>();
        for (Transaction t : list) {
            if (t.getStatus() != TransactionStatus.COMPLETED) continue;
            LocalDate d = t.getDate();
            if (t.getType() == TransactionType.INCOME) {
                incomeByDay.put(d, incomeByDay.getOrDefault(d, BigDecimal.ZERO).add(t.getAmount()));
            } else {
                expenseByDay.put(d, expenseByDay.getOrDefault(d, BigDecimal.ZERO).add(t.getAmount()));
            }
        }
        List<TrendPoint> points = new ArrayList<>();
        for (int day = 1; day <= month.lengthOfMonth(); day++) {
            LocalDate d = month.atDay(day);
            TrendPoint p = new TrendPoint();
            p.setDate(d.toString());
            p.setIncome(incomeByDay.getOrDefault(d, BigDecimal.ZERO));
            p.setExpense(expenseByDay.getOrDefault(d, BigDecimal.ZERO));
            points.add(p);
        }
        return points;
    }

    private List<com.expense.tracker.dto.CategoryAmount> buildCategoryBreakdown(List<Transaction> list) {
        Map<String, BigDecimal> agg = new HashMap<>();
        for (Transaction t : list) {
            if (t.getType() == TransactionType.EXPENSE && t.getStatus() == TransactionStatus.COMPLETED) {
                agg.put(t.getCategory(), agg.getOrDefault(t.getCategory(), BigDecimal.ZERO).add(t.getAmount()));
            }
        }
        return agg.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .map(e -> new com.expense.tracker.dto.CategoryAmount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }
}
