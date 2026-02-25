package com.expense.tracker.repository;

import com.expense.tracker.entity.UserGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserGoalRepository extends JpaRepository<UserGoal, Long> {
    List<UserGoal> findByUserId(Long userId);
    List<UserGoal> findByUserIdAndStatus(Long userId, String status);
}
