package com.example.demo.controller;

import com.example.demo.model.Match;
import com.example.demo.model.Team;
import com.example.demo.model.User;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/matchmaking")
@CrossOrigin(origins = "*")
public class MatchmakingController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private MatchRepository matchRepository;

    @PostMapping("/find")
    public ResponseEntity<?> findMatch(@RequestBody Map<String, String> data) {
        String type = data.get("type"); // INDIVIDUAL or TEAM
        String id = data.get("id"); // username or team id
        String sport = data.get("sport");
        String eventIdStr = data.get("eventId");
        Long eventId = eventIdStr != null ? Long.parseLong(eventIdStr) : -1L;

        if (type == null || id == null || sport == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "type, id, and sport are required."));
        }

        if ("INDIVIDUAL".equalsIgnoreCase(type)) {
            Optional<User> uOpt = userRepository.findByUsername(id);
            if (uOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            User me = uOpt.get();
            me.setIsLookingForMatch(true);
            userRepository.save(me);

            // Find an opponent
            User opponent = null;
            int bestDiff = Integer.MAX_VALUE;
            
            for (User u : userRepository.findAll()) {
                if (!u.getUsername().equals(me.getUsername()) && Boolean.TRUE.equals(u.getIsLookingForMatch())) {
                    int diff = Math.abs(me.getSkillLevel(sport) - u.getSkillLevel(sport));
                    if (diff <= 15 && diff < bestDiff) {
                        bestDiff = diff;
                        opponent = u;
                    }
                }
            }

            if (opponent != null) {
                me.setIsLookingForMatch(false);
                opponent.setIsLookingForMatch(false);
                userRepository.save(me);
                userRepository.save(opponent);

                Match match = new Match(eventId, sport, me.getUsername(), opponent.getUsername(), "TBD", 1);
                match.setIsCasual(eventId == -1L);
                matchRepository.save(match);
                return ResponseEntity.ok(Map.of("message", "Match found!", "match", match));
            } else {
                return ResponseEntity.ok(Map.of("status", "searching", "message", "No opponent found yet. You are in the queue."));
            }
        } else if ("TEAM".equalsIgnoreCase(type)) {
            Long teamId = Long.parseLong(id);
            Optional<Team> tOpt = teamRepository.findById(teamId);
            if (tOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Team not found"));
            Team myTeam = tOpt.get();
            myTeam.setIsLookingForMatch(true);
            teamRepository.save(myTeam);

            Team opponent = null;
            int bestDiff = Integer.MAX_VALUE;

            for (Team t : teamRepository.findAll()) {
                if (!t.getId().equals(myTeam.getId()) && t.getSport().equalsIgnoreCase(sport) && Boolean.TRUE.equals(t.getIsLookingForMatch())) {
                    int diff = Math.abs((myTeam.getSkillLevel() != null ? myTeam.getSkillLevel() : 50) - 
                                        (t.getSkillLevel() != null ? t.getSkillLevel() : 50));
                    if (diff <= 15 && diff < bestDiff) {
                        bestDiff = diff;
                        opponent = t;
                    }
                }
            }

            if (opponent != null) {
                myTeam.setIsLookingForMatch(false);
                opponent.setIsLookingForMatch(false);
                teamRepository.save(myTeam);
                teamRepository.save(opponent);

                Match match = new Match(eventId, sport, myTeam.getName(), opponent.getName(), "TBD", 1);
                match.setIsCasual(eventId == -1L);
                matchRepository.save(match);
                return ResponseEntity.ok(Map.of("message", "Match found!", "match", match));
            } else {
                return ResponseEntity.ok(Map.of("status", "searching", "message", "No opponent found yet. You are in the queue."));
            }
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Invalid type"));
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelMatchmaking(@RequestBody Map<String, String> data) {
        String type = data.get("type"); // INDIVIDUAL or TEAM
        String id = data.get("id"); // username or team id

        if ("INDIVIDUAL".equalsIgnoreCase(type)) {
            Optional<User> uOpt = userRepository.findByUsername(id);
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                u.setIsLookingForMatch(false);
                userRepository.save(u);
            }
        } else if ("TEAM".equalsIgnoreCase(type)) {
            Optional<Team> tOpt = teamRepository.findById(Long.parseLong(id));
            if (tOpt.isPresent()) {
                Team t = tOpt.get();
                t.setIsLookingForMatch(false);
                teamRepository.save(t);
            }
        }
        return ResponseEntity.ok(Map.of("message", "Removed from matchmaking queue."));
    }

    @GetMapping("/player-pool")
    public ResponseEntity<?> getPlayerPool(@RequestParam(required = false) String sport, @RequestParam(required = false) String position) {
        List<Map<String, Object>> pool = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            if (u.getLookingForTeamSport() != null) {
                if ((sport == null || u.getLookingForTeamSport().equalsIgnoreCase(sport)) &&
                    (position == null || u.getLookingForTeamPosition().equalsIgnoreCase(position))) {
                    
                    Map<String, Object> playerInfo = new HashMap<>();
                    playerInfo.put("username", u.getUsername());
                    playerInfo.put("name", u.getName());
                    playerInfo.put("sport", u.getLookingForTeamSport());
                    playerInfo.put("position", u.getLookingForTeamPosition() != null ? u.getLookingForTeamPosition() : "Squad Member");
                    playerInfo.put("skillLevel", u.getSkillLevel(u.getLookingForTeamSport())); // defaults to 50 if not set
                    playerInfo.put("since", u.getLookingForTeamSince());
                    playerInfo.put("profilePicture", u.getProfilePicture());
                    pool.add(playerInfo);
                }
            }
        }
        return ResponseEntity.ok(pool);
    }

    @GetMapping("/available-teams")
    public ResponseEntity<?> getAvailableTeams(@RequestParam(required = false) String sport) {
        List<Map<String, Object>> available = new ArrayList<>();
        for (Team t : teamRepository.findAll()) {
            if (Boolean.TRUE.equals(t.getIsOpenToRequests())) {
                if (sport == null || t.getSport().equalsIgnoreCase(sport)) {
                    Map<String, Object> teamInfo = new HashMap<>();
                    teamInfo.put("id", t.getId());
                    teamInfo.put("name", t.getName());
                    teamInfo.put("sport", t.getSport());
                    teamInfo.put("logo", t.getLogo());
                    teamInfo.put("skillLevel", t.getSkillLevel());
                    teamInfo.put("captainUsername", t.getCaptainUsername());
                    
                    // Add open slots info
                    Map<String, Integer> required = getRequiredSlotsForSport(t.getSport());
                    Map<String, Integer> filled = new HashMap<>();
                    for (String role : t.getMemberRoles().values()) {
                        filled.put(role, filled.getOrDefault(role, 0) + 1);
                    }
                    Map<String, Integer> openSlots = new HashMap<>();
                    required.forEach((role, count) -> {
                        int rem = count - filled.getOrDefault(role, 0);
                        if (rem > 0) openSlots.put(role, rem);
                    });
                    
                    teamInfo.put("openSlots", openSlots);
                    teamInfo.put("memberRoles", t.getMemberRoles());
                    available.add(teamInfo);
                }
            }
        }
        return ResponseEntity.ok(available);
    }

    private Map<String, Integer> getRequiredSlotsForSport(String sport) {
        Map<String, Integer> slots = new HashMap<>();
        if ("Cricket".equalsIgnoreCase(sport)) {
            slots.put("Batsman", 5);
            slots.put("Bowler", 4);
            slots.put("All-rounder", 1);
            slots.put("Wicketkeeper", 1);
        } else if ("Football".equalsIgnoreCase(sport)) {
            slots.put("Goalkeeper", 1);
            slots.put("Defender", 4);
            slots.put("Midfielder", 4);
            slots.put("Forward", 2);
        } else {
            slots.put("Squad Member", 11);
        }
        return slots;
    }
}
