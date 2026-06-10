package com.glpi.spring.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "action_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** CREATE | PATCH | DELETE */
    private String action;

    private String itemtype;

    /** ID GLPI de l'item concerné (null pour CREATE avant réponse) */
    private Integer glpiId;

    /** Corps JSON envoyé à GLPI */
    @Column(columnDefinition = "TEXT")
    private String payload;

    /** Réponse JSON reçue de GLPI */
    @Column(columnDefinition = "TEXT")
    private String response;

    /** SUCCESS | ERROR */
    private String status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private LocalDateTime timestamp;

    @PrePersist
    void prePersist() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }
}
