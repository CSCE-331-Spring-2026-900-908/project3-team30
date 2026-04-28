package com.project3.server.service;

import com.project3.server.model.ManagerSummary;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.ZoneId;
import java.time.DateTimeException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;

/**
 * This is a service that handles the business logic for generating the manager summary in the Dashboard page
 * @author Jade Azahar
 */
@Service
public class DashboardService {

    private static final String DEFAULT_MANAGER_TIME_ZONE = "America/Chicago";

    private final DataSource dataSource;

    public DashboardService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Retrieves the manager summary for the dashboard
     * @return ManagerSummary object containing the summary data
     * @throws Exception if an error occurs while fetching the data
     */
    public ManagerSummary getManagerSummary(String timeZone) throws Exception {
        String safeTimeZone = normalizeTimeZone(timeZone);

        try (Connection conn = dataSource.getConnection()) {

            int ordersToday = 0;
            double revenueToday = 0.0;
            String topItem = "—";
            int activeEmployees = 0;

            String ordersSql = """
                WITH localized_sales AS (
                    SELECT (order_time AT TIME ZONE 'UTC' AT TIME ZONE ?) AS local_order_time
                    FROM sales
                ), latest_day AS (
                    SELECT MAX(local_order_time::date) AS sales_day FROM localized_sales
                )
                SELECT COUNT(*) AS orders_today
                FROM localized_sales, latest_day
                WHERE local_order_time::date = latest_day.sales_day
                """;

            try (PreparedStatement ps = conn.prepareStatement(ordersSql)) {
                ps.setString(1, safeTimeZone);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        ordersToday = rs.getInt("orders_today");
                    }
                }
            }

            String revenueSql = """
                WITH localized_sales AS (
                    SELECT total_cost, (order_time AT TIME ZONE 'UTC' AT TIME ZONE ?) AS local_order_time
                    FROM sales
                ), latest_day AS (
                    SELECT MAX(local_order_time::date) AS sales_day FROM localized_sales
                )
                SELECT COALESCE(SUM(total_cost), 0) AS revenue_today
                FROM localized_sales, latest_day
                WHERE local_order_time::date = latest_day.sales_day
                """;

