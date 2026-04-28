package com.project3.server.service;

import com.project3.server.model.AlterationOptionsResponse;
import com.project3.server.model.ChatRequest;
import com.project3.server.model.Drink;
import com.project3.server.model.Modification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class GeminiChatService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String getChatReply(ChatRequest request) throws IOException, InterruptedException {
        if (request == null) {
            return "Ask me about drinks, toppings, sweetness, or ice levels.";
        }

        if (apiKey == null || apiKey.isBlank()) {
            return fallbackReply(request);
        }

        String prompt = buildPrompt(request);
        String escapedPrompt = escapeJson(prompt);

        String requestBody = """
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "text": "%s"
                        }
                      ]
                    }
                  ]
                }
                """.formatted(escapedPrompt);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/"
                        + model + ":generateContent"))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            return fallbackReply(request);
        }

        String text = extractTextFromGeminiResponse(response.body());
        if (text == null || text.isBlank()) {
            return fallbackReply(request);
        }

        return text.trim();
    }

    private String buildPrompt(ChatRequest request) {
        StringBuilder sb = new StringBuilder();

        sb.append("You are a customer-facing chatbot for a boba tea shop.\n");
        sb.append("Your job is to help customers choose drinks, toppings, sweetness, and ice.\n");
        sb.append("Only recommend drinks and options that exist in the provided menu and modification lists.\n");
        sb.append("Do not invent menu items.\n");
        sb.append("Keep answers friendly, short, and useful.\n");
        sb.append("If the user asks for a recommendation, suggest 1-3 real options.\n");
        sb.append("If the user asks about sweetness, explain simply.\n");
        sb.append("If the user asks about toppings, recommend from the real toppings list.\n\n");
        sb.append("Do not use markdown or any special formatting.\n\n");

        sb.append("MENU ITEMS:\n");
        appendMenuItems(sb, request.getMenuItems());

        sb.append("\nMODIFICATION OPTIONS:\n");
        appendAlterations(sb, request.getAlterations());

        sb.append("\nCURRENTLY SELECTED ITEM:\n");
        if (request.getSelectedItem() != null) {
            sb.append("- ").append(request.getSelectedItem().getName())
              .append(" ($").append(request.getSelectedItem().getPrice()).append(")\n");
        } else {
            sb.append("None\n");
        }

        sb.append("\nCURRENTLY SELECTED MODS:\n");
        if (request.getSelectedMods() != null && !request.getSelectedMods().isEmpty()) {
            for (Modification mod : request.getSelectedMods()) {
                sb.append("- ").append(mod.getName()).append("\n");
            }
        } else {
            sb.append("None\n");
        }

        sb.append("\nCURRENT SWEETNESS:\n");
        sb.append(request.getSelectedSweetness() != null ? request.getSelectedSweetness() : "None").append("\n");

        sb.append("\nCART:\n");
        if (request.getCart() != null && !request.getCart().isEmpty()) {
            for (Drink drink : request.getCart()) {
                sb.append("- ").append(drink.getName()).append("\n");
            }
        } else {
            sb.append("Cart is empty\n");
        }

        sb.append("\nUSER MESSAGE:\n");
        sb.append(request.getMessage() != null ? request.getMessage() : "");

        return sb.toString();
    }

    private void appendMenuItems(StringBuilder sb, List<Drink> items) {
        if (items == null || items.isEmpty()) {
            sb.append("No menu items available.\n");
            return;
        }

        for (Drink item : items) {
            sb.append("- ")
              .append(item.getName())
              .append(" ($")
              .append(item.getPrice())
              .append(")");

            if (item.getCategory() != null && !item.getCategory().isBlank()) {
                sb.append(" - ").append(item.getCategory());
            }

            sb.append("\n");
        }
    }

    private void appendAlterations(StringBuilder sb, AlterationOptionsResponse alterations) {
        if (alterations == null) {
            sb.append("No alterations available.\n");
            return;
        }

        sb.append("Toppings:\n");
        appendMods(sb, alterations.getDefaults());

        sb.append("Sweetness:\n");
        appendMods(sb, alterations.getSweetness());

        sb.append("Ice:\n");
        appendMods(sb, alterations.getIce());
    }

    private void appendMods(StringBuilder sb, List<Modification> mods) {
        if (mods == null || mods.isEmpty()) {
            sb.append("- None\n");
            return;
        }

        for (Modification mod : mods) {
            sb.append("- ").append(mod.getName());
            if (mod.getPrice() != 0) {
                sb.append(" ($").append(mod.getPrice()).append(")");
            }
            sb.append("\n");
        }
    }

    private String fallbackReply(ChatRequest request) {
        String message = request.getMessage() == null ? "" : request.getMessage();
        String lower = message.toLowerCase(Locale.ROOT);
        List<Drink> availableDrinks = getAvailableDrinks(request.getMenuItems());

        if (availableDrinks.isEmpty()) {
            return "I can help with recommendations, but I don't see any available menu items right now.";
        }

        if (mentions(lower, "topping", "boba", "foam", "jelly", "pearl", "popping")) {
            List<String> toppings = getToppingNames(request.getAlterations());
            if (toppings.isEmpty()) {
                return "I don't see topping options loaded right now, but I can still help you choose a drink.";
            }

            return "For toppings, I recommend " + joinOptions(toppings, 3)
                    + ". Boba is usually best with milk tea, while lighter toppings work well with fruit teas or slushes.";
        }

        if (mentions(lower, "sweetness", "sugar", "sweet")) {
            String drinkName = request.getSelectedItem() != null ? request.getSelectedItem().getName() : availableDrinks.get(0).getName();
            return "For " + drinkName + ", I’d start with 50% or 75% sugar if you want balanced flavor. Choose 100% sugar if you like it very sweet.";
        }

        if (mentions(lower, "ice")) {
            return "For ice, regular ice is best for slushes and cold fruit teas. Less ice is better if you want the flavor to stay stronger as it melts.";
        }

        if (request.getSelectedItem() != null && mentions(lower, "goes well", "pair", "with my selected", "selected drink")) {
            String toppings = joinOptions(getToppingNames(request.getAlterations()), 2);
            if (toppings.isBlank()) {
                toppings = "boba";
            }
            return request.getSelectedItem().getName() + " would go well with " + toppings
                    + " and 50% or 75% sugar for a balanced drink.";
        }

        if (mentions(lower, "hot", "summer", "refresh", "refreshing", "cool", "cold", "light", "fruity", "fruit")) {
            List<Drink> refreshing = findDrinks(availableDrinks,
                    List.of("fruit", "green tea", "lemon", "mango", "strawberry", "peach", "lychee", "slush", "smoothie", "refresher"));

            if (refreshing.isEmpty()) {
                refreshing = availableDrinks;
            }

            return "For a hot summer day, I’d recommend " + joinDrinkOptions(refreshing, 3)
                    + ". I’d pair it with 50% sugar and regular ice so it stays refreshing.";
        }

        if (mentions(lower, "recommend", "best", "good", "popular", "favorite", "choose", "pick", "what should i get")) {
            List<Drink> recommendations = availableDrinks.stream()
                    .sorted(Comparator.comparingInt(this::recommendationScore).reversed())
                    .limit(3)
                    .collect(Collectors.toList());

            return "I’d recommend " + joinDrinkOptions(recommendations, 3)
                    + ". If you want something lighter, choose a fruit tea; if you want something creamier, choose a milk tea.";
        }

        return "I can help you choose from real menu items like " + joinDrinkOptions(availableDrinks, 3)
                + ". Tell me whether you want something fruity, creamy, sweet, or refreshing.";
    }

    private List<Drink> getAvailableDrinks(List<Drink> menuItems) {
        if (menuItems == null) {
            return new ArrayList<>();
        }

        return menuItems.stream()
                .filter(Objects::nonNull)
                .filter(Drink::isAvailable)
                .filter(drink -> drink.getName() != null && !drink.getName().isBlank())
                .collect(Collectors.toList());
    }

    private List<Drink> findDrinks(List<Drink> drinks, List<String> keywords) {
        return drinks.stream()
                .filter(drink -> {
                    String haystack = ((drink.getName() == null ? "" : drink.getName()) + " "
                            + (drink.getCategory() == null ? "" : drink.getCategory())).toLowerCase(Locale.ROOT);
                    return keywords.stream().anyMatch(haystack::contains);
                })
                .collect(Collectors.toList());
    }

    private int recommendationScore(Drink drink) {
        String haystack = ((drink.getName() == null ? "" : drink.getName()) + " "
                + (drink.getCategory() == null ? "" : drink.getCategory())).toLowerCase(Locale.ROOT);

        int score = 0;
        if (haystack.contains("fruit")) score += 5;
        if (haystack.contains("green tea")) score += 4;
        if (haystack.contains("mango")) score += 4;
        if (haystack.contains("slush")) score += 3;
        if (haystack.contains("milk tea")) score += 2;
        if (haystack.contains("classic")) score += 1;
        return score;
    }

    private List<String> getToppingNames(AlterationOptionsResponse alterations) {
        if (alterations == null || alterations.getDefaults() == null) {
            return new ArrayList<>();
        }

        return alterations.getDefaults().stream()
                .filter(Objects::nonNull)
                .map(Modification::getName)
                .filter(name -> name != null && !name.isBlank())
                .filter(name -> {
                    String lower = name.toLowerCase(Locale.ROOT);
                    return !lower.contains("ice") && !lower.contains("sugar") && !lower.contains("sweet");
                })
                .collect(Collectors.toList());
    }

    private String joinDrinkOptions(List<Drink> drinks, int limit) {
        return drinks.stream()
                .limit(limit)
                .map(Drink::getName)
                .collect(Collectors.joining(", "));
    }

    private String joinOptions(List<String> options, int limit) {
        return options.stream()
                .filter(option -> option != null && !option.isBlank())
                .limit(limit)
                .collect(Collectors.joining(", "));
    }

    private boolean mentions(String lowerMessage, String... keywords) {
        for (String keyword : keywords) {
            if (lowerMessage.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private String extractTextFromGeminiResponse(String responseBody) {
        String marker = "\"text\":";
        int markerIndex = responseBody.indexOf(marker);
        if (markerIndex < 0) {
            return null;
        }

        int firstQuote = responseBody.indexOf("\"", markerIndex + marker.length());
        if (firstQuote < 0) {
            return null;
        }

        StringBuilder text = new StringBuilder();
        boolean escaping = false;

        for (int i = firstQuote + 1; i < responseBody.length(); i++) {
            char c = responseBody.charAt(i);

            if (escaping) {
                switch (c) {
                    case 'n' -> text.append('\n');
                    case 'r' -> text.append('\r');
                    case 't' -> text.append('\t');
                    case '"' -> text.append('"');
                    case '\\' -> text.append('\\');
                    default -> text.append(c);
                }
                escaping = false;
                continue;
            }

            if (c == '\\') {
                escaping = true;
                continue;
            }

            if (c == '"') {
                break;
            }

            text.append(c);
        }

        return text.toString();
    }
}
