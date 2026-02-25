package com.expense.tracker.service;

import com.expense.tracker.dto.AIInsightsResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RiskAnalyzerService {
    public List<String> analyze(AIInsightsResponse insights) {
        List<String> risks = new ArrayList<>();
        if (insights == null) return risks;
        if (insights.getSavingsRate() != null) {
            try {
                double rate = insights.getSavingsRate().doubleValue();
                if (rate < 20.0) risks.add("Low savings rate");
            } catch (Exception ignored) {}
        }
        if (insights.getWarnings() != null && !insights.getWarnings().isEmpty()) {
            risks.add("High category concentration");
        }
        return risks;
    }
}
