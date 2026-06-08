package com.bsgated.dto.ai;

import java.util.List;

public class AIChatRequest {

    private List<Message> messages;
    private String role;

    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public static class Message {
        private String role;    // "user" | "assistant"
        private String content;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
