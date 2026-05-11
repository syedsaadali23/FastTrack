package com.example.demo.controller;

import com.example.demo.model.Match;
import com.example.demo.model.Event;
import com.example.demo.model.Team;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "*")
public class MatchController {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllMatches() {
        List<Match> matches = matchRepository.findAll();
        matches.sort((a,b) -> Long.compare(b.getId(), a.getId()));
        return ResponseEntity.ok(matches);
    }

    @PostMapping("/{id}/result")
    public ResponseEntity<?> recordResult(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String adminUsername = (String) data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        Optional<Match> mOpt = matchRepository.findById(id);
        if (mOpt.isEmpty()) return ResponseEntity.notFound().build();
        Match match = mOpt.get();

        Integer team1Score = (Integer) data.get("team1Score");
        Integer team2Score = (Integer) data.get("team2Score");

        if (team1Score == null || team2Score == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Both scores must be provided"));
        }

        match.setTeam1Score(team1Score);
        match.setTeam2Score(team2Score);
        match.setStatus("Finished");

        if (team1Score > team2Score) {
            match.setWinner(match.getTeam1Name());
        } else if (team2Score > team1Score) {
            match.setWinner(match.getTeam2Name());
        } else {
            match.setWinner("Draw");
        }

        matchRepository.save(match);
        
        if (match.getNextMatchId() != null && !"Draw".equals(match.getWinner())) {
            Optional<Match> nextOpt = matchRepository.findById(match.getNextMatchId());
            if (nextOpt.isPresent()) {
                Match nextMatch = nextOpt.get();
                String placeholder = "Winner of Match " + match.getId();
                if (placeholder.equals(nextMatch.getTeam1Name())) {
                    nextMatch.setTeam1Name(match.getWinner());
                } else if (placeholder.equals(nextMatch.getTeam2Name())) {
                    nextMatch.setTeam2Name(match.getWinner());
                }
                matchRepository.save(nextMatch);
            }
        }
        
        return ResponseEntity.ok(Map.of("message", "Result recorded successfully!", "match", match));
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<?> scheduleMatch(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String adminUsername = data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        String startTime = data.get("startTime");
        String endTime = data.get("endTime");
        if (startTime == null || endTime == null) return ResponseEntity.badRequest().body(Map.of("message", "Start and End time required"));
        
        Optional<Match> matchOpt = matchRepository.findById(id);
        if (matchOpt.isEmpty()) return ResponseEntity.badRequest().build();
        Match match = matchOpt.get();

        LocalDateTime newStart = LocalDateTime.parse(startTime);
        LocalDateTime newEnd = LocalDateTime.parse(endTime);
        
        if (!newStart.isBefore(newEnd)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Start time must be before End time"));
        }

        Set<String> playersInThisMatch = getPlayersInMatch(match);
        
        List<Match> allMatches = matchRepository.findAll();
        for (Match other : allMatches) {
            if (!other.getId().equals(match.getId()) && other.getStartTime() != null && other.getEndTime() != null) {
                LocalDateTime otherStart = LocalDateTime.parse(other.getStartTime());
                LocalDateTime otherEnd = LocalDateTime.parse(other.getEndTime());
                
                // Overlap check
                if (newStart.isBefore(otherEnd) && otherStart.isBefore(newEnd)) {
                    Set<String> playersInOther = getPlayersInMatch(other);
                    for (String p : playersInThisMatch) {
                        if (playersInOther.contains(p)) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Clash detected! Player " + p + " is already playing in match ID " + other.getId() + " during this time."));
                        }
                    }
                }
            }
        }
        
        match.setStartTime(startTime);
        match.setEndTime(endTime);
        matchRepository.save(match);
        return ResponseEntity.ok(Map.of("message", "Match scheduled successfully without clashes!"));
    }

