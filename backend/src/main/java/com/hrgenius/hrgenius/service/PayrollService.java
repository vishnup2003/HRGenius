package com.hrgenius.hrgenius.service;

import com.hrgenius.hrgenius.entity.Payroll;
import com.hrgenius.hrgenius.repository.PayrollRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;

    public PayrollService(PayrollRepository payrollRepository) {
        this.payrollRepository = payrollRepository;
    }

    // Get all payroll records
    public List<Payroll> getAllPayroll() {
        return payrollRepository.findAll();
    }

    // Get payroll by ID
    public Payroll getPayrollById(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payroll record not found: " + id));
    }

    // Get payroll history by employee
    public List<Payroll> getPayrollByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }

    // Create payroll record
    public Payroll createPayroll(Payroll payroll) {

        if (payrollRepository.existsByEmployeeIdAndPayMonth(
                payroll.getEmployeeId(), payroll.getPayMonth())) {
            throw new RuntimeException(
                    "Payroll already exists for this employee and month."
            );
        }

        payroll.setId(null);

        double basic = payroll.getBasicSalary();
        double allowances = payroll.getAllowances() == null
                ? 0.0 : payroll.getAllowances();
        double deductions = payroll.getDeductions() == null
                ? 0.0 : payroll.getDeductions();

        if (basic < 0 || allowances < 0 || deductions < 0) {
            throw new IllegalArgumentException(
                    "Salary amounts cannot be negative."
            );
        }

        double netSalary = basic + allowances - deductions;

        if (netSalary < 0) {
            throw new IllegalArgumentException(
                    "Deductions cannot exceed total earnings."
            );
        }

        payroll.setAllowances(allowances);
        payroll.setDeductions(deductions);
        payroll.setNetSalary(netSalary);
        payroll.setPaymentStatus("Pending");
        payroll.setPaymentDate(null);

        return payrollRepository.save(payroll);
    }

    // Update payroll record
    public Payroll updatePayroll(Long id, Payroll updatedPayroll) {

        Payroll existing = getPayrollById(id);

        existing.setBasicSalary(updatedPayroll.getBasicSalary());
        existing.setAllowances(updatedPayroll.getAllowances());
        existing.setDeductions(updatedPayroll.getDeductions());

        double basic = existing.getBasicSalary();
        double allowances = existing.getAllowances() == null
                ? 0.0 : existing.getAllowances();
        double deductions = existing.getDeductions() == null
                ? 0.0 : existing.getDeductions();

        if (basic < 0 || allowances < 0 || deductions < 0
                || deductions > basic + allowances) {
            throw new IllegalArgumentException("Invalid salary amounts.");
        }

        existing.setAllowances(allowances);
        existing.setDeductions(deductions);
        existing.setNetSalary(basic + allowances - deductions);

        return payrollRepository.save(existing);
    }

    // Mark payroll as paid
    public Payroll updatePaymentStatus(Long id, String status) {

        Payroll payroll = getPayrollById(id);

        payroll.setPaymentStatus(status);

        if ("Paid".equals(status)) {
            payroll.setPaymentDate(LocalDate.now());
        } else {
            payroll.setPaymentDate(null);
        }

        return payrollRepository.save(payroll);
    }

    // Delete payroll record
    public void deletePayroll(Long id) {
        Payroll payroll = getPayrollById(id);
        payrollRepository.delete(payroll);
    }
}
