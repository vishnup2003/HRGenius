package com.hrgenius.hrgenius.controller;

import com.hrgenius.hrgenius.entity.Performance;
import com.hrgenius.hrgenius.service.PerformanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "http://localhost:5173")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping
    public ResponseEntity<List<Performance>> getAllPerformance() {
        return ResponseEntity.ok(performanceService.getAllPerformance());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Performance> getPerformanceById(
            @PathVariable Long id) {
        return ResponseEntity.ok(performanceService.getPerformanceById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Performance>> getPerformanceByEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(
                performanceService.getPerformanceByEmployee(employeeId));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<Performance>> getPerformanceByDepartment(
            @PathVariable String department) {
        return ResponseEntity.ok(
                performanceService.getPerformanceByDepartment(department));
    }

    @PostMapping
    public ResponseEntity<Performance> createPerformance(
            @RequestBody Performance performance) {
        Performance created = performanceService.createPerformance(performance);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Performance> updatePerformance(
            @PathVariable Long id,
            @RequestBody Performance performance) {
        return ResponseEntity.ok(
                performanceService.updatePerformance(id, performance));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Performance> updatePerformanceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
                performanceService.updatePerformanceStatus(
                        id, request.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerformance(@PathVariable Long id) {
        performanceService.deletePerformance(id);
        return ResponseEntity.noContent().build();
    }
}
