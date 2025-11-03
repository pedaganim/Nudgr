package com.example.invoice.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

import static org.assertj.core.api.Assertions.*;

class InvoiceTest {
    
    private Invoice invoice;
    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("Test Customer");
        customer.setEmail("test@example.com");

        invoice = new Invoice();
        invoice.setCustomer(customer);
    }

    @Test
    void shouldInitializeWithDefaultValues() {
        Invoice newInvoice = new Invoice();
        
        assertThat(newInvoice.getStatus()).isEqualTo(InvoiceStatus.DRAFT);
        assertThat(newInvoice.getCurrency()).isEqualTo("USD");
        assertThat(newInvoice.getSubTotal()).isEqualTo(BigDecimal.ZERO);
        assertThat(newInvoice.getTaxTotal()).isEqualTo(BigDecimal.ZERO);
        assertThat(newInvoice.getDiscountTotal()).isEqualTo(BigDecimal.ZERO);
        assertThat(newInvoice.getTotal()).isEqualTo(BigDecimal.ZERO);
        assertThat(newInvoice.getBalanceDue()).isEqualTo(BigDecimal.ZERO);
        assertThat(newInvoice.getItems()).isEmpty();
        assertThat(newInvoice.getPayments()).isEmpty();
        assertThat(newInvoice.getAttachments()).isEmpty();
        assertThat(newInvoice.getIssueDate()).isNotNull();
        assertThat(newInvoice.getDueDate()).isNotNull();
        assertThat(newInvoice.getCreatedAt()).isNotNull();
    }

    @Test
    void shouldSetAndGetInvoiceNumber() {
        String invoiceNumber = "12345678";
        invoice.setInvoiceNumber(invoiceNumber);
        
        assertThat(invoice.getInvoiceNumber()).isEqualTo(invoiceNumber);
    }

    @Test
    void shouldSetAndGetCustomer() {
        assertThat(invoice.getCustomer()).isEqualTo(customer);
        assertThat(invoice.getCustomer().getName()).isEqualTo("Test Customer");
    }

    @Test
    void shouldSetAndGetDates() {
        LocalDate issueDate = LocalDate.of(2025, 1, 1);
        LocalDate dueDate = LocalDate.of(2025, 1, 31);
        
        invoice.setIssueDate(issueDate);
        invoice.setDueDate(dueDate);
        
        assertThat(invoice.getIssueDate()).isEqualTo(issueDate);
        assertThat(invoice.getDueDate()).isEqualTo(dueDate);
    }

    @Test
    void shouldSetAndGetStatus() {
        invoice.setStatus(InvoiceStatus.SENT);
        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatus.SENT);
        
        invoice.setStatus(InvoiceStatus.PAID);
        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatus.PAID);
    }

    @Test
    void shouldSetAndGetFinancialFields() {
        BigDecimal subTotal = new BigDecimal("1000.00");
        BigDecimal taxTotal = new BigDecimal("100.00");
        BigDecimal discountTotal = new BigDecimal("50.00");
        BigDecimal total = new BigDecimal("1050.00");
        BigDecimal balanceDue = new BigDecimal("1050.00");
        
        invoice.setSubTotal(subTotal);
        invoice.setTaxTotal(taxTotal);
        invoice.setDiscountTotal(discountTotal);
        invoice.setTotal(total);
        invoice.setBalanceDue(balanceDue);
        
        assertThat(invoice.getSubTotal()).isEqualByComparingTo(subTotal);
        assertThat(invoice.getTaxTotal()).isEqualByComparingTo(taxTotal);
        assertThat(invoice.getDiscountTotal()).isEqualByComparingTo(discountTotal);
        assertThat(invoice.getTotal()).isEqualByComparingTo(total);
        assertThat(invoice.getBalanceDue()).isEqualByComparingTo(balanceDue);
    }

    @Test
    void shouldSetAndGetExtendedFields() {
        invoice.setBillingAddress("123 Main St\nCity, State 12345");
        invoice.setTerms(Terms.NET_30);
        invoice.setTags("urgent,consulting");
        invoice.setMessageOnInvoice("Thank you for your business!");
        invoice.setMessageOnStatement("Payment due within 30 days");
        
        assertThat(invoice.getBillingAddress()).isEqualTo("123 Main St\nCity, State 12345");
        assertThat(invoice.getTerms()).isEqualTo(Terms.NET_30);
        assertThat(invoice.getTags()).isEqualTo("urgent,consulting");
        assertThat(invoice.getMessageOnInvoice()).isEqualTo("Thank you for your business!");
        assertThat(invoice.getMessageOnStatement()).isEqualTo("Payment due within 30 days");
    }

    @Test
    void shouldManageItems() {
        InvoiceItem item1 = new InvoiceItem();
        item1.setDescription("Service 1");
        item1.setQuantity(new BigDecimal("2"));
        item1.setUnitPrice(new BigDecimal("100.00"));
        item1.setTaxRate(new BigDecimal("10.00"));
        
        InvoiceItem item2 = new InvoiceItem();
        item2.setDescription("Service 2");
        item2.setQuantity(new BigDecimal("1"));
        item2.setUnitPrice(new BigDecimal("200.00"));
        item2.setTaxRate(new BigDecimal("10.00"));
        
        invoice.getItems().add(item1);
        invoice.getItems().add(item2);
        
        assertThat(invoice.getItems()).hasSize(2);
        assertThat(invoice.getItems().get(0).getDescription()).isEqualTo("Service 1");
        assertThat(invoice.getItems().get(1).getDescription()).isEqualTo("Service 2");
    }

    @Test
    void shouldManagePayments() {
        Payment payment = new Payment();
        payment.setAmount(new BigDecimal("500.00"));
        payment.setInvoice(invoice);
        
        invoice.getPayments().add(payment);
        
        assertThat(invoice.getPayments()).hasSize(1);
        assertThat(invoice.getPayments().get(0).getAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    void shouldSetUpdatedAt() {
        Instant now = Instant.now();
        invoice.setUpdatedAt(now);
        
        assertThat(invoice.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    void shouldHandleNullTerms() {
        invoice.setTerms(null);
        assertThat(invoice.getTerms()).isNull();
    }

    @Test
    void shouldHandleAllTermsValues() {
        invoice.setTerms(Terms.DUE_ON_RECEIPT);
        assertThat(invoice.getTerms()).isEqualTo(Terms.DUE_ON_RECEIPT);
        
        invoice.setTerms(Terms.NET_15);
        assertThat(invoice.getTerms()).isEqualTo(Terms.NET_15);
        
        invoice.setTerms(Terms.NET_30);
        assertThat(invoice.getTerms()).isEqualTo(Terms.NET_30);
        
        invoice.setTerms(Terms.NET_60);
        assertThat(invoice.getTerms()).isEqualTo(Terms.NET_60);
    }
}
