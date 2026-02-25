package com.expense.tracker.service;

import com.expense.tracker.dto.AIInsightsResponse;
import com.expense.tracker.dto.ChatRequest;
import com.expense.tracker.entity.ChatMessage;
import com.expense.tracker.entity.UserGoal;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PromptBuilderService {
    public String buildPrompt(String tone, ChatRequest req, AIInsightsResponse insights, List<String> risks, List<UserGoal> goals, List<ChatMessage> memory) {
        StringBuilder sb = new StringBuilder();
        String system = buildSystem(tone);
        sb.append(system).append("\n");
        String context = buildContext(insights, risks, goals, memory, req.getMonth());
        if (!context.isEmpty()) {
            sb.append(context).append("\n");
        }
        sb.append("User: ").append(req.getMessage());
        return sb.toString();
    }

    private String buildSystem(String tone) {
    String t = tone == null ? "Professional" : tone;

    return """
You are BudgetWise AI — an intelligent financial assistant embedded inside a personal expense tracker application.

Role:
- Analyze user's financial health using provided context.
- Give personalized advice based on actual savings rate, health score, risks, and goals.
""" 
+ "- Be " + t + " in tone.\n\n"
+ """
Rules:
- Avoid generic financial advice.
- Always refer to provided data (HealthScore, SavingsRate, Goals).
- Give step-by-step, prioritized, actionable suggestions.
- Use INR currency format.
- Use YYYY-MM date format.
- If a savings goal is provided, calculate required monthly savings and suggest strategy.
- Keep response structured using bullet points or numbered lists.
- Be practical and realistic.
""";
}

    private String buildContext(AIInsightsResponse insights, List<String> risks, List<UserGoal> goals, List<ChatMessage> memory, String month) {
        StringBuilder sb = new StringBuilder();
        if (month != null) sb.append("Month ").append(month).append(". ");
        if (insights != null) {
            sb.append("HealthScore ").append(insights.getHealthScore()).append(". ");
            sb.append("SavingsRate ").append(insights.getSavingsRate()).append(". ");
            sb.append("MoM ").append(insights.getMonthOverMonth()).append(". ");
            if (insights.getBudgetTarget() != null && insights.getBudgetTarget().doubleValue() > 0) {
                sb.append("BudgetTarget ").append(insights.getBudgetTarget()).append(" ");
                sb.append("Saved ").append(insights.getBudgetSaved()).append(" ");
                sb.append("Progress ").append(insights.getBudgetProgressPercent()).append("%").append(". ");
            }
        }
        if (risks != null && !risks.isEmpty()) {
            sb.append("Risks: ");
            for (String r : risks) sb.append(r).append("; ");
        }
        if (goals != null && !goals.isEmpty()) {
            sb.append("Goals: ");
            for (UserGoal g : goals) {
                sb.append(g.getTitle()).append(" target ").append(g.getTargetAmount()).append(" current ").append(g.getCurrentAmount()).append(". ");
            }
        }
        if (memory != null && !memory.isEmpty()) {
            sb.append("RecentChat: ");
            int count = 0;
            for (ChatMessage m : memory) {
                if (count >= 5) break;
                sb.append(m.getRole()).append(": ").append(truncate(m.getContent(), 300)).append(" | ");
                count++;
            }
        }
        return sb.toString();
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max);
    }
}
