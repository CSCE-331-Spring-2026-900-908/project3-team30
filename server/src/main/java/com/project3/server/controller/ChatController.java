package com.project3.server.controller;

import com.project3.server.model.ChatRequest;
import com.project3.server.model.ChatResponse;
import com.project3.server.service.GeminiChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final GeminiChatService geminiChatService;

    public ChatController(GeminiChatService geminiChatService) {
        this.geminiChatService = geminiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            String reply = geminiChatService.getChatReply(request);
            return ResponseEntity.ok(new ChatResponse(reply));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ChatResponse("Backend error: " + e.getMessage()));
        }
    }
}