package com.expense.tracker.service;

import com.expense.tracker.entity.BudgetTarget;
import com.expense.tracker.repository.BudgetTargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Optional;

@Service
public class BudgetTargetService {
    @Autowired
    private BudgetTargetRepository budgetTargetRepository;

    public BigDecimal getTarget(Long userId, YearMonth month) {
        Optional<BudgetTarget> bt = budgetTargetRepository.findByUserIdAndMonth(userId, month.toString());
        return bt.map(BudgetTarget::getAmount).orElse(BigDecimal.ZERO);
    }

    @Transactional
    public BudgetTarget upsertTarget(Long userId, YearMonth month, BigDecimal amount) {
        BudgetTarget bt = budgetTargetRepository.findByUserIdAndMonth(userId, month.toString())
                .orElseGet(BudgetTarget::new);
        bt.setUserId(userId);
        bt.setMonth(month.toString());
        bt.setAmount(amount);
        bt.setUpdatedAt(java.time.LocalDateTime.now());
        if (bt.getId() == null) bt.setCreatedAt(java.time.LocalDateTime.now());
        return budgetTargetRepository.save(bt);
    }
}
