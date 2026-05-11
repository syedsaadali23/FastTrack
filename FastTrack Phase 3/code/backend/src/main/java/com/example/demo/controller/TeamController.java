package com.example.demo.controller;

import com.example.demo.model.Event;
import com.example.demo.model.Team;
import com.example.demo.model.Notification;
import com.example.demo.model.User;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.service.CsvExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CsvExportService csvExportService;

    @PostMapping("/create")
    public ResponseEntity<?> createTeam(@RequestBody Map<String, Object> data) {
        String name = (String) data.get("name");
        String sport = (String) data.get("sport");
        Boolean isOpenToRequests = Boolean.TRUE.equals(data.get("isOpenToRequests"));
        String logo = (String) data.get("logo");
        String captainUsername = (String) data.get("captainUsername");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Team name is required"));
        }
        if (teamRepository.findByName(name).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Team name already taken"));
        }

        // Optional: Set team cap based on an event if one exists, else default to 11
        int teamCap = 11;
        for (Event e : eventRepository.findAll()) {
            if (e.getSport().equalsIgnoreCase(sport)) {
                teamCap = e.getTeamCap() != null ? e.getTeamCap() : 11;
                break;
            }
        }

        Team team = new Team(name, sport, isOpenToRequests, logo, captainUsername, teamCap);
        
        // Set captain's role if provided or default from user profile
        Optional<User> capOpt = userRepository.findByUsername(captainUsername);
        if (capOpt.isPresent()) {
            String role = capOpt.get().getPreferredPosition(sport);
            if ("N/A".equals(role)) {
                Map<String, Integer> reqs = getRequiredSlotsForSport(sport);
                if (!reqs.isEmpty()) {
                    role = reqs.keySet().iterator().next(); // Pick first valid role
                }
            }
            team.getMemberRoles().put(captainUsername, role);
        }

        teamRepository.save(team);
        csvExportService.exportAll();

        return ResponseEntity.ok(Map.of("message", "Team created successfully", "teamCap", teamCap));
    }

    @GetMapping("/{id}/composition")
    public ResponseEntity<?> getTeamComposition(@PathVariable Long id) {
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        
        Map<String, Integer> required = getRequiredSlotsForSport(t.getSport());
        Map<String, Integer> filled = new HashMap<>();
        for (String role : t.getMemberRoles().values()) {
            filled.put(role, filled.getOrDefault(role, 0) + 1);
        }
        
        Map<String, Integer> remaining = new HashMap<>();
        required.forEach((role, count) -> {
            remaining.put(role, Math.max(0, count - filled.getOrDefault(role, 0)));
        });
        
        return ResponseEntity.ok(Map.of(
            "required", required,
            "filled", filled,
            "remaining", remaining
        ));
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
            slots.put("Squad Member", 11); // Default
        }
        return slots;
    }

    @PostMapping("/{id}/request-join")
    public ResponseEntity<?> requestJoin(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (t.getMembers().contains(username) || t.getPendingRequests().contains(username)) {
             return ResponseEntity.badRequest().body(Map.of("message", "Request already pending or you are already in the team"));
        }
        t.getPendingRequests().add(username);
        teamRepository.save(t);
        
        Notification n = new Notification(username, "USER", t.getCaptainUsername(), "New Join Request", username + " has requested to join your team: " + t.getName() + " [TEAM_ID:" + t.getId() + "]", "BROADCASTED");
        notificationRepository.save(n);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Join request sent to captain."));
    }

    @PostMapping("/{id}/resolve-request")
    public ResponseEntity<?> resolveRequest(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String username = (String) data.get("username");
        String requester = (String) data.get("requester");
        Boolean approve = (Boolean) data.get("approve");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (!t.getCaptainUsername().equals(username)) return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized"));
        if (Boolean.TRUE.equals(t.getIsRegistered())) return ResponseEntity.badRequest().body(Map.of("message", "Cannot resolve requests. Team is mapped globally strictly."));
        
        if (t.getPendingRequests().contains(requester)) {
             t.getPendingRequests().remove(requester);
             if (Boolean.TRUE.equals(approve)) {
                 t.getMembers().add(requester);
                 
                 // Assign role to requester
                 Optional<User> reqOpt = userRepository.findByUsername(requester);
                 if (reqOpt.isPresent()) {
                     User requesterUser = reqOpt.get();
                     
                     String role = requesterUser.getLookingForTeamPosition();
                     // Fallback if not coming from pool or sport mismatch
                     if (role == null || !t.getSport().equalsIgnoreCase(requesterUser.getLookingForTeamSport())) {
                         role = requesterUser.getPreferredPosition(t.getSport());
                     }
                     
                     t.getMemberRoles().put(requester, role);
                     
                     // Automatically remove from looking-for-team pool
                     requesterUser.setLookingForTeamSport(null);
                     requesterUser.setLookingForTeamPosition(null);
                     requesterUser.setLookingForTeamSince(null);
                     userRepository.save(requesterUser);
                 }

                 if (t.getMembers().size() >= t.getTeamCap()) {
                     t.setIsOpenToRequests(false);
                 }
                 teamRepository.save(t);
                 Notification n = new Notification(t.getCaptainUsername(), "USER", requester, "Request Approved", "Your join request for " + t.getName() + " was APPROVED!", "BROADCASTED");
                 notificationRepository.save(n);
             } else {
                 teamRepository.save(t);
                 Notification n = new Notification(t.getCaptainUsername(), "USER", requester, "Request Rejected", "Your join request for " + t.getName() + " was REJECTED.", "BROADCASTED");
                 notificationRepository.save(n);
             }
             csvExportService.exportAll();
             return ResponseEntity.ok(Map.of("message", "Request resolved limit"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Requester not found"));
    }

    @PostMapping("/{id}/toggle-requests")
    public ResponseEntity<?> toggleRequests(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (!t.getCaptainUsername().equals(username)) return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized"));
        
        Boolean nextState = t.getIsOpenToRequests() == null ? true : !t.getIsOpenToRequests();
        if (nextState && t.getMembers().size() >= t.getTeamCap()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Team cap reached. Cannot open to requests."));
        }
        
        t.setIsOpenToRequests(nextState);
        teamRepository.save(t);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Request acceptance toggled", "isOpenToRequests", t.getIsOpenToRequests()));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTeams(@RequestParam String username) {
        List<Team> myTeams = new ArrayList<>();
        for (Team t : teamRepository.findAll()) {
            if (t.getMembers().contains(username)) {
                myTeams.add(t);
            }
        }
        return ResponseEntity.ok(myTeams);
    }

    @PostMapping("/{id}/remove-member")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String admin = data.get("admin");
        String target = data.get("target");
        String reason = data.get("reason");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (!t.getCaptainUsername().equals(admin)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized"));
        }
        if (Boolean.TRUE.equals(t.getIsRegistered())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot drop entities. Team is completely locked after mapped to Event scope."));
        }
        if (target == null || !t.getMembers().contains(target)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Member not found in team"));
        }
        if (t.getCaptainUsername().equals(target)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot kick captain"));
        }
        
        t.getMembers().remove(target);
        teamRepository.save(t);
        
        Notification n = new Notification(target, "USER", target, "Kicked from Team", admin + " kicked you from the team (" + t.getName() + ") due to: " + reason, "BROADCASTED");
        notificationRepository.save(n);
        
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Member removed"));
    }
    
    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveTeam(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (Boolean.TRUE.equals(t.getIsRegistered())) return ResponseEntity.badRequest().body(Map.of("message", "Cannot drop entities. Team is officially mapped."));
        if (t.getCaptainUsername().equals(username)) return ResponseEntity.badRequest().body(Map.of("message", "Appointed Captain cannot technically leave dynamically. Drop team instead safely."));
        if (!t.getMembers().contains(username)) return ResponseEntity.badRequest().body(Map.of("message", "Member mapped improperly locally."));
        
        t.getMembers().remove(username);
        teamRepository.save(t);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Successfully dropped locally from the squad roster."));
    }
    
    @PostMapping("/{id}/delete-team")
    public ResponseEntity<?> deleteTeam(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (Boolean.TRUE.equals(t.getIsRegistered())) return ResponseEntity.badRequest().body(Map.of("message", "Cannot aggressively map deletions. Team is actively globally tracked."));
        if (!t.getCaptainUsername().equals(username)) return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized actions natively."));
        if (t.getMembers().size() > 1) return ResponseEntity.badRequest().body(Map.of("message", "Map drops exclusively require roster array limits mapped back optimally down to solely the captain."));
        
        teamRepository.delete(t);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Roster completely dropped centrally."));
    }
    
    @PostMapping("/{id}/register-sport")
    public ResponseEntity<?> registerSport(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (!t.getCaptainUsername().equals(username)) return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized actions natively."));
        if (Boolean.TRUE.equals(t.getIsRegistered())) return ResponseEntity.badRequest().body(Map.of("message", "Action failed. Already mapped globally."));
        
        Event mappedEvent = null;
        for (Event e : eventRepository.findAll()) {
            if (e.getSport().equalsIgnoreCase(t.getSport())) { mappedEvent = e; break; }
        }
        if(mappedEvent == null) return ResponseEntity.badRequest().body(Map.of("message", "Event dropped globally mapping logic broken structurally."));
        int minRequired = mappedEvent.getMinRequired() != null ? mappedEvent.getMinRequired() : 1;
        if(t.getMembers().size() < minRequired) return ResponseEntity.badRequest().body(Map.of("message", "Map limits technically violated functionally strictly dynamically. Requires at least " + minRequired));

        for(String m : t.getMembers()) {
            if(!mappedEvent.getRegisteredPlayers().contains(m)) mappedEvent.getRegisteredPlayers().add(m);
        }
        eventRepository.save(mappedEvent);

        t.setIsRegistered(true);
        teamRepository.save(t);
        
        broadcastTeamSysUpdate(t, "Team Registered!", "The squad " + t.getName() + " has locked in logically for the sport dynamically cleanly.");
        csvExportService.exportAll();
        
        return ResponseEntity.ok(Map.of("message", "Team definitively registered cleanly onto corresponding mapped limits remotely. Fully locked constraints formally."));
    }
    
    @PostMapping("/{id}/unregister-sport")
    public ResponseEntity<?> unregisterSport(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (!t.getCaptainUsername().equals(username)) return ResponseEntity.badRequest().body(Map.of("message", "Unauthorized."));
        if (!Boolean.TRUE.equals(t.getIsRegistered())) return ResponseEntity.badRequest().body(Map.of("message", "Not actively registered."));
        
        Event mappedEvent = null;
        for (Event e : eventRepository.findAll()) {
            if (e.getSport().equalsIgnoreCase(t.getSport())) { mappedEvent = e; break; }
        }
        
        if(mappedEvent != null) {
             if("Ongoing".equalsIgnoreCase(mappedEvent.getEventStatus())) return ResponseEntity.badRequest().body(Map.of("message", "Cannot drop payload physically dynamically natively. Event started."));
             for(String m : t.getMembers()) {
                 mappedEvent.getRegisteredPlayers().remove(m);
             }
             eventRepository.save(mappedEvent);
        }
        
        t.setIsRegistered(false);
        teamRepository.save(t);
        
        broadcastTeamSysUpdate(t, "Team Unregistered!", "The squad " + t.getName() + " has officially dropped out from " + t.getSport());
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Team safely dropped mapped array entirely explicitly."));
    }

    private void broadcastTeamSysUpdate(Team team, String title, String msg) {
        Set<String> recipients = new HashSet<>();
        for (User u : userRepository.findAll()) {
            if ("ADMIN".equals(u.getRole()) || "ORGANIZER".equals(u.getRole())) {
                recipients.add(u.getUsername());
            }
        }
        recipients.addAll(team.getMembers());
        for (String r : recipients) {
            notificationRepository.save(new Notification("SYSTEM", "USER", r, title, msg, "BROADCASTED"));
        }
    }

    @PostMapping("/wipe-all-now")
    public ResponseEntity<?> wipeAll() {
        teamRepository.deleteAll();
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "All teams have been wiped."));
    }

    @PutMapping("/{id}/skill")
    public ResponseEntity<?> updateTeamSkillLevel(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String username = (String) data.get("username");
        Object skillObj = data.get("skillLevel");
        if (skillObj == null) return ResponseEntity.badRequest().body(Map.of("message", "Skill level is required"));
        Integer newSkill;
        try {
            newSkill = Integer.parseInt(skillObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Skill level must be an integer"));
        }
        if (newSkill < 1 || newSkill > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Skill level must be between 1 and 100"));
        }
        
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Team not found"));
        
        Team t = tOpt.get();
        if (!t.getCaptainUsername().equals(username)) return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        
        t.setSkillLevel(newSkill);
        teamRepository.save(t);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Team skill level updated successfully"));
    }

    @PostMapping("/{id}/invite/{playerUsername}")
    public ResponseEntity<?> invitePlayer(@PathVariable Long id, @PathVariable String playerUsername, @RequestBody Map<String, String> data) {
        String captain = data.get("username");
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        if (!t.getCaptainUsername().equals(captain)) return ResponseEntity.status(403).body(Map.of("message", "Only the captain can invite players"));
        
        Optional<User> playerOpt = userRepository.findByUsername(playerUsername);
        if (playerOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Player not found"));
        
        if (t.getMembers().contains(playerUsername)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Player is already a member of this team"));
        }
        
        if (t.getMembers().size() >= t.getTeamCap()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Team roster is already full"));
        }
        
        Notification n = new Notification(captain, "USER", playerUsername, "Team Invitation", 
            captain + " has invited you to join their team: " + t.getName() + " [INVITE_TEAM_ID:" + t.getId() + "]", 
            "BROADCASTED");
        notificationRepository.save(n);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Invitation sent to player."));
    }

    @PostMapping("/{id}/respond-invitation")
    public ResponseEntity<?> respondInvitation(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String username = (String) data.get("username"); // The player being invited
        Boolean accept = (Boolean) data.get("accept");
        
        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();
        
        if (Boolean.TRUE.equals(accept)) {
            if (t.getMembers().size() >= t.getTeamCap()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Team is already full"));
            }
            if (!t.getMembers().contains(username)) {
                t.getMembers().add(username);
                Optional<User> uOpt = userRepository.findByUsername(username);
                if (uOpt.isPresent()) {
                    User u = uOpt.get();
                    String role = u.getLookingForTeamPosition();
                    if (role == null || !t.getSport().equalsIgnoreCase(u.getLookingForTeamSport())) {
                        role = u.getPreferredPosition(t.getSport());
                    }
                    t.getMemberRoles().put(username, role);
                    
                    // Clear pool status as they found a team
                    u.setLookingForTeamSport(null);
                    u.setLookingForTeamPosition(null);
                    u.setLookingForTeamSince(null);
                    userRepository.save(u);
                }
                teamRepository.save(t);
                
                Notification n = new Notification(username, "USER", t.getCaptainUsername(), "Invitation Accepted", 
                    username + " has accepted your invitation to join " + t.getName(), "BROADCASTED");
                notificationRepository.save(n);
            }
        } else {
             Notification n = new Notification(username, "USER", t.getCaptainUsername(), "Invitation Rejected", 
                    username + " has rejected your invitation to join " + t.getName(), "BROADCASTED");
             notificationRepository.save(n);
        }
        
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", accept ? "Invitation accepted" : "Invitation rejected"));
    }

    @PostMapping("/{id}/update-role")
    public ResponseEntity<?> updateMemberRole(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String captain = data.get("username");
        String targetMember = data.get("targetMember");
        String newRole = data.get("newRole");

        Optional<Team> tOpt = teamRepository.findById(id);
        if (tOpt.isEmpty()) return ResponseEntity.notFound().build();
        Team t = tOpt.get();

        if (!t.getCaptainUsername().equals(captain)) {
            return ResponseEntity.status(403).body(Map.of("message", "Only the captain can change member roles"));
        }

        if (!t.getMembers().contains(targetMember)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Member not found in team"));
        }

        // Validate role for sport
        Map<String, Integer> validRoles = getRequiredSlotsForSport(t.getSport());
        if (!validRoles.containsKey(newRole) && !"Squad Member".equals(newRole)) {
             return ResponseEntity.badRequest().body(Map.of("message", "Invalid role for this sport"));
        }

        t.getMemberRoles().put(targetMember, newRole);
        teamRepository.save(t);
        csvExportService.exportAll();

        Notification n = new Notification(captain, "USER", targetMember, "Role Changed", 
            "Your role in team " + t.getName() + " has been changed to " + newRole, "BROADCASTED");
        notificationRepository.save(n);

        return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
    }
}

