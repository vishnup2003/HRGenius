package com.hrgenius.hrgenius.repository;

import com.hrgenius.hrgenius.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByEmployeeId(Long employeeId);

    boolean existsByEmployeeIdAndPayMonth(Long employeeId, String payMonth);
}
