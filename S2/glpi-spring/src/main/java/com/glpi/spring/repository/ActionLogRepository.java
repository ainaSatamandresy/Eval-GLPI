package com.glpi.spring.repository;

import com.glpi.spring.model.ActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActionLogRepository extends JpaRepository<ActionLog, Long> {
    List<ActionLog> findAllByOrderByTimestampDesc();
    List<ActionLog> findByItemtypeOrderByTimestampDesc(String itemtype);
    List<ActionLog> findByActionOrderByTimestampDesc(String action);
}
