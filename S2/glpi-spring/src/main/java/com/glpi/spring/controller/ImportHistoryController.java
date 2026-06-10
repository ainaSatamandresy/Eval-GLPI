package com.glpi.spring.controller;

import com.glpi.spring.model.ImportHistory;
import com.glpi.spring.repository.ImportHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/spring/imports")
@RequiredArgsConstructor
public class ImportHistoryController {

    private final ImportHistoryRepository repo;

    @GetMapping
    public List<ImportHistory> list(@RequestParam(required = false) String itemtype) {
        if (itemtype != null) return repo.findByItemtypeOrderByImportedAtDesc(itemtype);
        return repo.findAllByOrderByImportedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImportHistory> get(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ImportHistory> create(@RequestBody ImportHistory importHistory) {
        return ResponseEntity.status(201).body(repo.save(importHistory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
