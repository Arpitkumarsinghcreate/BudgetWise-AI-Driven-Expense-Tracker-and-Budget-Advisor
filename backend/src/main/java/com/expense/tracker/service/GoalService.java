package com.expense.tracker.service;

import com.expense.tracker.entity.UserGoal;
import com.expense.tracker.repository.UserGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GoalService {
    @Autowired
    private UserGoalRepository userGoalRepository;

    public List<UserGoal> activeGoals(Long userId) {
        return userGoalRepository.findByUserIdAndStatus(userId, "ACTIVE");
    }

    @Transactional
    public UserGoal save(UserGoal goal) {
        return userGoalRepository.save(goal);
    }

    public Map<String, Object> progressSummary(List<UserGoal> goals) {
        Map<String, Object> m = new HashMap<>();
        int total = goals.size();
        int nearing = 0;
        for (UserGoal g : goals) {
            if (g.getTargetAmount() != null && g.getCurrentAmount() != null) {
                if (g.getTargetAmount().compareTo(g.getCurrentAmount()) <= 0) nearing++;
            }
        }
        m.put("totalGoals", total);
        m.put("completedOrReached", nearing);
        return m;
    }
}
