package com.glpi.spring.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "import_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;
    private String itemtype;
    private int totalRows;
    private int successCount;
    private int failureCount;

    /** COMPLETED | PARTIAL | FAILED */
    private String status;

    private LocalDateTime importedAt;

    @PrePersist
    void prePersist() {
        if (importedAt == null) importedAt = LocalDateTime.now();
    }
}
