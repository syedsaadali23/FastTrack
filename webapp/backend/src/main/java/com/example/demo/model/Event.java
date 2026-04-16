package com.example.demo.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventName;
    private String sport;
    private Double fee;
    
    private Boolean isTeamSport;
    private String duration;
    private String startDate;
    private String endDate;
    private Integer totalSlots;
    private String tournamentType;
    private Boolean isRegistrationOpen;
    private String eventStatus = "Upcoming";
    
    private Integer teamCap;
    private Integer minRequired;
    
    @Lob
    private String picture;

    private String createdBy;

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> registeredPlayers = new HashSet<>();

    public Event() {}

    public Event(String eventName, String sport, Double fee, Boolean isTeamSport, String duration, String startDate, String endDate, Integer totalSlots, String tournamentType, Integer teamCap, Integer minRequired, String picture, String createdBy) {
        this.eventName = eventName;
        this.sport = sport;
        this.fee = fee;
        this.isTeamSport = isTeamSport;
        this.duration = duration;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalSlots = totalSlots;
        this.tournamentType = tournamentType;
        this.teamCap = teamCap;
        this.minRequired = minRequired;
        this.isRegistrationOpen = true; // default open
        this.picture = picture;
        this.createdBy = createdBy;
    }

    public Long getId() { return id; }
    public String getEventName() { return eventName; }
    public String getSport() { return sport; }
    public Double getFee() { return fee; }
    public Boolean getIsTeamSport() { return isTeamSport; }
    public String getDuration() { return duration; }
    public String getEventStatus() { return eventStatus; }
    
    public void setEventStatus(String eventStatus) { this.eventStatus = eventStatus; }
    public String getStartDate() { return startDate; }
    public String getEndDate() { return endDate; }
    public Integer getTotalSlots() { return totalSlots; }
    public String getTournamentType() { return tournamentType; }
    public Boolean getIsRegistrationOpen() { return isRegistrationOpen; }
    public Integer getTeamCap() { return teamCap; }
    public Integer getMinRequired() { return minRequired; }
    public String getPicture() { return picture; }
    public String getCreatedBy() { return createdBy; }
    public Set<String> getRegisteredPlayers() { return registeredPlayers; }
    
    public void setIsRegistrationOpen(Boolean isRegistrationOpen) { this.isRegistrationOpen = isRegistrationOpen; }
    public void setRegisteredPlayers(Set<String> registeredPlayers) { this.registeredPlayers = registeredPlayers; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
}
