package com.project3.server.controller;

import com.project3.server.model.ManagerSummary;
import com.project3.server.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/manager-insights")
    public Map<String, Object> getManagerInsights() throws Exception {
        return dashboardService.getManagerInsights();
    }

    @GetMapping("/manager-orders")
    public List<Map<String, Object>> getManagerOrders(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false, defaultValue = "newest") String sort
    ) throws Exception {
        return dashboardService.getManagerOrders(search, status, sort);
    }
}
