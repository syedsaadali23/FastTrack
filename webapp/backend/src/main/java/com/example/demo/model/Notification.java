package com.example.demo.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderUsername;
    private String targetRole; // "ALL", "ADMIN", "USER"
    private String targetUsername; // Used if "USER", null otherwise
    private String title;
    
    @Lob
    private String body;
    
    private String status; // "PENDING", "BROADCASTED"
    
    // Tracks users who have read this notification
    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> readBy = new HashSet<>();

    public Notification() {}

    public Notification(String senderUsername, String targetRole, String targetUsername, String title, String body, String status) {
        this.senderUsername = senderUsername;
        this.targetRole = targetRole;
        this.targetUsername = targetUsername;
        this.title = title;
        this.body = body;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getSenderUsername() { return senderUsername; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public String getTargetUsername() { return targetUsername; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Set<String> getReadBy() { return readBy; }
}
