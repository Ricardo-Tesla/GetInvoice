package com.rica.invoice_ease.controller;

import com.rica.invoice_ease.model.Transaction;
import com.rica.invoice_ease.model.User;
import com.rica.invoice_ease.service.TransactionService;
import com.rica.invoice_ease.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @PostMapping("/add/{username}")
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction, @PathVariable String username) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        transaction.setUserId(user.getId());

        Transaction createdTransaction = transactionService.createTransaction(transaction);

        return ResponseEntity.ok(createdTransaction);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable String username) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        List<Transaction> transactions = transactionService.getUserTransactions(user);
        return ResponseEntity.ok(transactions);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteTransaction(@PathVariable int id) {
        boolean isDeleted = transactionService.deleteTransactionById(id);
        Map<String, Object> response = new HashMap<>();
        if (isDeleted) {
            response.put("status", "success");
            response.put("message", "Transaction deleted successfully.");
        } else {
            response.put("status", "error");
            response.put("message", "Transaction not found.");
        }
        return ResponseEntity.ok(response);
    }
}

