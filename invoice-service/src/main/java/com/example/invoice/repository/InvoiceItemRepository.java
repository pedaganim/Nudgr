package com.example.invoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.invoice.model.InvoiceItem;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {}
