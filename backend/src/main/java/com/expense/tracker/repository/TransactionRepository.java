package com.expense.tracker.repository;

import com.expense.tracker.entity.Transaction;
import com.expense.tracker.entity.TransactionStatus;
import com.expense.tracker.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserIdAndIsReservedTrueAndStatus(Long userId, TransactionStatus status);
    List<Transaction> findByUserIdAndIsReservedTrue(Long userId);
    List<Transaction> findByUserIdAndIsReservedTrueAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserIdAndTypeAndStatusAndDateBetween(Long userId, TransactionType type, TransactionStatus status, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserIdAndTypeAndStatus(Long userId, TransactionType type, TransactionStatus status);
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);
}
