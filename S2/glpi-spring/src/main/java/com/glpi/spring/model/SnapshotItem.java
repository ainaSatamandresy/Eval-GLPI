package com.glpi.spring.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "snapshot_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SnapshotItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "snapshot_id", nullable = false)
    @JsonIgnore
    private Snapshot snapshot;

    /** ID de l'item dans GLPI */
    private int glpiId;

    /** JSON : état original avant l'opération bulk — ex: {"status":2,"urgency":3} */
    @Column(columnDefinition = "TEXT")
    private String originalState;

    /** JSON : liste des champs modifiés — ex: ["status","urgency"] */
    @Column(columnDefinition = "TEXT")
    private String modifiedFields;
}
