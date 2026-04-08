package com.project3.server.controller;

import com.project3.server.model.ManagerSummary;
import com.project3.server.service.DashboardService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/manager-summary")
    public ManagerSummary getManagerSummary() throws Exception {
        return dashboardService.getManagerSummary();
    }
}