package com.project3.server.service;

import com.project3.server.model.ManageEmployees;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

/**
 * This is a service that handles the business logic for managing employees
 * @author Jade Azahar
 */
@Service
public class ManageEmployeesService {
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private void ensureEmailColumn(Connection conn) throws Exception {
        String sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }

    private String cleanEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    /**
     * Retrieves the list of all employees
     * @return List of ManageEmployees objects
     * @throws Exception if an error occurs while fetching the data
     */
    public List<ManageEmployees> getEmployeeList() throws Exception { //this will be refresh table
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            ensureEmailColumn(conn);
            String getEmployees = "SELECT code, first_name, last_name, is_manager, email FROM users ORDER BY code";
            try (PreparedStatement ps = conn.prepareStatement(getEmployees);
                 ResultSet rs = ps.executeQuery()) {
                List<ManageEmployees> employees = new ArrayList<>();
                while (rs.next()) {
                    boolean isManager = rs.getBoolean("is_manager");
                    String role = isManager ? "manager" : "cashier";
                    employees.add(new ManageEmployees(
                        rs.getInt("code"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        role,
                        rs.getString("email")
                    ));
                }
                return employees;
            } catch (Exception e) {
                System.err.println("Error executing get employees query: " + e.getMessage());
                throw e; // Rethrow the exception to be handled by the controller
            }
        }
    }

    /**
     * Adds a new employee
     * @param employee the employee to add
     * @throws Exception if an error occurs while adding the employee
     */
    public void addEmployee(ManageEmployees employee) throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            ensureEmailColumn(conn);
            validateEmployee(employee);

            String addUser = "INSERT INTO users (code, first_name, last_name, is_manager, email) VALUES (?, ?, ?, ?, ?)";

            try (PreparedStatement ps = conn.prepareStatement(addUser)) {
                ps.setInt(1, employee.getCode());
                ps.setString(2, employee.getFirstName());
                ps.setString(3, employee.getLastName());
                ps.setBoolean(4, "manager".equals(employee.getRole()));
                ps.setString(5, cleanEmail(employee.getEmail()));

                ps.executeUpdate();
                System.out.println("Added user " + employee.getCode());
            } catch (Exception e) {
                System.err.println("Error executing add user query: " + e.getMessage()); 
                throw e; // Rethrow the exception to be handled by the controller
            }
        }
    }

    /**
     * Updates an existing employee
     * @param employee the employee to update
     * @throws Exception if an error occurs while updating the employee
     */
    public void updateEmployee(ManageEmployees employee) throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            ensureEmailColumn(conn);
            validateEmployee(employee);

            String updateUser = "UPDATE users SET first_name = ?, last_name = ?, is_manager = ?, email = ? WHERE code = ?";
            try (PreparedStatement ps = conn.prepareStatement(updateUser)) {
                ps.setString(1, employee.getFirstName());
                ps.setString(2, employee.getLastName());
                ps.setBoolean(3, "manager".equals(employee.getRole()));
                ps.setString(4, cleanEmail(employee.getEmail()));
                ps.setInt(5, employee.getCode());

                int updated = ps.executeUpdate();
                if (updated == 0){
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No employee found with code " + employee.getCode());
                }
                System.out.println("Updated user " + employee.getCode());
            } catch (Exception e) {
                System.err.println("Error executing update user query: " + e.getMessage()); 
                throw e;
            }
        }
    }

    private void validateEmployee(ManageEmployees employee) {
        if (employee == null
            || employee.getCode() == 0
            || employee.getFirstName() == null
            || employee.getFirstName().trim().isEmpty()
            || employee.getLastName() == null
            || employee.getLastName().trim().isEmpty()) {
        
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code, first name, and last name are required.");
        }
    }

    public boolean isAuthorizedManagerEmail(String email) throws Exception {
        String cleanedEmail = cleanEmail(email);
        if (cleanedEmail.isEmpty()) {
            return false;
        }

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            ensureEmailColumn(conn);
            String sql = "SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) AND is_manager = true LIMIT 1";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, cleanedEmail);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next();
                }
            }
        }
    }
    
    /**
     * Deletes an existing employee
     * @param employee the employee to delete
     * @throws Exception if an error occurs while deleting the employee
     */
    public void deleteEmployee(ManageEmployees employee) throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            if (employee == null || employee.getCode() == 0){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code field is required.");
            }

            String deleteUser = "DELETE FROM users WHERE code = ?";
            try (PreparedStatement ps = conn.prepareStatement(deleteUser)) {
                ps.setInt(1, employee.getCode());
                int deleted = ps.executeUpdate();
                if (deleted == 0){
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No employee found with code " + employee.getCode());
                }
                System.out.println("Deleted user " + employee.getCode());
            } catch (Exception e) {
                System.err.println("Error executing delete user query: " + e.getMessage()); 
                throw e;
            }
        }
    }
}
