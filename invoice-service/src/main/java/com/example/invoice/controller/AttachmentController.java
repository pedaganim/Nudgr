package com.example.invoice.controller;

import com.example.invoice.model.Invoice;
import com.example.invoice.model.InvoiceAttachment;
import com.example.invoice.repository.InvoiceAttachmentRepository;
import com.example.invoice.repository.InvoiceRepository;
import com.example.invoice.service.AttachmentStorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AttachmentController {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceAttachmentRepository attachmentRepository;
    private final AttachmentStorageService storage;

    public AttachmentController(InvoiceRepository invoiceRepository,
                                InvoiceAttachmentRepository attachmentRepository,
                                AttachmentStorageService storage) {
        this.invoiceRepository = invoiceRepository;
        this.attachmentRepository = attachmentRepository;
        this.storage = storage;
    }

    @PostMapping(value = "/invoices/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public InvoiceAttachment upload(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Empty file");
        if (file.getSize() > 10 * 1024 * 1024) throw new IllegalArgumentException("File too large (max 10MB)");
        Invoice invoice = invoiceRepository.findById(id).orElseThrow();
        String storageKey = storage.save(file.getOriginalFilename(), file.getInputStream());
        InvoiceAttachment att = new InvoiceAttachment();
        att.setInvoice(invoice);
        att.setFilename(file.getOriginalFilename());
        att.setContentType(file.getContentType());
        att.setSize(file.getSize());
        att.setStorageKey(storageKey);
        return attachmentRepository.save(att);
    }

    @GetMapping("/invoices/{id}/attachments")
    public List<InvoiceAttachment> list(@PathVariable Long id) {
        return attachmentRepository.findByInvoice_Id(id);
    }

    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<FileSystemResource> download(@PathVariable Long attachmentId) {
        InvoiceAttachment att = attachmentRepository.findById(attachmentId).orElseThrow();
        Path path = storage.load(att.getStorageKey());
        FileSystemResource resource = new FileSystemResource(path);
        String filename = att.getFilename();
        long len;
        try {
            len = resource.contentLength();
        } catch (java.io.IOException e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(att.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : att.getContentType()))
                .contentLength(len)
                .body(resource);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public void delete(@PathVariable Long attachmentId) throws IOException {
        InvoiceAttachment att = attachmentRepository.findById(attachmentId).orElseThrow();
        storage.delete(att.getStorageKey());
        attachmentRepository.delete(att);
    }
}
