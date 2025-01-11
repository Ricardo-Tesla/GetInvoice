package com.rica.invoice_ease.repository;

import com.rica.invoice_ease.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceiptsRepository extends JpaRepository<Receipt, Integer> {
    List<Receipt> findByUserId(int userId);
}
