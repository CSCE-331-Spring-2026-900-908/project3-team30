package com.project3.server.controller;

import com.project3.server.model.RestockReport;
import com.project3.server.model.SalesReport;
import com.project3.server.model.XReport;
import com.project3.server.model.ZReport;
import com.project3.server.service.ReportsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

/**
* This is a controller that handles API report requests in the Sales & Trends page 
* @author Jade Azahar
*/
@RestController
@RequestMapping("/api")
public class ReportsController {
    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    /**
     * This method gets the sales report for a given date range
     * @param startDate
     * @param endDate
     * @return a list of sales report objects
     * @throws Exception
     */
    @GetMapping("/reports/salesReport")
    public List<SalesReport> getSalesReport(@RequestParam String startDate, @RequestParam String endDate) throws Exception {
        return reportsService.getSalesReport(startDate, endDate);
    }

    /**
     * This method gets the X report for the current day
     * @return XReport object with all the parameters needed for the X report (numSales, totalRevenue, etc.)
     * @throws Exception
     */
    @GetMapping("/reports/XReport")
    public XReport getXReport() throws Exception {
        return reportsService.getXReport();
    }

    /**
     * This method gets the restock report, which includes all items that are below their minimum stock level
     * @return a list of restock report objects containing item name, amount in stock, and minimum stock needed for each item that is below the minimum stock level
     * @throws Exception
     */

    @GetMapping("/reports/restockReport")
    public List<RestockReport> getRestockReport() throws Exception {
        return reportsService.getRestockReport();
    }

    /**
     * This method gets the Z report for the current day
     * @return ZReport object with all the parameters needed for the Z report (numSales, totalRevenue, etc.)
     * @throws Exception
     */
    @GetMapping("/reports/ZReport")
    public ZReport getZReport() throws Exception {
        return reportsService.getZReport();
    }
}