package com.hrgenius.hrgenius.controller;

import com.hrgenius.hrgenius.entity.Payroll;
import com.hrgenius.hrgenius.service.PayrollService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "http://localhost:5173")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // Get all payroll records
    @GetMapping
    public ResponseEntity<List<Payroll>> getAllPayroll() {
        return ResponseEntity.ok(payrollService.getAllPayroll());
    }

    // Get payroll by ID
    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(
            @PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }

    // Get payroll history by employee
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payroll>> getPayrollByEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(
                payrollService.getPayrollByEmployee(employeeId)
        );
    }

    // Create payroll
    @PostMapping
    public ResponseEntity<Payroll> createPayroll(
            @RequestBody Payroll payroll) {
        Payroll created = payrollService.createPayroll(payroll);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Update payroll details
    @PutMapping("/{id}")
    public ResponseEntity<Payroll> updatePayroll(
            @PathVariable Long id,
            @RequestBody Payroll payroll) {
        return ResponseEntity.ok(
                payrollService.updatePayroll(id, payroll)
        );
    }

    // Update payment status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Payroll> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        if (!List.of("Pending", "Paid").contains(status)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                payrollService.updatePaymentStatus(id, status)
        );
    }

    // Delete payroll
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayroll(
            @PathVariable Long id) {
        payrollService.deletePayroll(id);
        return ResponseEntity.noContent().build();
    }
}
