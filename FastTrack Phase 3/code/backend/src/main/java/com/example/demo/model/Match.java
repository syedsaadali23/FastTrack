package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventId;
    private String sport;
    private String team1Name;
    private String team2Name;
    private String venue;
    private Integer roundNumber;
    private Integer team1Score;
    private Integer team2Score;
    private String status = "Scheduled"; // Scheduled, Finished
    private String winner;
    
    private String startTime;
    private String endTime;
    
    private Long nextMatchId;
    
    private Boolean isCasual = false;

    public Match() {}

    public Match(Long eventId, String sport, String team1Name, String team2Name, String venue, Integer roundNumber) {
        this.eventId = eventId;
        this.sport = sport;
        this.team1Name = team1Name;
        this.team2Name = team2Name;
        this.venue = venue;
        this.roundNumber = roundNumber;
    }

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public String getSport() { return sport; }
    public String getTeam1Name() { return team1Name; }
    public String getTeam2Name() { return team2Name; }
    public String getVenue() { return venue; }
    public Integer getRoundNumber() { return roundNumber; }
    public Integer getTeam1Score() { return team1Score; }
    public Integer getTeam2Score() { return team2Score; }
    public String getStatus() { return status; }
    public String getWinner() { return winner; }

    public void setTeam1Name(String team1Name) { this.team1Name = team1Name; }
    public void setTeam2Name(String team2Name) { this.team2Name = team2Name; }
    public void setTeam1Score(Integer team1Score) { this.team1Score = team1Score; }
    public void setTeam2Score(Integer team2Score) { this.team2Score = team2Score; }
    public void setStatus(String status) { this.status = status; }
    public void setWinner(String winner) { this.winner = winner; }
    
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public Long getNextMatchId() { return nextMatchId; }
    public void setNextMatchId(Long nextMatchId) { this.nextMatchId = nextMatchId; }
    
    public Boolean getIsCasual() { return isCasual; }
    public void setIsCasual(Boolean isCasual) { this.isCasual = isCasual; }
}
