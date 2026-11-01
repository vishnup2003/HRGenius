package com.hrgenius.hrgenius.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "performance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Performance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String employeeName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String reviewPeriod;

    @Column(nullable = false)
    private Integer communicationRating;

    @Column(nullable = false)
    private Integer technicalRating;

    @Column(nullable = false)
    private Integer teamworkRating;

    @Column(nullable = false)
    private Integer productivityRating;

    @Column(nullable = false)
    private Double overallRating;

    private String goals;

    private String achievements;

    private String managerFeedback;

    private LocalDate reviewDate;

    private String performanceStatus = "Pending";
}
