package com.glpi.spring.repository;

import com.glpi.spring.model.TicketCostRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCostRecordRepository extends JpaRepository<TicketCostRecord, Long> {
    List<TicketCostRecord> findAllByOrderByTimestampDesc();
}
