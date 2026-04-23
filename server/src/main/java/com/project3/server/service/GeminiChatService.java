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
import java.util.List;

@Service
public class GeminiChatService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String getChatReply(ChatRequest request) throws IOException, InterruptedException {
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackReply(request.getMessage());
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
            return "Sorry, I can't help with that! Try asking about our menu or modifications.";
        }

        String text = extractTextFromGeminiResponse(response.body());
        if (text == null || text.isBlank()) {
            return "I’m not sure how to answer that. Try asking about sweetness, toppings, or drink recommendations.";
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
              .append(")\n");
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

    private String fallbackReply(String message) {
        if (message == null) {
            return "Ask me about drinks, toppings, sweetness, or ice levels.";
        }

        String lower = message.toLowerCase();

        if (lower.contains("sweet")) {
            return "If you want something sweet, try a milk tea with 100% sweetness or 75% sweetness, and consider adding boba.";
        }
        if (lower.contains("refresh") || lower.contains("light")) {
            return "For something refreshing, try a fruit tea with medium sweetness and your preferred ice level.";
        }
        if (lower.contains("topping")) {
            return "A classic topping choice is boba. If you want something different, try one of the fruitier topping options.";
        }
        if (lower.contains("selected drink") || lower.contains("goes well")) {
            return "Your selected drink would probably pair well with boba and either 75% or 100% sweetness, depending on how sweet you like it.";
        }

        return "I can help you choose a drink, topping, sweetness, or ice level. Tell me what flavors you like.";
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