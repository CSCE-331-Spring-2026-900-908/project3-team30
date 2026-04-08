package com.project3.server.service;

import com.project3.server.model.SalesReport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportsService {
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    public List<SalesReport> getSalesReport(String startDate, String endDate) throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            String getSalesData = """ 
                SELECT
                    ip.item_name AS item,
                    COUNT(*) AS quantity_sold,
                    SUM(ip.price)::numeric(10,2) AS revenue
                FROM items_purchased ip
                JOIN sales s ON ip.transaction_number = s.transaction_number
                WHERE s.order_time::date >= ? AND s.order_time::date <= ?
                GROUP BY ip.item_name
                ORDER BY ip.item_name
            """;

            List<SalesReport> data = new ArrayList<>();

            try (PreparedStatement ps = conn.prepareStatement(getSalesData)) {
                System.out.println("startDate = " + startDate);
                System.out.println("endDate = " + endDate);
                ps.setDate(1, Date.valueOf(startDate));
                ps.setDate(2, Date.valueOf(endDate));

                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        data.add(new SalesReport(
                            rs.getString("item"),
                            rs.getInt("quantity_sold"),
                            rs.getDouble("revenue")
                        ));
                    }
                }catch (Exception e) {
                    System.out.println("Error processing sales report data: " + e.getMessage());
                    throw new Exception("Error processing sales report data", e);
                }
            }catch(Exception e) {
                System.out.println("Error executing sales report query: " + e.getMessage());
                throw new Exception("Error executing sales report query", e);
            }

            return data;
        }
    }
}