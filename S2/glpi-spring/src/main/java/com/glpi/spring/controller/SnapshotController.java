package com.glpi.spring.controller;

import com.glpi.spring.model.Snapshot;
import com.glpi.spring.repository.SnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/spring/snapshots")
@RequiredArgsConstructor
public class SnapshotController {

    private final SnapshotRepository repo;

    @GetMapping
    public List<Snapshot> list(@RequestParam(required = false) String itemtype) {
        if (itemtype != null) return repo.findByItemtypeOrderByCreatedAtDesc(itemtype);
        return repo.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Snapshot> get(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Snapshot> create(@RequestBody Snapshot snapshot) {
        // Lier chaque item au snapshot parent avant persistance
        snapshot.getItems().forEach(item -> item.setSnapshot(snapshot));
        return ResponseEntity.status(201).body(repo.save(snapshot));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
