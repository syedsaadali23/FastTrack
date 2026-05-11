package com.example.demo.model;

import jakarta.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "Users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String role; // ADMIN, PLAYER, ORGANIZER

    // Additional fields for Player
    @Column(unique = true)
    private String rollNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @MapKeyColumn(name = "sport")
    @Column(name = "skill_level")
    private Map<String, Integer> skills = new HashMap<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_positions", joinColumns = @JoinColumn(name = "user_id"))
    @MapKeyColumn(name = "sport")
    @Column(name = "position")
    private Map<String, String> preferredPositions = new HashMap<>();

    private Boolean isLookingForMatch = false;

    private String lookingForTeamSport;
    private String lookingForTeamPosition;
    private java.time.LocalDateTime lookingForTeamSince;

    public User() {}

    public User(String name, String username, String password, String role) {
        this.name = name;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    
    public Integer getSkillLevel(String sport) { return skills.getOrDefault(sport, 50); }
    public void setSkillLevel(String sport, Integer skillLevel) { this.skills.put(sport, skillLevel); }
    public Map<String, Integer> getSkills() { return skills; }

    public String getPreferredPosition(String sport) { return preferredPositions.getOrDefault(sport, "N/A"); }
    public void setPreferredPosition(String sport, String position) { this.preferredPositions.put(sport, position); }
    public Map<String, String> getPreferredPositions() { return preferredPositions; }

    public Boolean getIsLookingForMatch() { return isLookingForMatch != null ? isLookingForMatch : false; }
    public void setIsLookingForMatch(Boolean isLookingForMatch) { this.isLookingForMatch = isLookingForMatch; }

    public String getLookingForTeamSport() { return lookingForTeamSport; }
    public void setLookingForTeamSport(String lookingForTeamSport) { this.lookingForTeamSport = lookingForTeamSport; }
    public String getLookingForTeamPosition() { return lookingForTeamPosition; }
    public void setLookingForTeamPosition(String lookingForTeamPosition) { this.lookingForTeamPosition = lookingForTeamPosition; }
    public java.time.LocalDateTime getLookingForTeamSince() { return lookingForTeamSince; }
    public void setLookingForTeamSince(java.time.LocalDateTime lookingForTeamSince) { this.lookingForTeamSince = lookingForTeamSince; }

    @Lob
    private String profilePicture;

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}