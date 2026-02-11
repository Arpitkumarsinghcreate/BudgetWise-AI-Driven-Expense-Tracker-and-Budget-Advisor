package com.expense.tracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class AIInsightsResponse {
    private BigDecimal savingsRate;
    private Integer healthScore;
    private String monthOverMonth;
    private List<SpendingWarning> warnings;
    private List<String> suggestions;

    public BigDecimal getSavingsRate() {
        return savingsRate;
    }

    public void setSavingsRate(BigDecimal savingsRate) {
        this.savingsRate = savingsRate;
    }

    public Integer getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(Integer healthScore) {
        this.healthScore = healthScore;
    }

    public String getMonthOverMonth() {
        return monthOverMonth;
    }

    public void setMonthOverMonth(String monthOverMonth) {
        this.monthOverMonth = monthOverMonth;
    }

    public List<SpendingWarning> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<SpendingWarning> warnings) {
        this.warnings = warnings;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}
