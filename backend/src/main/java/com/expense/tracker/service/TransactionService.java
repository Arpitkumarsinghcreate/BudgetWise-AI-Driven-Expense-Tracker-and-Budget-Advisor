package com.expense.tracker.service;

import com.expense.tracker.dto.TransactionRequest;
import com.expense.tracker.dto.TransactionResponse;
import com.expense.tracker.entity.Transaction;
import com.expense.tracker.entity.TransactionStatus;
import com.expense.tracker.entity.TransactionType;
import com.expense.tracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional
    public TransactionResponse addTransaction(Long userId, TransactionRequest request) {
        Transaction t = new Transaction();
        t.setUserId(userId);
        t.setType(TransactionType.valueOf(request.getType().toUpperCase()));
        t.setAmount(request.getAmount());
        t.setCategory(request.getCategory());
        t.setDescription(request.getDescription());
        t.setDate(request.getDate());
        t.setReserved(request.isReserved());
        t.setStatus(request.isReserved() ? TransactionStatus.PENDING : TransactionStatus.COMPLETED);
        Transaction saved = transactionRepository.save(t);
        return toResponse(saved);
    }

    public List<TransactionResponse> getTransactionsByMonth(Long userId, YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        return transactionRepository.findByUserIdAndDateBetween(userId, start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TransactionResponse> getReservedTransactions(Long userId) {
        return transactionRepository.findByUserIdAndIsReservedTrue(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TransactionResponse> getReservedTransactionsByMonth(Long userId, YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        return transactionRepository.findByUserIdAndIsReservedTrueAndDateBetween(userId, start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse completeReserved(Long userId, Long id) {
        Transaction t = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!t.isReserved() || t.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Only pending reserved transactions can be completed");
        }
        t.setStatus(TransactionStatus.COMPLETED);
        return toResponse(transactionRepository.save(t));
    }

    @Transactional
    public TransactionResponse revertReserved(Long userId, Long id) {
        Transaction t = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!t.isReserved() || t.getStatus() == TransactionStatus.REVERTED) {
            throw new RuntimeException("Invalid transaction state");
        }
        t.setStatus(TransactionStatus.REVERTED);
        return toResponse(transactionRepository.save(t));
    }

    private TransactionResponse toResponse(Transaction t) {
        TransactionResponse r = new TransactionResponse();
        r.setId(t.getId());
        r.setType(t.getType().name());
        r.setAmount(t.getAmount());
        r.setCategory(t.getCategory());
        r.setDescription(t.getDescription());
        r.setDate(t.getDate());
        r.setReserved(t.isReserved());
        r.setStatus(t.getStatus().name());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }
}
