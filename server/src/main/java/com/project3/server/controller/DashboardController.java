package com.project3.server.controller;

import com.project3.server.model.ManagerSummary;
import com.project3.server.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * This controller class handles HTTP requests related to the manager dashboard.
 * @author Jade Azahar
 */
@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Constructor for DashboardController that initializes the DashboardService.
     * @param dashboardService
     */
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Handles GET requests to retrieve the manager summary from the database..
     * @return the manager summary
     * @throws Exception
     */
    @GetMapping("/manager-summary")
    public ManagerSummary getManagerSummary() throws Exception {
        return dashboardService.getManagerSummary();
    }
}