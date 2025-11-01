package com.example.invoice.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.invoice.service.InvoiceService;
import com.example.invoice.service.PdfService;
import com.example.invoice.model.Invoice;
import com.example.invoice.model.Payment;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final InvoiceService service;
    private final PdfService pdfService;

    public InvoiceController(InvoiceService service, PdfService pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }

    @GetMapping
    public Page<Invoice> list(Pageable pageable) { return service.list(pageable); }

    @GetMapping("/{id}")
    public Invoice get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public Invoice create(@RequestBody Invoice invoice) { return service.create(invoice); }

    @PutMapping("/{id}")
    public Invoice update(@PathVariable Long id, @RequestBody Invoice invoice) { return service.update(id, invoice); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }

    @PostMapping("/{id}/finalize")
    public Invoice finalizeInvoice(@PathVariable Long id) { return service.finalizeInvoice(id); }

    @PostMapping("/{id}/payments")
    public Payment addPayment(@PathVariable Long id, @RequestBody Payment p) { return service.addPayment(id, p); }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<ByteArrayResource> pdf(@PathVariable Long id) {
        byte[] bytes = pdfService.renderInvoicePdf(id);
        String filename = service.get(id).getInvoiceNumber();
        if (filename == null || filename.isBlank()) filename = "invoice-" + id;
        ByteArrayResource resource = new ByteArrayResource(bytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(bytes.length)
                .body(resource);
    }
}
