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

@Service
public class ManageEmployeesService {
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    int code = 0;
    String firstName = "";
    String lastName = "";
    // boolean isManager = false;
    boolean role = false;

    public List<ManageEmployees> getEmployeeList() throws Exception { //this will be refresh table
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            String getEmployees = "SELECT code, first_name, last_name, is_manager FROM users ORDER BY code";
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
                        role
                    ));
                }
                return employees;
            } catch (Exception e) {
                System.err.println("Error executing get employees query: " + e.getMessage());
                throw e; // Rethrow the exception to be handled by the controller
            }
        }
    }

    public void addEmployee(ManageEmployees employee) throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            if (employee == null
                || employee.getCode() == 0
                || employee.getFirstName() == null
                || employee.getFirstName().trim().isEmpty()
                || employee.getLastName() == null
                || employee.getLastName().trim().isEmpty()) {
            
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All fields are required.");
            }

            String addUser = "INSERT INTO users (code, first_name, last_name, is_manager) VALUES (?, ?, ?, ?)";

            try (PreparedStatement ps = conn.prepareStatement(addUser)) {
                ps.setInt(1, employee.getCode());
                ps.setString(2, employee.getFirstName());
                ps.setString(3, employee.getLastName());
                // ps.setBoolean(4, employee.getRole().equals("manager"));
                ps.setBoolean(4, "manager".equals(employee.getRole()));

                ps.executeUpdate();
                System.out.println("Added user " + employee.getCode());
                // getEmployeeList();
            } catch (Exception e) {
                System.err.println("Error executing add user query: " + e.getMessage()); 
                throw e; // Rethrow the exception to be handled by the controller
            }
        }
    }

    public void updateEmployee(ManageEmployees employee) throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            if (employee == null
                || employee.getCode() == 0
                || employee.getFirstName() == null
                || employee.getFirstName().trim().isEmpty()
                || employee.getLastName() == null
                || employee.getLastName().trim().isEmpty()) {
            
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All fields are required.");
            }

            String updateUser = "UPDATE users SET first_name = ?, last_name = ?, is_manager = ? WHERE code = ?";
            try (PreparedStatement ps = conn.prepareStatement(updateUser)) {
                ps.setString(1, employee.getFirstName());
                ps.setString(2, employee.getLastName());
                ps.setBoolean(3, "manager".equals(employee.getRole()));
                ps.setInt(4, employee.getCode());

                int updated = ps.executeUpdate();
                if (updated == 0){
                    // System.err.println("No user found with code " + employee.getCode());
                    // throw new Exception("No user found with code " + employee.getCode());
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No employee found with code " + employee.getCode());
                }
                System.out.println("Updated user " + employee.getCode());
            } catch (Exception e) {
                System.err.println("Error executing update user query: " + e.getMessage()); 
                throw e;
            }
        }
    }
    
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
                    // System.err.println("No user found with code " + employee.getCode());
                    // throw new Exception("No user found with code " + employee.getCode());
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