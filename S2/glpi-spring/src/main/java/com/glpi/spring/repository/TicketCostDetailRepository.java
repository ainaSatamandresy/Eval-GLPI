package com.glpi.spring.repository;

import com.glpi.spring.model.TicketCostDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCostDetailRepository extends JpaRepository<TicketCostDetail, Long> {
    List<TicketCostDetail> findByRecordId(Long recordId);
}
