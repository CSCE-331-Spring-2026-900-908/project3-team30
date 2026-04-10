package com.project3.server.service;

import com.project3.server.model.ManagerSummary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * This is a service that handles the business logic for generating the manager summary in the Dashboard page
 * @author Jade Azahar
 */
@Service
public class DashboardService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    /**
     * Retrieves the manager summary for the dashboard
     * @return ManagerSummary object containing the summary data
     * @throws Exception if an error occurs while fetching the data
     */
    public ManagerSummary getManagerSummary() throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {

            int ordersToday = 0;
            double revenueToday = 0.0;
            String topItem = "—";
            int activeEmployees = 0;

            String ordersSql = """
                SELECT COUNT(*) AS orders_today
                FROM sales
                WHERE order_time::date = (SELECT MAX(order_time)::date FROM sales)
                """;

            try (PreparedStatement ps = conn.prepareStatement(ordersSql);
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    ordersToday = rs.getInt("orders_today");
                }
            }

            String revenueSql = """
                SELECT COALESCE(SUM(total_cost), 0) AS revenue_today
                FROM sales
                WHERE order_time::date = (SELECT MAX(order_time)::date FROM sales)
                """;

            try (PreparedStatement ps = conn.prepareStatement(revenueSql);
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    revenueToday = rs.getDouble("revenue_today");
                }
            }

            String topItemSql = """
                SELECT items_purchased.item_name, COUNT(*) AS cnt
                FROM items_purchased
                JOIN sales ON items_purchased.transaction_number = sales.transaction_number
                WHERE sales.order_time::date = (SELECT MAX(order_time)::date FROM sales)
                GROUP BY items_purchased.item_name
                ORDER BY cnt DESC
                LIMIT 1
                """;

            try (PreparedStatement ps = conn.prepareStatement(topItemSql);
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    topItem = rs.getString("item_name");
                }
            }

            String employeesSql = """
                SELECT COUNT(*) AS employee_count
                FROM users
                """;

            try (PreparedStatement ps = conn.prepareStatement(employeesSql);
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    activeEmployees = rs.getInt("employee_count");
                }
            }

            return new ManagerSummary(ordersToday, revenueToday, topItem, activeEmployees);
        }
    }
}