
package com.hrgenius.hrgenius.service;

import com.hrgenius.hrgenius.entity.Applicant;
import com.hrgenius.hrgenius.repository.ApplicantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicantService {

    private final ApplicantRepository applicantRepository;

    public ApplicantService(ApplicantRepository applicantRepository) {
        this.applicantRepository = applicantRepository;
    }

    // Get all applicants
    public List<Applicant> getAllApplicants() {
        return applicantRepository.findAll();
    }

    // Get applicant by ID
    public Applicant getApplicantById(Long id) {
        return applicantRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Applicant not found with ID: " + id));
    }

    // Create applicant
    public Applicant createApplicant(Applicant applicant) {

        if (applicantRepository.existsByEmail(applicant.getEmail())) {
            throw new RuntimeException(
                    "An applicant with this email already exists."
            );
        }

        applicant.setId(null);
        applicant.setStatus("Applied");
        applicant.setAppliedDate(LocalDate.now());

        return applicantRepository.save(applicant);
    }

    // Update applicant
    public Applicant updateApplicant(Long id, Applicant updatedApplicant) {

        Applicant existingApplicant = getApplicantById(id);

        if (!existingApplicant.getEmail().equalsIgnoreCase(updatedApplicant.getEmail())
                && applicantRepository.existsByEmail(updatedApplicant.getEmail())) {
            throw new RuntimeException(
                    "An applicant with this email already exists."
            );
        }

        existingApplicant.setFirstName(updatedApplicant.getFirstName());
        existingApplicant.setLastName(updatedApplicant.getLastName());
        existingApplicant.setEmail(updatedApplicant.getEmail());
        existingApplicant.setPhone(updatedApplicant.getPhone());
        existingApplicant.setAppliedFor(updatedApplicant.getAppliedFor());

        return applicantRepository.save(existingApplicant);
    }

    // Update application status
    public Applicant updateApplicantStatus(Long id, String status) {

        Applicant applicant = getApplicantById(id);

        applicant.setStatus(status);

        return applicantRepository.save(applicant);
    }

    // Delete applicant
    public void deleteApplicant(Long id) {

        Applicant applicant = getApplicantById(id);

        applicantRepository.delete(applicant);
    }
}
