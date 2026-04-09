package com.project3.server.service;

import com.project3.server.model.RestockReport;
import com.project3.server.model.SalesReport;
import com.project3.server.model.XReport;
import com.project3.server.model.ZReport;

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

/**
 * This is a service that handles the business logic for generating reports in the Sales & Trends page
 * @author Jade Azahar
 */
@Service
public class ReportsService {
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    /**
     * This method gets the sales report for a given date range
     * @param startDate
     * @param endDate
     * @return list of sales report objects containing item name, quantity sold, and revenue for each item
     * @throws Exception
     */
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

    /**
     * This method gets the X report for the current day
     * @return XReport object containing total cash sales, total card sales, subtotal, etc. by calling helper functions
     * @throws Exception
     */
    public XReport getXReport() throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            Timestamp lastRunTime = getLastZReportTimestamp(conn);
            return buildXReportData(conn, lastRunTime);
        } catch (Exception e) {
            System.out.println("Error generating XReport: " + e.getMessage());
            throw new Exception("Error generating XReport", e);
        }
    }
    
    /**
     * This method gets the restock report, which includes all items that are below their minimum stock level
     * @return a list of restock report objects containing item name, amount in stock, and minimum stock needed for each item that is below the minimum stock level
     * @throws Exception
     */
    public List<RestockReport> getRestockReport() throws Exception {
    try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
        String getRestockData = """
            SELECT
                sku,
                name,
                amt_in_stock,
                min_stock_needed
            FROM ingredients_alterations
            WHERE amt_in_stock < min_stock_needed
            ORDER BY name
        """;

        List<RestockReport> data = new ArrayList<>();

        try (PreparedStatement ps = conn.prepareStatement(getRestockData);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                data.add(new RestockReport(
                    rs.getString("sku"),
                    rs.getString("name"),
                    rs.getDouble("amt_in_stock"),
                    rs.getDouble("min_stock_needed")
                ));
            }

        } catch (Exception e) {
            System.out.println("Error processing restock report data: " + e.getMessage());
            throw new Exception("Error processing restock report data", e);
        }

        return data;
    } catch (Exception e) {
        System.out.println("Error executing restock report query: " + e.getMessage());
        throw new Exception("Error executing restock report query", e);
    }
}

    /**
     * This method calculates the total sales for a given payment type (CASH or CARD) since the last time the X report was run
     * @param conn
     * @param paymentType
     * @param lastRunTime
     * @return the total sales amount for the given payment type and time range
     * @throws Exception
     */
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

    /**
     * This method counts the number of sales, cancelled transactions, or voided transactions since the last time the X report was run
     * @param conn
     * @param table
     * @param paymentStatus
     * @param lastRunTime
     * @return integer count of the number of transactions matching the given criteria
     * @throws Exception
     */
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

    /**
     * This method builds the X report data for the current day
     * @param conn
     * @param lastRunTime
     * @return XReport object with all the parameters needed for the X report
     * @throws Exception
     */
    public XReport buildXReportData(Connection conn, Timestamp lastRunTime) throws Exception {
        double totalCash = getSalesTotal(conn, "CASH", lastRunTime);
        double totalCard = getSalesTotal(conn, "CARD", lastRunTime);
        double subtotal = totalCash + totalCard;
        double tax = subtotal * 0.0825;
        double netTotal = subtotal + tax;

        int numSales = getCount(conn, "sales", null, lastRunTime);
        int numCancelled = getCount(conn, "cancelled_voided", "CANCELLED", lastRunTime);
        int numVoided = getCount(conn, "cancelled_voided", "VOIDED", lastRunTime);

        Timestamp now = new Timestamp(System.currentTimeMillis());

        return new XReport(
            totalCash,
            totalCard,
            subtotal,
            tax,
            netTotal,
            numSales,
            numCancelled,
            numVoided,
            now
        );
    }

    /**
     * This method gets the timestamp of the last generated Z report
     * @param conn
     * @return Timestamp of the last generated Z report or null if none exists
     * @throws Exception
     */
    private Timestamp getLastZReportTimestamp(Connection conn) throws Exception {
        String previousReport = "SELECT MAX(run_at) FROM z_report_totals";

        try (PreparedStatement ps = conn.prepareStatement(previousReport);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getTimestamp(1);
            }
            return null;
        }
    }

    /**
     * This method gets the Z report for the current day
     * @return ZReport object with all the parameters needed for the Z report
     * @throws Exception
     */
    public ZReport getZReport() throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            Timestamp lastRunTime = getLastZReportTimestamp(conn);

            // check if today's Z report already exists
            if (lastRunTime == null || lastRunTime.toLocalDateTime().toLocalDate().isBefore(java.time.LocalDate.now())) {
                // if not, build snapshot, save it, then return it
                Timestamp now = new Timestamp(System.currentTimeMillis());
                XReport xReport = buildXReportData(conn, lastRunTime);
                saveZReport(conn, xReport, now);
                 return new ZReport(
                    xReport.getTotalCash(),
                    xReport.getTotalCard(),
                    xReport.getSubtotal(),
                    xReport.getTax(),
                    xReport.getNetTotal(),
                    xReport.getNumSales(),
                    xReport.getNumCancelled(),
                    xReport.getNumVoided(),
                    now,
                    true
                );                
            }else{
                // if yes, load and return it
                return loadExistingZReport(conn, lastRunTime);
            }
            // if yes, load and return it
            // if no, build snapshot, save it, then return it
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
            // System.out.println("Error generating ZReport: " + e.getMessage());
            // throw new Exception("Error generating ZReport", e);
        }
    } 

    /**
     * This method saves the Z report data to the database
     * @param conn
     * @param xReport
     * @param runAt
     * @throws Exception
     */
    private void saveZReport(Connection conn, XReport xReport, Timestamp runAt) throws Exception {
        String insertZReport = """
            INSERT INTO z_report_totals (
                total_cash,
                total_card,
                num_sales,
                num_cancelled,
                num_voided,
                run_at
            ) VALUES (?, ?, ?, ?, ?, ?)
        """;

        try (PreparedStatement ps = conn.prepareStatement(insertZReport)) {
            ps.setDouble(1, xReport.getTotalCash());
            ps.setDouble(2, xReport.getTotalCard());
            ps.setInt(3, xReport.getNumSales());
            ps.setInt(4, xReport.getNumCancelled());
            ps.setInt(5, xReport.getNumVoided());
            ps.setTimestamp(6, runAt);

            ps.executeUpdate();
        } catch (Exception e) {
            System.out.println("Error saving ZReport data: " + e.getMessage());
            throw new Exception("Error saving ZReport data", e);
        }
    }

    /**
     * This method loads an existing Z report from the database
     * @param conn
     * @param lastRunTime
     * @return ZReport object with the loaded data
     * @throws Exception
     */
    public ZReport loadExistingZReport(Connection conn, Timestamp lastRunTime) throws Exception {
        String getZReport = """
                    SELECT run_at, total_cash, total_card, num_sales, num_cancelled, num_voided
                    FROM z_report_totals
                    WHERE run_at = ?
                """;

        try (PreparedStatement ps = conn.prepareStatement(getZReport)) {
            ps.setTimestamp(1, lastRunTime);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Timestamp runAt = rs.getTimestamp("run_at");
                    double totalCash = rs.getDouble("total_cash");
                    double totalCard = rs.getDouble("total_card");
                    double subtotal = totalCash + totalCard;
                    double tax = subtotal * 0.0825;
                    double netTotal = subtotal + tax;
                    return new ZReport(
                        totalCash,
                        totalCard,
                        subtotal,
                        tax,
                        netTotal,
                        rs.getInt("num_sales"),
                        rs.getInt("num_cancelled"),
                        rs.getInt("num_voided"),
                        runAt,
                        false
                    );
                }
            }catch (Exception e) {
                System.out.println("Error executing ZReport query: " + e.getMessage());
                throw new Exception("Error executing ZReport query", e);
            }
        } 
        System.out.println("Error loading existing ZReport data: " + lastRunTime);
        throw new Exception("Error loading existing ZReport data");
    }

    /**
     * This method gets the latest Z report
     * @return the latest Z report data
     * @throws Exception
     */
    public ZReport getLatestZReport() throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            Timestamp lastRunTime = getLastZReportTimestamp(conn);

            if (lastRunTime == null) {
                return null;
            }

            return loadExistingZReport(conn, lastRunTime);
        } catch (Exception e) {
            System.out.println("Error loading latest ZReport: " + e.getMessage());
            throw new Exception("Error loading latest ZReport", e);
        }
    }
}