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

        // Verify sport has an active event
        boolean hasEvent = false;
        long eventId = -1;
        int teamCap = 11;
        for (Event e : eventRepository.findAll()) {
            if (e.getSport().equalsIgnoreCase(sport)) {
                hasEvent = true;
                teamCap = e.getTeamCap() != null ? e.getTeamCap() : 11;
                eventId = e.getId();
                break;
            }
        }
        if (!hasEvent) {
            return ResponseEntity.badRequest().body(Map.of("message", "No active event for this sport found"));
        }

        Team team = new Team(name, sport, isOpenToRequests, logo, captainUsername, teamCap);
        teamRepository.save(team);
        csvExportService.exportAll();

        return ResponseEntity.ok(Map.of("message", "Team created successfully", "teamCap", teamCap));
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
}
