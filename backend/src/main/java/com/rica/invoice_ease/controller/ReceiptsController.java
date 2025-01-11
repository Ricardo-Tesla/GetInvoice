package com.rica.invoice_ease.controller;

import com.rica.invoice_ease.model.Receipt;
import com.rica.invoice_ease.model.Transaction;
import com.rica.invoice_ease.model.User;
import com.rica.invoice_ease.service.ReceiptService;
import com.rica.invoice_ease.service.TransactionService;
import com.rica.invoice_ease.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptsController {

    @Autowired
    private ReceiptService receiptService;

    @Autowired
    private UserService userService;

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/add/{username}")
    public ResponseEntity<Receipt> createReceipt(@RequestBody Receipt receipt, @PathVariable String username) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        receipt.setUserId(user.getId());

        // Create the receipt
        Receipt createdReceipt = receiptService.createReceipt(receipt);

        return ResponseEntity.ok(createdReceipt);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<ReceiptDTO>> getUserReceipts(@PathVariable String username) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        List<Receipt> receipts = receiptService.getUserReceipts(user);

        List<ReceiptDTO> receiptDTOs = receipts.stream()
                .map(receipt -> {
                    Transaction transaction = transactionService.getTransactionById(receipt.getTransactionId());
                    return new ReceiptDTO(receipt, transaction);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(receiptDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptDTO> getUserReceipts(@PathVariable int id) {
        Receipt receipt = receiptService.getReceiptById(id);

        Transaction transaction = transactionService.getTransactionById(receipt.getTransactionId());
        ReceiptDTO receiptDTO = new ReceiptDTO(receipt, transaction);

        return ResponseEntity.ok(receiptDTO);
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<Receipt> approveReceipt(@PathVariable int id) {
        Receipt receipt = receiptService.getReceiptById(id);
        receipt.setStatus(true);

        Receipt createdReceipt = receiptService.createReceipt(receipt);

        return ResponseEntity.ok(createdReceipt);
    }

    // DTO class to combine Receipt and Transaction data
    private static class ReceiptDTO {
        private int id;
        private int transactionId;
        private boolean status;
        private int amount;
        private String timestamp;

        public ReceiptDTO(Receipt receipt, Transaction transaction) {
            this.id = receipt.getId();
            this.transactionId = receipt.getTransactionId();
            this.status = receipt.isStatus();
            this.amount = transaction.getAmount();
            this.timestamp = transaction.getTimestamp().toString();
        }

        // Getters
        public int getId() { return id; }
        public int getTransactionId() { return transactionId; }
        public boolean isStatus() { return status; }
        public int getAmount() { return amount; }
        public String getTimestamp() { return timestamp; }
    }
}
