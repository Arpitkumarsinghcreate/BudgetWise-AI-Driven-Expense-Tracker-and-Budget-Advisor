package com.expense.tracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private BigDecimal reservedBalance;
    private List<TrendPoint> dailyTrend;
    private List<CategoryAmount> categoryBreakdown;

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getReservedBalance() {
        return reservedBalance;
    }

    public void setReservedBalance(BigDecimal reservedBalance) {
        this.reservedBalance = reservedBalance;
    }

    public List<TrendPoint> getDailyTrend() {
        return dailyTrend;
    }

    public void setDailyTrend(List<TrendPoint> dailyTrend) {
        this.dailyTrend = dailyTrend;
    }

    public List<CategoryAmount> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<CategoryAmount> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }
}
