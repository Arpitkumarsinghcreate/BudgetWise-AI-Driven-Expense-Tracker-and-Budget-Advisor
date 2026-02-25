package com.expense.tracker.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    private final Map<Long, ArrayDeque<Long>> userCalls = new ConcurrentHashMap<>();

    public boolean allow(Long userId, int maxPerMinute) {
        long now = Instant.now().toEpochMilli();
        ArrayDeque<Long> q = userCalls.computeIfAbsent(userId, k -> new ArrayDeque<>());
        long window = 60_000L;
        while (!q.isEmpty() && now - q.peekFirst() > window) q.pollFirst();
        if (q.size() >= maxPerMinute) return false;
        q.addLast(now);
        return true;
    }
}
