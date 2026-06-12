package com.glpi.spring.controller;

import com.glpi.spring.model.TicketCostRecord;
import com.glpi.spring.model.TicketCostDetail;
import com.glpi.spring.repository.TicketCostRecordRepository;
import com.glpi.spring.repository.TicketCostDetailRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/spring/costs")
@RequiredArgsConstructor
public class TicketCostController {

    private final TicketCostRecordRepository recordRepo;
    private final TicketCostDetailRepository detailRepo;

    @GetMapping
    public List<TicketCostRecord> listRecords() {
        return recordRepo.findAllByOrderByTimestampDesc();
    }

    @GetMapping("/{recordId}/details")
    public List<TicketCostDetail> getDetails(@PathVariable Long recordId) {
        return detailRepo.findByRecordId(recordId);
    }

    @PostMapping
    public ResponseEntity<TicketCostRecord> saveCosts(@RequestBody CostSaveRequest request) {
        TicketCostRecord record = new TicketCostRecord();
        record.setTotalCost(request.getTotalCost());
        record = recordRepo.save(record);

        if (request.getDetails() != null) {
            for (CostDetailDto dto : request.getDetails()) {
                TicketCostDetail detail = new TicketCostDetail();
                detail.setRecordId(record.getId());
                detail.setTicketId(dto.getTicketId());
                detail.setTicketName(dto.getTicketName());
                detail.setTicketCost(dto.getTicketCost());
                detail.setElementsJson(dto.getElementsJson());
                detailRepo.save(detail);
            }
        }
        return ResponseEntity.status(201).body(record);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAll() {
        detailRepo.deleteAll();
        recordRepo.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class CostSaveRequest {
        private Double totalCost;
        private List<CostDetailDto> details;
    }

    @Data
    public static class CostDetailDto {
        private Integer ticketId;
        private String ticketName;
        private Double ticketCost;
        private String elementsJson;
    }
}
