package com.expense.tracker.repository;

import com.expense.tracker.entity.AIUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIUsageLogRepository extends JpaRepository<AIUsageLog, Long> {
}
