package com.project3.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.sql.*;
import java.util.*;

@Service
public class NutritionService {

  @Value("${fooddata.api.key}")
  private String apiKey;

  @Value("${spring.datasource.url}")
  private String dbUrl;

  @Value("${spring.datasource.username}")
  private String dbUser;

  @Value("${spring.datasource.password}")
  private String dbPassword;

  private final RestTemplate restTemplate = new RestTemplate();

  // Search FoodData Central
  private Map searchFoodData(String ingredient) {
    String url = "https://api.nal.usda.gov/fdc/v1/foods/search" +
                 "?query=" + ingredient +
                 "&pageSize=1" +
                 "&api_key=" + apiKey;

    ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
    return response.getBody();
  }

  // Extract nutrient value
  private double extractNutrient(Map foodData, String nutrientNumber) {
    try {
      List<Map> foods = (List<Map>) foodData.get("foods");
      if (foods == null || foods.isEmpty()) return 0;

      List<Map> nutrients = (List<Map>) foods.get(0).get("foodNutrients");
      for (Map nutrient : nutrients) {
        if (nutrientNumber.equals(
            String.valueOf(nutrient.get("nutrientNumber")))) {
          return Double.parseDouble(
            String.valueOf(nutrient.get("value"))
          );
        }
      }
    } catch (Exception e) {
      System.err.println("Could not parse nutrient: " + nutrientNumber);
    }
    return 0;
  }

  // Get ingredients using same pattern as MenuService
  public Map<String, Double> getDrinkNutrition(String menuItemName) throws Exception {
    List<String> ingredients = new ArrayList<>();

    // Same pattern as your MenuService!
    String sql = "SELECT ingredient FROM menu_to_ingredients WHERE menu_item = ?";

    try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
         PreparedStatement stmt = conn.prepareStatement(sql)) {
      
      stmt.setString(1, menuItemName);
      
      try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) {
          ingredients.add(rs.getString("ingredient"));
        }
      }
    }

    double totalCalories = 0;
    double totalSugar    = 0;
    double totalCarbs    = 0;
    double totalFat      = 0;

    for (String ingredient : ingredients) {
      try {
        Map result     = searchFoodData(ingredient);
        totalCalories += extractNutrient(result, "208");
        totalSugar    += extractNutrient(result, "269");
        totalCarbs    += extractNutrient(result, "205");
        totalFat      += extractNutrient(result, "204");
      } catch (Exception e) {
        System.err.println("Could not fetch: " + ingredient);
      }
    }

    Map<String, Double> nutrition = new HashMap<>();
    nutrition.put("calories", totalCalories);
    nutrition.put("sugar_g",  totalSugar);
    nutrition.put("carbs_g",  totalCarbs);
    nutrition.put("fat_g",    totalFat);
    return nutrition;
  }
}