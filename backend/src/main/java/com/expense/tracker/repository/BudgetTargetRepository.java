package com.expense.tracker.repository;

import com.expense.tracker.entity.BudgetTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetTargetRepository extends JpaRepository<BudgetTarget, Long> {
    Optional<BudgetTarget> findByUserIdAndMonth(Long userId, String month);
}
