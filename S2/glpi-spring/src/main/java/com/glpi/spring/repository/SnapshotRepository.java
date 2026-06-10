package com.glpi.spring.repository;

import com.glpi.spring.model.Snapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SnapshotRepository extends JpaRepository<Snapshot, Long> {
    List<Snapshot> findAllByOrderByCreatedAtDesc();
    List<Snapshot> findByItemtypeOrderByCreatedAtDesc(String itemtype);
}
