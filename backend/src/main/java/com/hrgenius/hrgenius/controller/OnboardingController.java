package com.hrgenius.hrgenius.controller;

import com.hrgenius.hrgenius.entity.Onboarding;
import com.hrgenius.hrgenius.service.OnboardingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "http://localhost:5173")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    // Get all onboarding records
    @GetMapping
    public ResponseEntity<List<Onboarding>> getAllOnboarding() {
        return ResponseEntity.ok(onboardingService.getAllOnboarding());
    }

    // Get onboarding record by ID
    @GetMapping("/{id}")
    public ResponseEntity<Onboarding> getOnboardingById(
            @PathVariable Long id) {
        return ResponseEntity.ok(onboardingService.getOnboardingById(id));
    }

    // Create onboarding record
    @PostMapping
    public ResponseEntity<Onboarding> createOnboarding(
            @RequestBody Onboarding onboarding) {

        Onboarding created = onboardingService.createOnboarding(onboarding);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Update onboarding details
    @PutMapping("/{id}")
    public ResponseEntity<Onboarding> updateOnboarding(
            @PathVariable Long id,
            @RequestBody Onboarding onboarding) {

        return ResponseEntity.ok(
                onboardingService.updateOnboarding(id, onboarding)
        );
    }

    // Update onboarding status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Onboarding> updateOnboardingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        if (!List.of("Not Started", "In Progress", "Completed")
                .contains(status)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                onboardingService.updateOnboardingStatus(id, status)
        );
    }

    // Update document verification
    @PatchMapping("/{id}/documents")
    public ResponseEntity<Onboarding> updateDocumentVerification(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {

        Boolean verified = request.get("verified");

        if (verified == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                onboardingService.updateDocumentVerification(id, verified)
        );
    }

    // Delete onboarding record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOnboarding(
            @PathVariable Long id) {

        onboardingService.deleteOnboarding(id);
        return ResponseEntity.noContent().build();
    }
}
