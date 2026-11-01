package com.hrgenius.hrgenius.service;

import com.hrgenius.hrgenius.entity.Performance;
import com.hrgenius.hrgenius.repository.PerformanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PerformanceService {

    private final PerformanceRepository performanceRepository;

    public PerformanceService(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }

    public List<Performance> getAllPerformance() {
        return performanceRepository.findAll();
    }

    public Performance getPerformanceById(Long id) {
        return performanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Performance record not found: " + id));
    }

    public List<Performance> getPerformanceByEmployee(Long employeeId) {
        return performanceRepository.findByEmployeeId(employeeId);
    }

    public List<Performance> getPerformanceByDepartment(String department) {
        return performanceRepository.findByDepartment(department);
    }

    public Performance createPerformance(Performance performance) {

        if (performanceRepository.existsByEmployeeIdAndReviewPeriod(
                performance.getEmployeeId(),
                performance.getReviewPeriod())) {
            throw new RuntimeException(
                    "Performance review already exists for this employee and period."
            );
        }

        performance.setId(null);

        validateRatings(performance);

        performance.setOverallRating(calculateOverallRating(performance));
        performance.setReviewDate(LocalDate.now());
        performance.setPerformanceStatus("Pending");

        return performanceRepository.save(performance);
    }

    public Performance updatePerformance(
            Long id, Performance updatedPerformance) {

        Performance existing = getPerformanceById(id);

        existing.setCommunicationRating(
                updatedPerformance.getCommunicationRating());

        existing.setTechnicalRating(
                updatedPerformance.getTechnicalRating());

        existing.setTeamworkRating(
                updatedPerformance.getTeamworkRating());

        existing.setProductivityRating(
                updatedPerformance.getProductivityRating());

        existing.setGoals(updatedPerformance.getGoals());
        existing.setAchievements(updatedPerformance.getAchievements());
        existing.setManagerFeedback(updatedPerformance.getManagerFeedback());

        validateRatings(existing);

        existing.setOverallRating(calculateOverallRating(existing));

        return performanceRepository.save(existing);
    }

    public Performance updatePerformanceStatus(Long id, String status) {

        Performance performance = getPerformanceById(id);

        if (!List.of("Pending", "Reviewed").contains(status)) {
            throw new IllegalArgumentException(
                    "Invalid performance status."
            );
        }

        performance.setPerformanceStatus(status);

        return performanceRepository.save(performance);
    }

    public void deletePerformance(Long id) {

        Performance performance = getPerformanceById(id);

        performanceRepository.delete(performance);
    }

    private void validateRatings(Performance performance) {

        List<Integer> ratings = List.of(
                performance.getCommunicationRating(),
                performance.getTechnicalRating(),
                performance.getTeamworkRating(),
                performance.getProductivityRating()
        );

        for (Integer rating : ratings) {
            if (rating == null || rating < 1 || rating > 5) {
                throw new IllegalArgumentException(
                        "All performance ratings must be between 1 and 5."
                );
            }
        }
    }

    private Double calculateOverallRating(Performance performance) {

        double total =
                performance.getCommunicationRating()
                        + performance.getTechnicalRating()
                        + performance.getTeamworkRating()
                        + performance.getProductivityRating();

        return total / 4.0;
    }
}
