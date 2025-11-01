package com.example.invoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.invoice.model.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    boolean existsByInvoiceNumber(String invoiceNumber);
}
