package com.glpi.spring.repository;

import com.glpi.spring.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    Optional<UserPreference> findByKey(String key);
    void deleteByKey(String key);
}
