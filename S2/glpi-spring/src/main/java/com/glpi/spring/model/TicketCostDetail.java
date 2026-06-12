package com.glpi.spring.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ticket_cost_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCostDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long recordId;

    private Integer ticketId;

    private String ticketName;

    private Double ticketCost;

    @Column(columnDefinition = "TEXT")
    private String elementsJson;

}
