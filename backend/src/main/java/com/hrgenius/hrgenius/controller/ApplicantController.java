
package com.hrgenius.hrgenius.controller;

import com.hrgenius.hrgenius.entity.Applicant;
import com.hrgenius.hrgenius.service.ApplicantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applicants")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicantController {

    private final ApplicantService applicantService;

    public ApplicantController(ApplicantService applicantService) {
        this.applicantService = applicantService;
    }

    // Get all applicants
    @GetMapping
    public ResponseEntity<List<Applicant>> getAllApplicants() {
        return ResponseEntity.ok(applicantService.getAllApplicants());
    }

    // Get applicant by ID
    @GetMapping("/{id}")
    public ResponseEntity<Applicant> getApplicantById(
            @PathVariable Long id) {
        return ResponseEntity.ok(applicantService.getApplicantById(id));
    }

    // Create applicant
    @PostMapping
    public ResponseEntity<Applicant> createApplicant(
            @RequestBody Applicant applicant) {
        Applicant createdApplicant =
                applicantService.createApplicant(applicant);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdApplicant);
    }

    // Update applicant details
    @PutMapping("/{id}")
    public ResponseEntity<Applicant> updateApplicant(
            @PathVariable Long id,
            @RequestBody Applicant applicant) {
        return ResponseEntity.ok(
                applicantService.updateApplicant(id, applicant)
        );
    }

    // Update application status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Applicant> updateApplicantStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        if (!List.of(
                "Applied",
                "Shortlisted",
                "Interview",
                "Selected",
                "Rejected"
        ).contains(status)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                applicantService.updateApplicantStatus(id, status)
        );
    }

    // Delete applicant
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplicant(
            @PathVariable Long id) {
        applicantService.deleteApplicant(id);
        return ResponseEntity.noContent().build();
    }
}