    private Set<String> getPlayersInMatch(Match m) {
        Set<String> players = new HashSet<>();
        Event event = eventRepository.findById(m.getEventId()).orElse(null);
        if(event != null) {
           if (Boolean.TRUE.equals(event.getIsTeamSport())) {
               teamRepository.findByName(m.getTeam1Name()).ifPresent(t -> players.addAll(t.getMembers()));
               teamRepository.findByName(m.getTeam2Name()).ifPresent(t -> players.addAll(t.getMembers()));
           } else {
               players.add(m.getTeam1Name());
               players.add(m.getTeam2Name());
           }
        }
        return players;
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        List<Match> allMatches = matchRepository.findAll();

        // Separate matches per sport and detect if elimination (has nextMatchId flows)
        Map<String, List<Match>> bySport = new HashMap<>();
        for (Match m : allMatches) {
            bySport.computeIfAbsent(m.getSport(), k -> new ArrayList<>()).add(m);
        }

        List<Map<String, Object>> response = new ArrayList<>();

        for (Map.Entry<String, List<Match>> sportEntry : bySport.entrySet()) {
            String sport = sportEntry.getKey();
            List<Match> matches = sportEntry.getValue();

            // Detect elimination: any match has a nextMatchId set
            boolean isElimination = matches.stream().anyMatch(m -> m.getNextMatchId() != null);

            if (isElimination) {
                // --- Elimination bracket placement ---
                // Find max round (the Final)
                int maxRound = matches.stream().mapToInt(m -> m.getRoundNumber() != null ? m.getRoundNumber() : 0).max().orElse(0);
                if (maxRound == 0) continue;

                List<Map<String, Object>> placements = new ArrayList<>();

                // Champion: winner of the Final
                matches.stream()
                    .filter(m -> m.getRoundNumber() != null && m.getRoundNumber() == maxRound
                        && "Finished".equalsIgnoreCase(m.getStatus())
                        && m.getWinner() != null && !"BYE".equals(m.getWinner()) && !"Draw".equals(m.getWinner()))
                    .findFirst().ifPresent(finalMatch -> {
                        placements.add(new HashMap<>(Map.of(
                            "team", finalMatch.getWinner(),
                            "placement", "🏆 Champion",
                            "placementRank", 1
                        )));
                        // Runner-up: the loser of the Final
                        String loser = finalMatch.getWinner().equals(finalMatch.getTeam1Name())
                            ? finalMatch.getTeam2Name() : finalMatch.getTeam1Name();
                        if (loser != null && !loser.startsWith("Winner of")) {
                            placements.add(new HashMap<>(Map.of(
                                "team", loser,
                                "placement", "🥈 Runner-up",
                                "placementRank", 2
                            )));
                        }
                    });

                // Semi-finalists (round maxRound-1 losers), if bracket has at least 2 rounds
                if (maxRound >= 2) {
                    List<Match> semis = matches.stream()
                        .filter(m -> m.getRoundNumber() != null && m.getRoundNumber() == maxRound - 1
                            && "Finished".equalsIgnoreCase(m.getStatus())
                            && m.getWinner() != null && !"BYE".equals(m.getWinner()))
                        .collect(Collectors.toList());

                    Set<String> alreadyPlaced = new HashSet<>();
                    placements.forEach(p -> alreadyPlaced.add((String) p.get("team")));

                    for (Match semi : semis) {
                        String loser = semi.getWinner().equals(semi.getTeam1Name())
                            ? semi.getTeam2Name() : semi.getTeam1Name();
                        if (loser != null && !loser.startsWith("Winner of") && alreadyPlaced.add(loser)) {
                            placements.add(new HashMap<>(Map.of(
                                "team", loser,
                                "placement", maxRound >= 3 ? "🥉 Semi-Finalist" : "🥉 Third Place",
                                "placementRank", 3
                            )));
                        }
                    }
                }

                placements.sort(Comparator.comparingInt(p -> (Integer) p.get("placementRank")));

                if (!placements.isEmpty()) {
                    Map<String, Object> block = new HashMap<>();
                    block.put("sport", sport);
                    block.put("tournamentType", "Elimination");
                    block.put("leaderboard", placements);
                    response.add(block);
                }

            } else {
                // --- Round-Robin points leaderboard ---
                class Stats {
                    int points = 0;
                    int goalDiff = 0;
                    int goalsFor = 0;
                    int wins = 0;
                }

                Map<String, Stats> teamStats = new HashMap<>();

                for (Match m : matches) {
                    if (!"Finished".equalsIgnoreCase(m.getStatus()) || m.getWinner() == null || "BYE".equals(m.getWinner())) continue;
                    String t1 = m.getTeam1Name();
                    String t2 = m.getTeam2Name();
                    if (t1 == null || t2 == null) continue;
                    if (t1.startsWith("Winner of") || t2.startsWith("Winner of")) continue;

                    teamStats.putIfAbsent(t1, new Stats());
                    teamStats.putIfAbsent(t2, new Stats());

                    int s1 = m.getTeam1Score() != null ? m.getTeam1Score() : 0;
                    int s2 = m.getTeam2Score() != null ? m.getTeam2Score() : 0;

                    Stats st1 = teamStats.get(t1);
                    Stats st2 = teamStats.get(t2);

                    st1.goalsFor += s1; st2.goalsFor += s2;
                    st1.goalDiff += (s1 - s2); st2.goalDiff += (s2 - s1);

                    if (m.getWinner().equals(t1)) { st1.points += 3; st1.wins++; }
                    else if (m.getWinner().equals(t2)) { st2.points += 3; st2.wins++; }
                    else if ("Draw".equals(m.getWinner())) { st1.points += 1; st2.points += 1; }
                }

                if (teamStats.isEmpty()) continue;

                List<Map<String, Object>> leaderboard = new ArrayList<>();
                for (Map.Entry<String, Stats> e : teamStats.entrySet()) {
                    Stats st = e.getValue();
                    leaderboard.add(Map.of(
                        "team", e.getKey(), "wins", st.wins,
                        "points", st.points, "goalDiff", st.goalDiff, "goalsFor", st.goalsFor
                    ));
                }

                leaderboard.sort((a, b) -> {
                    int cmp = Integer.compare((Integer) b.get("points"), (Integer) a.get("points"));
                    if (cmp != 0) return cmp;
                    cmp = Integer.compare((Integer) b.get("goalDiff"), (Integer) a.get("goalDiff"));
                    if (cmp != 0) return cmp;
                    return Integer.compare((Integer) b.get("goalsFor"), (Integer) a.get("goalsFor"));
                });

                /* if (leaderboard.size() > 3) leaderboard = leaderboard.subList(0, 3); */

                Map<String, Object> block = new HashMap<>();
                block.put("sport", sport);
                block.put("tournamentType", "RoundRobin");
                block.put("leaderboard", leaderboard);
                response.add(block);
            }
        }

        return ResponseEntity.ok(response);
    }
}
