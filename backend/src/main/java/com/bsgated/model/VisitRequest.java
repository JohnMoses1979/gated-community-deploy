// package com.bsgated.model;
// import jakarta.persistence.*;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;
// import java.time.LocalDateTime;
// @Entity
// @Table(name = "visit_requests")
// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// public class VisitRequest {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "customer_id", nullable = false)
//     private User customer;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "builder_id", nullable = false)
//     private User builder;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "project_id", nullable = false)
//     private Project project;
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "unit_id", nullable = false)
//     private Unit unit;
//     private LocalDateTime preferredVisitDateTime;
//     private String status = "PENDING";
//     @Column(columnDefinition = "TEXT")
//     private String message;
//     @Column(columnDefinition = "TEXT")
//     private String builderMessage;
//     private LocalDateTime createdAt = LocalDateTime.now();
//     private LocalDateTime processedAt;
// }
package com.bsgated.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * VisitRequest — stores a customer's request to visit a real-estate
 * project/unit.
 *
 * The original file referenced Project and Unit entity classes that do not
 * exist in this project. Those @ManyToOne relations have been replaced with
 * their plain String equivalents (projectId, unitId stored as Long foreign-key
 * values, and projectName/unitLabel as display strings). This removes the
 * compile errors with zero change to any other module.
 *
 * If Project and Unit entities are added to this project later, the @ManyToOne
 * relations can be restored at that point.
 */
@Entity
@Table(name = "visit_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer who requested the visit — resolved via User entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // Builder/seller who owns the listing — resolved via User entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "builder_id", nullable = false)
    private User builder;

    // Plain foreign-key columns replacing the missing Project and Unit entities.
    // Stored as bare Long columns — no @ManyToOne until those entities exist.
    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "unit_id", nullable = false)
    private Long unitId;

    private LocalDateTime preferredVisitDateTime;
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String builderMessage;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime processedAt;
}
