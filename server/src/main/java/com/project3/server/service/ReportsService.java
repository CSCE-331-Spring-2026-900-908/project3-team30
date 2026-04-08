package com.project3.server.service;

import com.project3.server.model.SalesReport;
import com.project3.server.model.XReport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
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

    public XReport getXReport() throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            Timestamp lastRunTime = null;
            String previousReport = "SELECT MAX(run_at) FROM z_report_totals";

            try (PreparedStatement ps = conn.prepareStatement(previousReport);
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    lastRunTime = rs.getTimestamp(1);
                }
            }

            double totalCash = getSalesTotal(conn, "CASH", lastRunTime);
            double totalCard = getSalesTotal(conn, "CARD", lastRunTime);
            double subtotal = totalCash + totalCard;
            double tax = subtotal * 0.0825;
            double netTotal = subtotal + tax;

            int numSales = getCount(conn, "sales", null, lastRunTime);
            int numCancelled = getCount(conn, "cancelled_voided", "CANCELLED", lastRunTime);
            int numVoided = getCount(conn, "cancelled_voided", "VOIDED", lastRunTime);

            return new XReport(
                totalCash,
                totalCard,
                subtotal,
                tax,
                netTotal,
                numSales,
                numCancelled,
                numVoided
            );
        } catch (Exception e) {
            System.out.println("Error generating XReport: " + e.getMessage());
            throw new Exception("Error generating XReport", e);
        }
    }

    public double getSalesTotal(Connection conn, String paymentType, Timestamp lastRunTime) throws Exception {
        String query = """
            SELECT COALESCE(SUM(total_cost), 0)
            FROM sales
            WHERE payment_method = ?
              AND order_time <= NOW()
        """ + (lastRunTime != null ? " AND order_time >= ?" : "");

        try (PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setString(1, paymentType);

            if (lastRunTime != null) {
                ps.setTimestamp(2, lastRunTime);
            }

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble(1);
                }
                return 0.0;
            }
        }
    }

    public int getCount(Connection conn, String table, String paymentStatus, Timestamp lastRunTime) throws Exception {
        String query = "SELECT COUNT(*) FROM " + table + " WHERE order_time <= NOW()"
                + (lastRunTime != null ? " AND order_time >= ?" : "")
                + (paymentStatus != null ? " AND order_status = ?" : "");

        try (PreparedStatement ps = conn.prepareStatement(query)) {
            int index = 1;

            if (lastRunTime != null) {
                ps.setTimestamp(index++, lastRunTime);
            }

            if (paymentStatus != null) {
                ps.setString(index, paymentStatus);
            }

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
                return 0;
            }
        }
    }
}