package com.hrgenius.hrgenius.service;

import com.hrgenius.hrgenius.entity.Job;
import com.hrgenius.hrgenius.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // Get all jobs
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // Get job by ID
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Job not found with ID: " + id));
    }

    // Create new job
    public Job createJob(Job job) {
        job.setId(null);
        job.setApplicants(0);
        job.setStatus("Active");
        job.setPostedDate(LocalDate.now());

        return jobRepository.save(job);
    }

    // Update existing job
    public Job updateJob(Long id, Job updatedJob) {
        Job existingJob = getJobById(id);

        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setDepartment(updatedJob.getDepartment());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setEmploymentType(updatedJob.getEmploymentType());
        existingJob.setOpenings(updatedJob.getOpenings());
        existingJob.setStatus(updatedJob.getStatus());

        return jobRepository.save(existingJob);
    }

    // Change job status
    public Job updateJobStatus(Long id, String status) {
        Job job = getJobById(id);
        job.setStatus(status);

        return jobRepository.save(job);
    }

    // Delete job
    public void deleteJob(Long id) {
        Job job = getJobById(id);
        jobRepository.delete(job);
    }
}
