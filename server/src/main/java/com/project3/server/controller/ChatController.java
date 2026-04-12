package com.project3.server.controller;

import com.project3.server.model.ChatRequest;
import com.project3.server.model.ChatResponse;
import com.project3.server.service.GeminiChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final GeminiChatService geminiChatService;

    public ChatController(GeminiChatService geminiChatService) {
        this.geminiChatService = geminiChatService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) throws Exception {
        String reply = geminiChatService.getChatReply(request);
        return new ChatResponse(reply);
    }
}