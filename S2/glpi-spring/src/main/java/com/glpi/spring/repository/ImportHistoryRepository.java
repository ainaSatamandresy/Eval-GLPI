package com.glpi.spring.repository;

import com.glpi.spring.model.ImportHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportHistoryRepository extends JpaRepository<ImportHistory, Long> {
    List<ImportHistory> findAllByOrderByImportedAtDesc();
    List<ImportHistory> findByItemtypeOrderByImportedAtDesc(String itemtype);
}
