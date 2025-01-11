package com.rica.invoice_ease;

import com.rica.invoice_ease.controller.ReceiptsController;
import com.rica.invoice_ease.controller.TransactionController;
import com.rica.invoice_ease.controller.UserController;
import com.rica.invoice_ease.model.Receipt;
import com.rica.invoice_ease.model.Transaction;
import com.rica.invoice_ease.model.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@SpringBootApplication(scanBasePackages = {"com.rica.invoice_ease", "com.rica.invoice_ease.config"})
public class InvoiceEaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(InvoiceEaseApplication.class, args);
    }

    @Bean
    public CommandLineRunner demo(UserController userController, TransactionController transactionController, ReceiptsController receiptsController) {
        return (args) -> {
            // Save 10 users
            List<String> usernames = Arrays.asList("david", "joel", "john", "kim", "sarah", "mike", "emma", "alex", "olivia", "admin");
            for (String username : usernames) {
                String email = generateEmail(username);
                userController.signup(new User(username, email, username + "12"));
            }

            // Save transactions and receipts for each user except the admin
            Random random = new Random();
            for (int userId = 1; userId <= 9; userId++) {
                LocalDateTime transactionDate = LocalDateTime.now();
                for (int i = 1; i <= 5; i++) {
                    int amount = 100 + random.nextInt(1901); // Random amount between 100 and 2000
                    Transaction transaction = new Transaction(userId, amount, transactionDate);
                    transactionController.createTransaction(transaction, getUsernameById(userId));

                    boolean isPaid = (i == 5); // Only the last receipt is paid
                    Receipt receipt = new Receipt(userId, transaction.getId(), isPaid);
                    receiptsController.createReceipt(receipt, getUsernameById(userId));

                    // Move the transaction date back by a random number of days (1-7)
                    transactionDate = transactionDate.minusDays(random.nextInt(7) + 1);
                }
            }
        };
    }

    private String getUsernameById(int userId) {
        List<String> usernames = Arrays.asList("david", "joel", "john", "kim", "sarah", "mike", "emma", "alex", "olivia");
        if (userId >= 1 && userId <= usernames.size()) {
            return usernames.get(userId - 1);
        }
        throw new IllegalArgumentException("Invalid user ID: " + userId);
    }

    private String generateEmail(String username) {
        return username + "@example.com";
    }
}