package com.glpi.spring.controller;

import com.glpi.spring.model.UserPreference;
import com.glpi.spring.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/spring/preferences")
@RequiredArgsConstructor
public class UserPreferenceController {

    private final UserPreferenceRepository repo;

    @GetMapping
    public List<UserPreference> list() {
        return repo.findAll();
    }

    @GetMapping("/{key}")
    public ResponseEntity<UserPreference> get(@PathVariable String key) {
        return repo.findByKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Upsert : crée ou remplace la préférence pour cette clé */
    @PutMapping("/{key}")
    public UserPreference upsert(@PathVariable String key, @RequestBody Map<String, String> body) {
        String value = body.get("value");
        return repo.findByKey(key)
                .map(pref -> {
                    pref.setValue(value);
                    return repo.save(pref);
                })
                .orElseGet(() -> repo.save(
                        UserPreference.builder().key(key).value(value).build()
                ));
    }

    @DeleteMapping("/{key}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable String key) {
        if (repo.findByKey(key).isEmpty()) return ResponseEntity.notFound().build();
        repo.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }
}
