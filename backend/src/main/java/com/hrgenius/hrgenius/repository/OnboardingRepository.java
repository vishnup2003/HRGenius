package com.hrgenius.hrgenius.repository;

import com.hrgenius.hrgenius.entity.Onboarding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OnboardingRepository extends JpaRepository<Onboarding, Long> {

    Optional<Onboarding> findByApplicantId(Long applicantId);

    boolean existsByApplicantId(Long applicantId);
}
