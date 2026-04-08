package com.project3.server.controller;

import com.project3.server.model.SalesReport;
import com.project3.server.model.XReport;
import com.project3.server.service.ReportsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReportsController {
    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/reports/salesReport")
    public List<SalesReport> getSalesReport(@RequestParam String startDate, @RequestParam String endDate) throws Exception {
        return reportsService.getSalesReport(startDate, endDate);
    }

    @GetMapping("/reports/XReport")
    public XReport getXReport() throws Exception {
        return reportsService.getXReport();
    }
}