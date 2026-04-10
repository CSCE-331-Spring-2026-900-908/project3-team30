package com.project3.server.controller;

import com.project3.server.model.ManageEmployees;
import com.project3.server.service.ManageEmployeesService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

/**
 * This controller class handles HTTP requests related to managing employees. 
 * Each endpoint is mapped to a specific HTTP method (GET, POST, PUT, DELETE)
 * that corresponds to the operations of create, update, delete, and view employee data
 * @author Jade Azahar
 */
@RestController
@RequestMapping("/api")
public class EmployeesController {
    /** The service class for managing employees */
    private final ManageEmployeesService manageEmployeesService;

    /**
     * Constructor for EmployeesController that initializes the ManageEmployeesService.
     * @param manageEmployeesService
     */
    public EmployeesController(ManageEmployeesService manageEmployeesService) {
        this.manageEmployeesService = manageEmployeesService;
    }

    /**
     * Handles GET requests to retrieve a list of employees. 
     * @return a list of employees and their data
     * @throws Exception
     */
    @GetMapping("/manage-employees") //this is what will go in Api.js
    //first will be SHOWING the table of current employees
    public List<ManageEmployees> getEmployeeList() throws Exception {
        return manageEmployeesService.getEmployeeList();
    }

    /**
     * Handles POST requests to add a new employee.
     * @param employee the employee to add
     * @throws Exception
     */
    @PostMapping("/manage-employees/add") //this is what will go in Api.js
    public void addEmployee(@RequestBody ManageEmployees employee) throws Exception {
        manageEmployeesService.addEmployee(employee);
    }

    /**
     * Handles PUT requests to update an existing employee.
     * @param employee the employee to update
     * @throws Exception
     */
    @PutMapping("/manage-employees/update") //this is what will go in Api.js
    public void updateEmployee(@RequestBody ManageEmployees employee) throws Exception {
        manageEmployeesService.updateEmployee(employee);
    }

    /**
     * Handles DELETE requests to remove an existing employee.
     * @param employee the employee to remove
     * @throws Exception
     */
    @DeleteMapping("/manage-employees/remove") //this is what will go in Api.js
    public void removeEmployee(@RequestBody ManageEmployees employee) throws Exception {
        manageEmployeesService.deleteEmployee(employee);
    }
}
