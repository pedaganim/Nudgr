package com.code.invoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.code.invoice.model.InvoiceItem;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {}
