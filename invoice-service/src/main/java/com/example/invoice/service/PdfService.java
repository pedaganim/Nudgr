package com.example.invoice.service;

import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.example.invoice.repository.InvoiceRepository;
import com.example.invoice.model.Invoice;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {
    private final TemplateEngine templateEngine;
    private final InvoiceRepository invoiceRepository;

    public PdfService(TemplateEngine templateEngine, InvoiceRepository invoiceRepository) {
        this.templateEngine = templateEngine;
        this.invoiceRepository = invoiceRepository;
    }

    public byte[] renderInvoicePdf(Long id) {
        Invoice invoice = invoiceRepository.findById(id).orElseThrow();
        Context ctx = new Context();
        ctx.setVariable("invoice", invoice);
        String html = templateEngine.process("invoice", ctx);
        return htmlToPdf(html);
    }

    private byte[] htmlToPdf(String html) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to render PDF", e);
        }
    }
}
