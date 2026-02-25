package com.expense.tracker.dto;

public class ChatRequest {
    private String message;
    private String toneMode;
    private String month;
    private boolean includeGoals;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToneMode() {
        return toneMode;
    }

    public void setToneMode(String toneMode) {
        this.toneMode = toneMode;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public boolean isIncludeGoals() {
        return includeGoals;
    }

    public void setIncludeGoals(boolean includeGoals) {
        this.includeGoals = includeGoals;
    }
}
