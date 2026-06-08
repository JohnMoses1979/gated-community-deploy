package com.bsgated.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "construction_milestones")
public class ConstructionMilestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private Project project;

    private String title;

    private Double percentageCompletion;

    private LocalDate expectedCompletionDate;

    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED

    public ConstructionMilestone() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Double getPercentageCompletion() { return percentageCompletion; }
    public void setPercentageCompletion(Double percentageCompletion) { this.percentageCompletion = percentageCompletion; }
    public LocalDate getExpectedCompletionDate() { return expectedCompletionDate; }
    public void setExpectedCompletionDate(LocalDate expectedCompletionDate) { this.expectedCompletionDate = expectedCompletionDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
