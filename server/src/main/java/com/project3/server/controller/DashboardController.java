package com.project3.server.controller;

import com.project3.server.model.ManagerSummary;
import com.project3.server.service.DashboardService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "https://project3-team30.vercel.app"})
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