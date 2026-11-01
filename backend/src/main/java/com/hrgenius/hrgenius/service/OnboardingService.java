
package com.hrgenius.hrgenius.service;

import com.hrgenius.hrgenius.entity.Applicant;
import com.hrgenius.hrgenius.entity.Employee;
import com.hrgenius.hrgenius.entity.Onboarding;
import com.hrgenius.hrgenius.repository.ApplicantRepository;
import com.hrgenius.hrgenius.repository.EmployeeRepository;
import com.hrgenius.hrgenius.repository.OnboardingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class OnboardingService {

    private final OnboardingRepository onboardingRepository;
    private final ApplicantRepository applicantRepository;
    private final EmployeeRepository employeeRepository;

    public OnboardingService(
            OnboardingRepository onboardingRepository,
            ApplicantRepository applicantRepository,
            EmployeeRepository employeeRepository) {

        this.onboardingRepository = onboardingRepository;
        this.applicantRepository = applicantRepository;
        this.employeeRepository = employeeRepository;
    }

    // Get all onboarding records
    public List<Onboarding> getAllOnboarding() {
        return onboardingRepository.findAll();
    }

    // Get onboarding record by ID
    public Onboarding getOnboardingById(Long id) {
        return onboardingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Onboarding record not found: " + id));
    }

    // Create onboarding record
    public Onboarding createOnboarding(Onboarding onboarding) {

        if (onboardingRepository.existsByApplicantId(onboarding.getApplicantId())) {
            throw new RuntimeException(
                    "Onboarding record already exists for this applicant."
            );
        }

        onboarding.setId(null);
        onboarding.setOnboardingStatus("Not Started");
        onboarding.setDocumentsVerified(false);
        onboarding.setCreatedDate(LocalDate.now());

        return onboardingRepository.save(onboarding);
    }

    // Update onboarding details
    public Onboarding updateOnboarding(Long id, Onboarding updatedOnboarding) {

        Onboarding existing = getOnboardingById(id);

        existing.setDepartment(updatedOnboarding.getDepartment());
        existing.setDesignation(updatedOnboarding.getDesignation());
        existing.setJoiningDate(updatedOnboarding.getJoiningDate());

        return onboardingRepository.save(existing);
    }

    // Update onboarding status and create employee when completed
    @Transactional
    public Onboarding updateOnboardingStatus(Long id, String status) {

        Onboarding onboarding = getOnboardingById(id);

        if (!List.of("Not Started", "In Progress", "Completed").contains(status)) {
            throw new IllegalArgumentException("Invalid onboarding status.");
        }

        if ("Completed".equals(status)) {

            if (!Boolean.TRUE.equals(onboarding.getDocumentsVerified())) {
                throw new IllegalArgumentException(
                        "Documents must be verified before completing onboarding."
                );
            }

            Applicant applicant = applicantRepository.findById(onboarding.getApplicantId())
                    .orElseThrow(() ->
                            new RuntimeException("Applicant not found: " + onboarding.getApplicantId()));

            if (!employeeRepository.existsByEmail(applicant.getEmail())) {

                Employee employee = new Employee();

                employee.setFirstName(applicant.getFirstName());
                employee.setLastName(applicant.getLastName());
                employee.setEmail(applicant.getEmail());
                employee.setPhone(applicant.getPhone());
                employee.setDepartment(onboarding.getDepartment());
                employee.setDesignation(onboarding.getDesignation());
                employee.setEmploymentStatus("Active");
                employee.setJoiningDate(onboarding.getJoiningDate());
                employee.setSalary(BigDecimal.ZERO);

                employeeRepository.save(employee);
            }
        }

        onboarding.setOnboardingStatus(status);

        return onboardingRepository.save(onboarding);
    }

    // Update document verification
    public Onboarding updateDocumentVerification(Long id, boolean verified) {

        Onboarding onboarding = getOnboardingById(id);
        onboarding.setDocumentsVerified(verified);

        return onboardingRepository.save(onboarding);
    }

    // Delete onboarding record
    public void deleteOnboarding(Long id) {

        Onboarding onboarding = getOnboardingById(id);
        onboardingRepository.delete(onboarding);
    }
}
