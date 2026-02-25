package com.expense.tracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenRouterService {
    private static final Logger log = LoggerFactory.getLogger(OpenRouterService.class);

    @Value("${openrouter.api.key:}")
    private String apiKey;

    @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    @Value("${openrouter.timeout.ms:20000}")
    private int timeoutMs;

    public String generateResponse(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("OPENROUTER_API_KEY is not set or blank");
            return null;
        }
        try {
            WebClient client = WebClient.builder()
        .baseUrl(apiUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
        .defaultHeader("HTTP-Referer", "http://localhost:5173")
        .defaultHeader("X-Title", "Expense Tracker AI")
        .build();

            int pLen = prompt != null ? prompt.length() : 0;
            log.debug("OpenRouter prompt length={}", pLen);

            Map<String, Object> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", prompt == null ? "" : prompt);
            Map<String, Object> body = new HashMap<>();
            body.put("model", "arcee-ai/trinity-large-preview:free");
            body.put("messages", List.of(userMsg));
            body.put("temperature", 0.65);
body.put("max_tokens", 500);
body.put("top_p", 0.9);

            Mono<Map> call = client.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class);

            Map resp = call.block(Duration.ofMillis(timeoutMs));
            if (resp == null) {
                log.warn("OpenRouter returned null response");
                return null;
            }
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String json = mapper.writeValueAsString(resp);
                String truncated = json.length() > 2000 ? json.substring(0, 2000) + "...(truncated)" : json;
                log.debug("OpenRouter raw response: {}", truncated);
            } catch (Exception ignore) {}

            Object choicesObj = resp.get("choices");
            if (!(choicesObj instanceof List<?> choices) || choices.isEmpty()) {
                log.warn("OpenRouter returned empty choices");
                return null;
            }
            Object firstChoice = choices.get(0);
            if (!(firstChoice instanceof Map<?, ?> ch)) {
                log.warn("OpenRouter choice is not an object");
                return null;
            }
            Object messageObj = ch.get("message");
            if (!(messageObj instanceof Map<?, ?> msg)) {
                log.warn("OpenRouter message missing");
                return null;
            }
            Object contentObj = msg.get("content");
            if (contentObj instanceof String s && !s.isBlank()) {
                return s;
            }
            log.warn("OpenRouter message has empty content");
            return null;
        } catch (WebClientResponseException wcre) {
            log.error("OpenRouter API error: status={}", wcre.getRawStatusCode());
            String body = null;
            try { body = wcre.getResponseBodyAsString(); } catch (Exception ignored) {}
            if (body != null && !body.isEmpty()) {
                log.error("OpenRouter API error body: {}", body);
            }
            return null;
        } catch (Exception e) {
            log.error("OpenRouter API call failed", e);
            return null;
        }
    }
}
