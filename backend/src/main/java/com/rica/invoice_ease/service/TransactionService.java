package com.rica.invoice_ease.service;

import com.rica.invoice_ease.model.Transaction;
import com.rica.invoice_ease.model.User;
import com.rica.invoice_ease.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getUserTransactions(User user) {
        return transactionRepository.findByUserId(user.getId());
    }

    public Transaction getTransactionById(int id) {
        return transactionRepository.findById(id).orElse(null);
    }

    public boolean deleteTransactionById(int id) {
        if (transactionRepository.existsById(id)) {
            transactionRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
}
