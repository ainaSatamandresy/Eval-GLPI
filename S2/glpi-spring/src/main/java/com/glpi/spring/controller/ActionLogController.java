package com.glpi.spring.controller;

import com.glpi.spring.model.ActionLog;
import com.glpi.spring.repository.ActionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/spring/logs")
@RequiredArgsConstructor
public class ActionLogController {

    private final ActionLogRepository repo;

    @GetMapping
    public List<ActionLog> list(
            @RequestParam(required = false) String itemtype,
            @RequestParam(required = false) String action) {
        if (itemtype != null) return repo.findByItemtypeOrderByTimestampDesc(itemtype);
        if (action != null) return repo.findByActionOrderByTimestampDesc(action);
        return repo.findAllByOrderByTimestampDesc();
    }

    @PostMapping
    public ResponseEntity<ActionLog> create(@RequestBody ActionLog log) {
        return ResponseEntity.status(201).body(repo.save(log));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAll() {
        repo.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
