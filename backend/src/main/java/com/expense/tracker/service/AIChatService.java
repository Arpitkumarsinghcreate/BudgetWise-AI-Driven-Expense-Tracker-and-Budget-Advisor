package com.expense.tracker.service;

import com.expense.tracker.dto.AIInsightsResponse;
import com.expense.tracker.dto.ChatRequest;
import com.expense.tracker.dto.ChatResponse;
import com.expense.tracker.entity.AIUsageLog;
import com.expense.tracker.entity.ChatMessage;
import com.expense.tracker.entity.UserGoal;
import com.expense.tracker.repository.AIUsageLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIChatService {
    private static final Logger log = LoggerFactory.getLogger(AIChatService.class);
    @Autowired
    private AIInsightsService aiInsightsService;
    @Autowired
    private PromptBuilderService promptBuilderService;
    @Autowired
    private ChatMemoryService chatMemoryService;
    @Autowired
    private GoalService goalService;
    @Autowired
    private RiskAnalyzerService riskAnalyzerService;
    @Autowired
    private OpenRouterService openRouterService;
    @Autowired
    private AIUsageLogRepository aiUsageLogRepository;
    @Autowired
    private RateLimiterService rateLimiterService;

    public ChatResponse chat(Long userId, ChatRequest req) {
        if (!rateLimiterService.allow(userId, 20)) {
            ChatResponse r = new ChatResponse();
            r.setReply("Rate limit exceeded. Try again later.");
            r.setPromptTokens(0);
            r.setCompletionTokens(0);
            r.setTotalTokens(0);
            r.setSuggestions(new ArrayList<>());
            r.setRisks(new ArrayList<>());
            r.setGoalProgress(new HashMap<>());
            return r;
        }
        YearMonth ym = null;
        if (req.getMonth() != null && !req.getMonth().isBlank()) {
            ym = YearMonth.parse(req.getMonth());
        }
        AIInsightsResponse insights = ym != null ? aiInsightsService.getInsights(userId, ym) : null;
        List<UserGoal> goals = req.isIncludeGoals() ? goalService.activeGoals(userId) : new ArrayList<>();
        List<String> risks = riskAnalyzerService.analyze(insights);
        List<ChatMessage> memory = chatMemoryService.lastMessages(userId);
        String prompt = promptBuilderService.buildPrompt(req.getToneMode(), req, insights, risks, goals, memory);
        ChatResponse out = new ChatResponse();
        long start = System.currentTimeMillis();
        AIUsageLog usage = new AIUsageLog();
        usage.setUserId(userId);
        usage.setEndpoint("/api/ai/chat");
        try {
            String reply = openRouterService.generateResponse(prompt);
            if (reply != null && !reply.isBlank()) {
                out.setReply(reply);
                out.setPromptTokens(0);
                out.setCompletionTokens(0);
                out.setTotalTokens(0);
                out.setSuggestions(insights != null ? insights.getSuggestions() : new ArrayList<>());
                out.setRisks(risks);
                Map<String, Object> progress = goalService.progressSummary(goals);
                out.setGoalProgress(progress);
                ChatMessage u = new ChatMessage();
                u.setUserId(userId);
                u.setRole("user");
                u.setContent(req.getMessage());
                chatMemoryService.saveMessage(u);
                ChatMessage a = new ChatMessage();
                a.setUserId(userId);
                a.setRole("assistant");
                a.setContent(reply);
                chatMemoryService.saveMessage(a);
                usage.setSuccess(true);
                usage.setModel("openai/gpt-3.5-turbo");
                usage.setPromptTokens(0);
                usage.setCompletionTokens(0);
                usage.setTotalTokens(0);
            } else {
                log.warn("AI provider returned empty or null reply; using fallback");
                String fallback = buildFallback(insights, risks, goals);
                out.setReply(fallback);
                out.setPromptTokens(0);
                out.setCompletionTokens(0);
                out.setTotalTokens(0);
                out.setSuggestions(insights != null ? insights.getSuggestions() : new ArrayList<>());
                out.setRisks(risks);
                Map<String, Object> progress = goalService.progressSummary(goals);
                out.setGoalProgress(progress);
                usage.setSuccess(false);
                usage.setErrorCode("OPENROUTER_EMPTY_RESPONSE");
            }
        } catch (Exception e) {
            log.error("AI chat failed, using fallback", e);
            String fallback = buildFallback(insights, risks, goals);
            out.setReply(fallback);
            out.setPromptTokens(0);
            out.setCompletionTokens(0);
            out.setTotalTokens(0);
            out.setSuggestions(insights != null ? insights.getSuggestions() : new ArrayList<>());
            out.setRisks(risks);
            Map<String, Object> progress = goalService.progressSummary(goals);
            out.setGoalProgress(progress);
            usage.setSuccess(false);
            usage.setErrorCode("OPENROUTER_ERROR");
        } finally {
            long end = System.currentTimeMillis();
            usage.setLatencyMs(end - start);
            aiUsageLogRepository.save(usage);
        }
        return out;
    }

    private String buildFallback(AIInsightsResponse insights, List<String> risks, List<UserGoal> goals) {
        StringBuilder sb = new StringBuilder();
        sb.append("Insights: ");
        if (insights != null) {
            sb.append("HealthScore ").append(insights.getHealthScore()).append(", SavingsRate ").append(insights.getSavingsRate()).append(", MoM ").append(insights.getMonthOverMonth()).append(". ");
        }
        if (risks != null && !risks.isEmpty()) {
            sb.append("Risks ").append(String.join(", ", risks)).append(". ");
        }
        if (goals != null && !goals.isEmpty()) {
            sb.append("Goals ").append(goals.size()).append(". ");
        }
        List<String> sugg = insights != null ? insights.getSuggestions() : new ArrayList<>();
        if (sugg != null && !sugg.isEmpty()) {
            sb.append("Suggestions: ");
            for (String s : sugg) sb.append(s).append("; ");
        }
        return sb.toString();
    }
}
