package com.project3.server.model;

/**
 * This is a model class that represents an employee management record, which includes the necessary fields for managing employees
 * @author Jade Azahar
 */
public class ManageEmployees {
    private int code;
    private String firstName;
    private String lastName;
    private String role;

    /**
     * Constructor for ManageEmployees
     */
    public ManageEmployees() {
    }

    /**
     * Constructor for ManageEmployees
     * @param code
     * @param firstName
     * @param lastName
     * @param role
     */
    public ManageEmployees(int code, String firstName, String lastName, String role) {
        this.code = code;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    /**
     * Getters and setters for ManageEmployees fields
     * @return int for employee code, string for first name, last name, and role
     */
    public int getCode() {
        return code;
    }

    /**
     * Setters for ManageEmployees fields
     * @param code
     */
    public void setCode(int code) {
        this.code = code;
    }

    /**
     * Getters and setters for ManageEmployees fields
     * @return string for first name
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * Setters for ManageEmployees fields
     * @param firstName
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Getters and setters for ManageEmployees fields
     * @return string for last name
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * Setters for ManageEmployees fields
     * @param lastName
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * Getters and setters for ManageEmployees fields
     * @return string for role
     */
    public String getRole() {
        return role;
    }

    /**
     * Setters for ManageEmployees fields
     * @param role
     */
    public void setRole(String role) {
        this.role = role;
    }
}