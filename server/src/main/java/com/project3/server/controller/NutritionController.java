package com.project3.server.controller;

import com.project3.server.service.NutritionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

  private final NutritionService nutritionService;

  public NutritionController(NutritionService nutritionService) {
    this.nutritionService = nutritionService;
  }

  // GET /api/nutrition/Brown Sugar Milk Tea for example
  @GetMapping("/{menuItemName}")
  public ResponseEntity<Map<String, Double>> getNutrition(
      @PathVariable String menuItemName) {
    try {
        System.out.println("test");
      Map<String, Double> nutrition = 
        nutritionService.getDrinkNutrition(menuItemName);
        System.out.println("Returning nutrition: " + nutrition);
      return ResponseEntity.ok(nutrition);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }
}