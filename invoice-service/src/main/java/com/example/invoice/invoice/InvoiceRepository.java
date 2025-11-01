package com.example.invoice.invoice;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    boolean existsByInvoiceNumber(String invoiceNumber);
}
