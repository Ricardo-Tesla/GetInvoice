package com.rica.invoice_ease.repository;

import com.rica.invoice_ease.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByUserId(int userId);
}