            try (PreparedStatement ps = conn.prepareStatement(revenueSql)) {
                ps.setString(1, safeTimeZone);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        revenueToday = rs.getDouble("revenue_today");
                    }
                }
            }

            String topItemSql = """
                WITH localized_sales AS (
                    SELECT transaction_number, (order_time AT TIME ZONE 'UTC' AT TIME ZONE ?) AS local_order_time
                    FROM sales
                ), latest_day AS (
                    SELECT MAX(local_order_time::date) AS sales_day FROM localized_sales
                )
                SELECT items_purchased.item_name, COUNT(*) AS cnt
                FROM items_purchased
                JOIN localized_sales ON items_purchased.transaction_number = localized_sales.transaction_number
                CROSS JOIN latest_day
                WHERE localized_sales.local_order_time::date = latest_day.sales_day
                GROUP BY items_purchased.item_name
                ORDER BY cnt DESC
                LIMIT 1
                """;

            try (PreparedStatement ps = conn.prepareStatement(topItemSql)) {
                ps.setString(1, safeTimeZone);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        topItem = rs.getString("item_name");
                    }
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

    public Map<String, Object> getManagerInsights(String timeZone) throws Exception {
        String safeTimeZone = normalizeTimeZone(timeZone);

        try (Connection conn = dataSource.getConnection()) {
            Map<String, Object> insights = new LinkedHashMap<>();
            insights.put("hourlySales", loadHourlySales(conn, safeTimeZone));
            insights.put("categorySales", loadCategorySales(conn, safeTimeZone));
            insights.put("topItems", loadTopItems(conn, safeTimeZone));
            return insights;
        }
    }

    public List<Map<String, Object>> getManagerOrders(String search, String status, String sort, String timeZone) throws Exception {
        String safeTimeZone = normalizeTimeZone(timeZone);

        StringBuilder sql = new StringBuilder("""
            SELECT
                s.transaction_number,
                to_char((s.order_time AT TIME ZONE 'UTC' AT TIME ZONE ?), 'YYYY-MM-DD"T"HH24:MI:SS') AS order_time_local,
                s.complete,
                CASE
                    WHEN s.complete_time IS NULL THEN NULL
                    ELSE to_char((s.complete_time AT TIME ZONE 'UTC' AT TIME ZONE ?), 'YYYY-MM-DD"T"HH24:MI:SS')
                END AS complete_time_local,
                s.total_cost,
                COALESCE(STRING_AGG(i.item_name, ', ' ORDER BY i.item_name), '') AS items,
                COALESCE(STRING_AGG(NULLIF(i.notes, ''), '; ' ORDER BY i.item_name), '') AS notes
            FROM sales s
            LEFT JOIN items_purchased i ON s.transaction_number = i.transaction_number
            WHERE 1 = 1
            """);

        List<Object> params = new ArrayList<>();
        params.add(safeTimeZone);
        params.add(safeTimeZone);

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

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                List<Map<String, Object>> orders = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> order = new LinkedHashMap<>();
                    order.put("orderNum", rs.getInt("transaction_number"));
                    order.put("orderTime", rs.getString("order_time_local"));
                    order.put("complete", rs.getBoolean("complete"));
                    order.put("completeTime", rs.getString("complete_time_local"));
                    order.put("totalCost", rs.getDouble("total_cost"));
                    order.put("items", rs.getString("items"));
                    order.put("notes", rs.getString("notes"));
                    orders.add(order);
                }
                return orders;
            }
        }
    }

    private List<Map<String, Object>> loadHourlySales(Connection conn, String timeZone) throws Exception {
        String sql = """
            WITH localized_sales AS (
                SELECT total_cost, (order_time AT TIME ZONE 'UTC' AT TIME ZONE ?) AS local_order_time
                FROM sales
            ), latest_day AS (
                SELECT MAX(local_order_time::date) AS sales_day FROM localized_sales
            )
            SELECT EXTRACT(HOUR FROM local_order_time)::int AS hour,
                   COALESCE(SUM(total_cost), 0) AS revenue,
                   COUNT(*) AS orders
            FROM localized_sales, latest_day
            WHERE local_order_time::date = latest_day.sales_day
            GROUP BY EXTRACT(HOUR FROM local_order_time)
            ORDER BY hour
            """;
        return loadChartRows(conn, sql, timeZone, "hour", "revenue", "orders");
    }

    private List<Map<String, Object>> loadCategorySales(Connection conn, String timeZone) throws Exception {
        String sql = """
            WITH localized_sales AS (
                SELECT transaction_number, (order_time AT TIME ZONE 'UTC' AT TIME ZONE ?) AS local_order_time
                FROM sales
            ), latest_day AS (
                SELECT MAX(local_order_time::date) AS sales_day FROM localized_sales
            )
            SELECT COALESCE(mi.category, 'Uncategorized') AS category,
                   COALESCE(SUM(mi.price), 0) AS revenue,
                   COUNT(*) AS orders
            FROM items_purchased ip
            JOIN localized_sales s ON s.transaction_number = ip.transaction_number
            CROSS JOIN latest_day
            LEFT JOIN menu_items mi ON mi.name = ip.item_name
            WHERE s.local_order_time::date = latest_day.sales_day
            GROUP BY COALESCE(mi.category, 'Uncategorized')
            ORDER BY revenue DESC
            LIMIT 8
            """;
        return loadChartRows(conn, sql, timeZone, "category", "revenue", "orders");
    }

    private List<Map<String, Object>> loadTopItems(Connection conn, String timeZone) throws Exception {
        String sql = """
            WITH localized_sales AS (
                SELECT transaction_number, (order_time AT TIME ZONE 'UTC' AT TIME ZONE ?) AS local_order_time
                FROM sales
            ), latest_day AS (
                SELECT MAX(local_order_time::date) AS sales_day FROM localized_sales
            )
            SELECT ip.item_name AS item, COUNT(*) AS orders, COALESCE(SUM(mi.price), 0) AS revenue
            FROM items_purchased ip
            JOIN localized_sales s ON s.transaction_number = ip.transaction_number
            CROSS JOIN latest_day
            LEFT JOIN menu_items mi ON mi.name = ip.item_name
            WHERE s.local_order_time::date = latest_day.sales_day
            GROUP BY ip.item_name
            ORDER BY orders DESC, revenue DESC
            LIMIT 5
            """;
        return loadChartRows(conn, sql, timeZone, "item", "orders", "revenue");
    }

    private List<Map<String, Object>> loadChartRows(Connection conn, String sql, String timeZone, String labelColumn, String firstValueColumn, String secondValueColumn) throws Exception {
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, timeZone);
            try (ResultSet rs = ps.executeQuery()) {
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

    private String normalizeTimeZone(String timeZone) {
        if (timeZone == null || timeZone.isBlank()) {
            return DEFAULT_MANAGER_TIME_ZONE;
        }

        try {
            return ZoneId.of(timeZone).getId();
        } catch (DateTimeException ex) {
            return DEFAULT_MANAGER_TIME_ZONE;
        }
    }
}
