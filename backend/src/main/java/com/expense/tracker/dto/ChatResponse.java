package com.expense.tracker.dto;

import java.util.List;
import java.util.Map;

public class ChatResponse {
    private String reply;
    private int promptTokens;
    private int completionTokens;
    private int totalTokens;
    private List<String> suggestions;
    private List<String> risks;
    private Map<String, Object> goalProgress;

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public int getPromptTokens() {
        return promptTokens;
    }

    public void setPromptTokens(int promptTokens) {
        this.promptTokens = promptTokens;
    }

    public int getCompletionTokens() {
        return completionTokens;
    }

    public void setCompletionTokens(int completionTokens) {
        this.completionTokens = completionTokens;
    }

    public int getTotalTokens() {
        return totalTokens;
    }

    public void setTotalTokens(int totalTokens) {
        this.totalTokens = totalTokens;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<String> getRisks() {
        return risks;
    }

    public void setRisks(List<String> risks) {
        this.risks = risks;
    }

    public Map<String, Object> getGoalProgress() {
        return goalProgress;
    }

    public void setGoalProgress(Map<String, Object> goalProgress) {
        this.goalProgress = goalProgress;
    }
}
