package com.code.invoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.code.invoice.model.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    boolean existsByInvoiceNumber(String invoiceNumber);
}
