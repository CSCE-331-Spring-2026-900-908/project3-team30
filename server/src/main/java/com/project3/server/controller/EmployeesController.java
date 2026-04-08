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

@RestController
@RequestMapping("/api")
public class EmployeesController {
    private final ManageEmployeesService manageEmployeesService;

    public EmployeesController(ManageEmployeesService manageEmployeesService) {
        this.manageEmployeesService = manageEmployeesService;
    }

    @GetMapping("/manage-employees") //this is what will go in Api.js
    //first will be SHOWING the table of current employees
    public List<ManageEmployees> getEmployeeList() throws Exception {
        return manageEmployeesService.getEmployeeList();
    }

    @PostMapping("/manage-employees/add") //this is what will go in Api.js
    public void addEmployee(@RequestBody ManageEmployees employee) throws Exception {
        manageEmployeesService.addEmployee(employee);
    }

    // @PutMapping("/manage-employees/update") //this is what will go in Api.js
    // public void updateEmployee(@RequestBody ManageEmployees employee) throws Exception {
    //     manageEmployeesService.updateEmployee(employee);
    // }

    @DeleteMapping("/manage-employees/remove") //this is what will go in Api.js
    public void removeEmployee(@RequestBody ManageEmployees employee) throws Exception {
        manageEmployeesService.deleteEmployee(employee);
    }
}
