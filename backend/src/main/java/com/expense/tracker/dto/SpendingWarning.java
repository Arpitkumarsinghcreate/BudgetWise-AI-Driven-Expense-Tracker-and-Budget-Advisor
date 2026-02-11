package com.expense.tracker.dto;

import java.math.BigDecimal;

public class SpendingWarning {
    private String category;
    private BigDecimal percent;

    public SpendingWarning() {}

    public SpendingWarning(String category, BigDecimal percent) {
        this.category = category;
        this.percent = percent;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getPercent() {
        return percent;
    }

    public void setPercent(BigDecimal percent) {
        this.percent = percent;
    }
}
