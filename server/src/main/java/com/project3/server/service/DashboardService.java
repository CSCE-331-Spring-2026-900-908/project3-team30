package com.project3.server.service;

import com.project3.server.model.ManagerSummary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

    public Map<String, Object> getManagerInsights() throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            Map<String, Object> insights = new LinkedHashMap<>();
            insights.put("hourlySales", loadHourlySales(conn));
            insights.put("categorySales", loadCategorySales(conn));
            insights.put("topItems", loadTopItems(conn));
            return insights;
        }
    }

    public List<Map<String, Object>> getManagerOrders(String search, String status, String sort) throws Exception {
        StringBuilder sql = new StringBuilder("""
            SELECT
                s.transaction_number,
                s.order_time,
                s.complete,
                s.complete_time,
                s.total_cost,
                COALESCE(STRING_AGG(i.item_name, ', ' ORDER BY i.item_name), '') AS items,
                COALESCE(STRING_AGG(NULLIF(i.notes, ''), '; ' ORDER BY i.item_name), '') AS notes
            FROM sales s
            LEFT JOIN items_purchased i ON s.transaction_number = i.transaction_number
            WHERE 1 = 1
            """);

        List<Object> params = new ArrayList<>();

        if ("active".equalsIgnoreCase(status)) {
            sql.append(" AND s.complete = false\n");
        } else if ("completed".equalsIgnoreCase(status)) {
            sql.append(" AND s.complete = true\n");
        }

        if (search != null && !search.isBlank()) {
            sql.append(" AND (CAST(s.transaction_number AS TEXT) ILIKE ? OR i.item_name ILIKE ?)\n");
            String searchPattern = "%" + search.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
        }

        sql.append("""
            GROUP BY s.transaction_number, s.order_time, s.complete, s.complete_time, s.total_cost
            """);

        sql.append(switch (sort == null ? "newest" : sort) {
            case "oldest" -> " ORDER BY s.order_time ASC";
            case "totalHigh" -> " ORDER BY s.total_cost DESC NULLS LAST, s.order_time DESC";
            case "totalLow" -> " ORDER BY s.total_cost ASC NULLS LAST, s.order_time DESC";
            case "status" -> " ORDER BY s.complete ASC, s.order_time DESC";
            default -> " ORDER BY s.order_time DESC";
        });
        sql.append(" LIMIT 100");

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                List<Map<String, Object>> orders = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> order = new LinkedHashMap<>();
                    order.put("orderNum", rs.getInt("transaction_number"));
                    order.put("orderTime", rs.getTimestamp("order_time"));
                    order.put("complete", rs.getBoolean("complete"));
                    order.put("completeTime", rs.getTimestamp("complete_time"));
                    order.put("totalCost", rs.getDouble("total_cost"));
                    order.put("items", rs.getString("items"));
                    order.put("notes", rs.getString("notes"));
                    orders.add(order);
                }
                return orders;
            }
        }
    }

    private List<Map<String, Object>> loadHourlySales(Connection conn) throws Exception {
        String sql = """
            SELECT EXTRACT(HOUR FROM order_time)::int AS hour, COALESCE(SUM(total_cost), 0) AS revenue, COUNT(*) AS orders
            FROM sales
            WHERE order_time::date = (SELECT MAX(order_time)::date FROM sales)
            GROUP BY EXTRACT(HOUR FROM order_time)
            ORDER BY hour
            """;
        return loadChartRows(conn, sql, "hour", "revenue", "orders");
    }

    private List<Map<String, Object>> loadCategorySales(Connection conn) throws Exception {
        String sql = """
            SELECT COALESCE(mi.category, 'Uncategorized') AS category,
                   COALESCE(SUM(mi.price), 0) AS revenue,
                   COUNT(*) AS orders
            FROM items_purchased ip
            JOIN sales s ON s.transaction_number = ip.transaction_number
            LEFT JOIN menu_items mi ON mi.name = ip.item_name
            WHERE s.order_time::date = (SELECT MAX(order_time)::date FROM sales)
            GROUP BY COALESCE(mi.category, 'Uncategorized')
            ORDER BY revenue DESC
            LIMIT 8
            """;
        return loadChartRows(conn, sql, "category", "revenue", "orders");
    }

    private List<Map<String, Object>> loadTopItems(Connection conn) throws Exception {
        String sql = """
            SELECT ip.item_name AS item, COUNT(*) AS orders, COALESCE(SUM(mi.price), 0) AS revenue
            FROM items_purchased ip
            JOIN sales s ON s.transaction_number = ip.transaction_number
            LEFT JOIN menu_items mi ON mi.name = ip.item_name
            WHERE s.order_time::date = (SELECT MAX(order_time)::date FROM sales)
            GROUP BY ip.item_name
            ORDER BY orders DESC, revenue DESC
            LIMIT 5
            """;
        return loadChartRows(conn, sql, "item", "orders", "revenue");
    }

    private List<Map<String, Object>> loadChartRows(Connection conn, String sql, String labelColumn, String firstValueColumn, String secondValueColumn) throws Exception {
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<Map<String, Object>> rows = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("label", rs.getObject(labelColumn));
                row.put(firstValueColumn, rs.getDouble(firstValueColumn));
                row.put(secondValueColumn, rs.getDouble(secondValueColumn));
                rows.add(row);
            }
            return rows;
        }
    }
}
