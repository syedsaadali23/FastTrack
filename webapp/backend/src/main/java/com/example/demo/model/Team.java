package com.example.demo.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    private String sport;
    private Boolean isOpenToRequests;

    @Lob
    private String logo;

    private String captainUsername;
    private Integer teamCap;
    private Boolean isRegistered = false;

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> members = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> pendingRequests = new HashSet<>();

    public Team() {}

    public Team(String name, String sport, Boolean isOpenToRequests, String logo, String captainUsername, Integer teamCap) {
        this.name = name;
        this.sport = sport;
        this.isOpenToRequests = isOpenToRequests;
        this.logo = logo;
        this.captainUsername = captainUsername;
        this.teamCap = teamCap;
        this.members.add(captainUsername);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSport() { return sport; }
    public Boolean getIsOpenToRequests() { return isOpenToRequests; }
    public String getLogo() { return logo; }
    public String getCaptainUsername() { return captainUsername; }
    public Integer getTeamCap() { return teamCap; }
    public Boolean getIsRegistered() { return isRegistered; }
    public Set<String> getMembers() { return members; }
    public Set<String> getPendingRequests() { return pendingRequests; }
    
    public void setIsRegistered(Boolean isRegistered) { this.isRegistered = isRegistered; }
    public void setTeamCap(Integer teamCap) { this.teamCap = teamCap; }
    
    public void setMembers(Set<String> members) { this.members = members; }
    public void setPendingRequests(Set<String> pendingRequests) { this.pendingRequests = pendingRequests; }
}
