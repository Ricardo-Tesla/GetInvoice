package com.rica.invoice_ease.service;

import com.rica.invoice_ease.model.Receipt;
import com.rica.invoice_ease.model.Transaction;
import com.rica.invoice_ease.model.User;
import com.rica.invoice_ease.repository.ReceiptsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReceiptService {
    @Autowired
    private ReceiptsRepository receiptsRepository;

    public Receipt createReceipt(Receipt receipt) {
        return receiptsRepository.save(receipt);
    }

    public List<Receipt> getUserReceipts(User user) {
        return receiptsRepository.findByUserId(user.getId());
    }

    public Receipt getReceiptById(int id) {
        return receiptsRepository.findById(id).orElse(null);
    }
}
