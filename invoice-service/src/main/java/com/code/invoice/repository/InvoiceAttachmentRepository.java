package com.code.invoice.repository;

import com.code.invoice.model.InvoiceAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceAttachmentRepository extends JpaRepository<InvoiceAttachment, Long> {
    List<InvoiceAttachment> findByInvoice_Id(Long invoiceId);
}
