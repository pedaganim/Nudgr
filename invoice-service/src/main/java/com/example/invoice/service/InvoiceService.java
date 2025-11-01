package com.example.invoice.service;

import com.example.invoice.common.MoneyUtils;
import com.example.invoice.model.Invoice;
import com.example.invoice.model.InvoiceItem;
import com.example.invoice.model.InvoiceStatus;
import com.example.invoice.model.Payment;
import com.example.invoice.customer.CustomerRepository;
import com.example.invoice.model.Customer;
import com.example.invoice.invoice.InvoiceRepository;
import com.example.invoice.invoice.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceNumberGenerator numberGenerator;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          CustomerRepository customerRepository,
                          PaymentRepository paymentRepository,
                          InvoiceNumberGenerator numberGenerator) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
        this.numberGenerator = numberGenerator;
    }

    public Page<Invoice> list(Pageable pageable) {
        return invoiceRepository.findAll(pageable);
    }

    @Transactional
    public Invoice create(Invoice invoice) {
        Customer c = customerRepository.findById(invoice.getCustomer().getId()).orElseThrow();
        invoice.setCustomer(c);
        invoice.getItems().forEach(i -> {
            i.setInvoice(invoice);
            var line = MoneyUtils.mul(i.getQuantity(), i.getUnitPrice());
            var tax = MoneyUtils.mul(line, i.getTaxRate().movePointLeft(2));
            i.setLineTotal(MoneyUtils.add(line, tax));
        });
        recomputeTotals(invoice);
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice update(Long id, Invoice updated) {
        Invoice inv = invoiceRepository.findById(id).orElseThrow();
        inv.setNotes(updated.getNotes());
        inv.setCurrency(updated.getCurrency());
        inv.setIssueDate(updated.getIssueDate());
        inv.setDueDate(updated.getDueDate());
        inv.getItems().clear();
        updated.getItems().forEach(i -> {
            i.setInvoice(inv);
            var line = MoneyUtils.mul(i.getQuantity(), i.getUnitPrice());
            var tax = MoneyUtils.mul(line, i.getTaxRate().movePointLeft(2));
            i.setLineTotal(MoneyUtils.add(line, tax));
            inv.getItems().add(i);
        });
        inv.setUpdatedAt(Instant.now());
        recomputeTotals(inv);
        return inv;
    }

    public Invoice get(Long id) { return invoiceRepository.findById(id).orElseThrow(); }

    @Transactional
    public void delete(Long id) { invoiceRepository.deleteById(id); }

    @Transactional
    public Invoice finalizeInvoice(Long id) {
        Invoice inv = invoiceRepository.findById(id).orElseThrow();
        if (inv.getStatus() == InvoiceStatus.DRAFT) {
            inv.setInvoiceNumber(numberGenerator.nextNumber());
            inv.setStatus(InvoiceStatus.SENT);
            inv.setUpdatedAt(Instant.now());
        }
        return inv;
    }

    @Transactional
    public Payment addPayment(Long invoiceId, Payment p) {
        Invoice inv = invoiceRepository.findById(invoiceId).orElseThrow();
        p.setInvoice(inv);
        Payment saved = paymentRepository.save(p);
        inv.getPayments().add(saved);
        recomputeTotals(inv);
        return saved;
    }

    private void recomputeTotals(Invoice inv) {
        BigDecimal sub = BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        for (var i : inv.getItems()) {
            var line = MoneyUtils.mul(i.getQuantity(), i.getUnitPrice());
            var lineTax = MoneyUtils.mul(line, i.getTaxRate().movePointLeft(2));
            sub = MoneyUtils.add(sub, line);
            tax = MoneyUtils.add(tax, lineTax);
            total = MoneyUtils.add(total, MoneyUtils.add(line, lineTax));
        }
        BigDecimal paid = inv.getPayments().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, MoneyUtils::add);
        inv.setSubTotal(sub);
        inv.setTaxTotal(tax);
        inv.setTotal(total);
        inv.setBalanceDue(MoneyUtils.sub(total, paid));
        if (inv.getBalanceDue().compareTo(BigDecimal.ZERO) == 0 && !inv.getPayments().isEmpty()) {
            inv.setStatus(InvoiceStatus.PAID);
        } else if (paid.compareTo(BigDecimal.ZERO) > 0) {
            inv.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
    }
}
