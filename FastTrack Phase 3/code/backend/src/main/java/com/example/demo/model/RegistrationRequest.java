package com.example.demo.model;

import jakarta.persistence.*;

@Entity
public class RegistrationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventId;
    private Long teamId; 
    private String username; 
    
    @Lob
    private String paymentProof;
    
    private Boolean autoFill; 
    private Boolean isRandomJoin;   // player joining random pool (no specific team)
    private Boolean isSinglePlayerJoin; // individual player joining a specific team
    
    private String status = "PENDING"; 

    public RegistrationRequest() {}

    public RegistrationRequest(Long eventId, Long teamId, String username, String paymentProof, Boolean autoFill) {
        this.eventId = eventId;
        this.teamId = teamId;
        this.username = username;
        this.paymentProof = paymentProof;
        this.autoFill = autoFill;
        this.isRandomJoin = false;
        this.isSinglePlayerJoin = false;
    }

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public Long getTeamId() { return teamId; }
    public String getUsername() { return username; }
    public String getPaymentProof() { return paymentProof; }
    public Boolean getAutoFill() { return autoFill; }
    public Boolean getIsRandomJoin() { return isRandomJoin != null && isRandomJoin; }
    public void setIsRandomJoin(Boolean v) { this.isRandomJoin = v; }
    public Boolean getIsSinglePlayerJoin() { return isSinglePlayerJoin != null && isSinglePlayerJoin; }
    public void setIsSinglePlayerJoin(Boolean v) { this.isSinglePlayerJoin = v; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
