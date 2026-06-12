package com.glpi.spring.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_cost_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCostRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalCost;

    private LocalDateTime timestamp;

    @PrePersist
    void prePersist() {
        if (timestamp == null)
            timestamp = LocalDateTime.now();
    }
}
