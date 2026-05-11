package com.example.demo.controller;

import com.example.demo.model.Event;
import com.example.demo.model.RegistrationRequest;
import com.example.demo.model.Team;
import com.example.demo.model.User;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.RegistrationRequestRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CsvExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*")
public class RegistrationController {

    @Autowired
    private RegistrationRequestRepository reqRepo;

    @Autowired
    private EventRepository eventRepo;

    @Autowired
    private TeamRepository teamRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private CsvExportService csvExportService;

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests(@RequestParam String adminUsername) {
        Optional<User> adminOpt = userRepo.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        List<RegistrationRequest> list = reqRepo.findByStatus("PENDING");
        list.sort((a, b) -> Long.compare(b.getId(), a.getId()));
        
        List<Map<String, Object>> res = new ArrayList<>();
        for (RegistrationRequest r : list) {
            Optional<Event> evOpt = eventRepo.findById(r.getEventId());
            if (evOpt.isEmpty()) continue;
            Event ev = evOpt.get();
            
            String teamName = null;
            if (r.getTeamId() != null) {
                Optional<Team> tOpt = teamRepo.findById(r.getTeamId());
                if (tOpt.isPresent()) teamName = tOpt.get().getName();
            }

            String joinType;
            if (Boolean.TRUE.equals(r.getIsSinglePlayerJoin())) joinType = "Player → Team";
            else if (Boolean.TRUE.equals(r.getIsRandomJoin())) joinType = "Random Team";
            else if (r.getTeamId() != null) joinType = "Team Registration";
            else joinType = "Individual";

            res.add(Map.of(
                "id", r.getId(),
                "eventName", ev.getEventName(),
                "fee", ev.getFee() != null ? ev.getFee() : 0,
                "isTeam", r.getTeamId() != null,
                "teamName", teamName != null ? teamName : "",
                "username", r.getUsername(),
                "paymentProof", r.getPaymentProof() != null ? r.getPaymentProof() : "",
                "autoFill", r.getAutoFill() != null ? r.getAutoFill() : false,
                "joinType", joinType
            ));
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String admin = data.get("adminUsername");
        Optional<User> adminOpt = userRepo.findByUsername(admin);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) return ResponseEntity.status(403).build();

        Optional<RegistrationRequest> rOpt = reqRepo.findById(id);
        if (rOpt.isEmpty()) return ResponseEntity.notFound().build();
        RegistrationRequest req = rOpt.get();

        if (!"PENDING".equals(req.getStatus())) return ResponseEntity.badRequest().body(Map.of("message", "Not pending"));

        Optional<Event> evOpt = eventRepo.findById(req.getEventId());
        if (evOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Event not found"));
        Event ev = evOpt.get();

        if (req.getIsSinglePlayerJoin() && req.getTeamId() != null) {
            // Player joining a specific existing team — just add them
            Optional<Team> tOpt = teamRepo.findById(req.getTeamId());
            if (tOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Team not found"));
            Team t = tOpt.get();
            if (!t.getMembers().contains(req.getUsername())) {
                t.getMembers().add(req.getUsername());
                Optional<User> playerOpt = userRepo.findByUsername(req.getUsername());
                if (playerOpt.isPresent()) {
                    User pUser = playerOpt.get();
                    String role = pUser.getLookingForTeamPosition();
                    if (role == null || !ev.getSport().equalsIgnoreCase(pUser.getLookingForTeamSport())) {
                        role = pUser.getPreferredPosition(ev.getSport());
                    }
                    t.getMemberRoles().put(req.getUsername(), role);
                }
                if (t.getMembers().size() >= (t.getTeamCap() != null ? t.getTeamCap() : 11)) {
                    t.setIsOpenToRequests(false);
                }
                teamRepo.save(t);
                if (!ev.getRegisteredTeamIds().contains(t.getId())) ev.getRegisteredTeamIds().add(t.getId());
            }
        } else if (req.getIsRandomJoin()) {
            // Player joining random team — find/create one
            List<Team> allTeams = teamRepo.findAll();
            Team target = null;
            for (Team t : allTeams) {
                if (t.getSport().equalsIgnoreCase(ev.getSport()) &&
                    Boolean.TRUE.equals(t.getIsOpenToRequests()) &&
                    t.getName().startsWith("Team") &&
                    !t.getMembers().contains(req.getUsername()) &&
                    t.getMembers().size() < (t.getTeamCap() != null ? t.getTeamCap() : 11)) {
                    target = t;
                    break;
                }
            }
            if (target == null) {
                // Create a new random team, player becomes captain
                String newName = "Team" + (new java.util.Random().nextInt(9000) + 1000);
                int cap = ev.getTeamCap() != null ? ev.getTeamCap() : 11;
                target = new Team(newName, ev.getSport(), true, null, req.getUsername(), cap);
            }
            target.getMembers().add(req.getUsername());
            Optional<User> playerOpt = userRepo.findByUsername(req.getUsername());
            if (playerOpt.isPresent()) {
                User pUser = playerOpt.get();
                String role = pUser.getLookingForTeamPosition();
                if (role == null || !ev.getSport().equalsIgnoreCase(pUser.getLookingForTeamSport())) {
                    role = pUser.getPreferredPosition(ev.getSport());
                }
                target.getMemberRoles().put(req.getUsername(), role);
            }
            teamRepo.save(target);
            if (!ev.getRegisteredTeamIds().contains(target.getId())) ev.getRegisteredTeamIds().add(target.getId());

        } else if (req.getTeamId() != null) {
            // Captain registering their whole team for the event
            Optional<Team> tOpt = teamRepo.findById(req.getTeamId());
            if (tOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Team not found"));
            Team t = tOpt.get();
            
            int minRequired = ev.getMinRequired() != null ? ev.getMinRequired() : 1;
            int currentSize = t.getMembers().size();

            if (currentSize < minRequired) {
                if (Boolean.TRUE.equals(req.getAutoFill())) {
                    int needed = minRequired - currentSize;
                    List<User> pool = new ArrayList<>();
                    for (User u : userRepo.findAll()) {
                        if (ev.getSport().equalsIgnoreCase(u.getLookingForTeamSport()) && !t.getMembers().contains(u.getUsername())) {
                            pool.add(u);
                        }
                    }
                    Collections.shuffle(pool);
                    for (int i = 0; i < Math.min(needed, pool.size()); i++) {
                        User randomPlayer = pool.get(i);
                        t.getMembers().add(randomPlayer.getUsername());
                        
                        String role = randomPlayer.getLookingForTeamPosition();
                        if (role == null || !ev.getSport().equalsIgnoreCase(randomPlayer.getLookingForTeamSport())) {
                            role = randomPlayer.getPreferredPosition(ev.getSport());
                        }
                        t.getMemberRoles().put(randomPlayer.getUsername(), role);
                        
                        randomPlayer.setLookingForTeamSport(null);
                        randomPlayer.setLookingForTeamPosition(null);
                        randomPlayer.setLookingForTeamSince(null);
                        userRepo.save(randomPlayer);
                    }
                } else {
                    return ResponseEntity.badRequest().body(Map.of("message", "Team still lacks minimum members and auto-fill is disabled."));
                }
            }

            for (String m : t.getMembers()) {
                if (!ev.getRegisteredPlayers().contains(m)) ev.getRegisteredPlayers().add(m);
            }
            t.setIsRegistered(true);
            teamRepo.save(t);
            if (!ev.getRegisteredTeamIds().contains(t.getId())) ev.getRegisteredTeamIds().add(t.getId());

        } else {
            // Individual registration
            if (!ev.getRegisteredPlayers().contains(req.getUsername())) {
                ev.getRegisteredPlayers().add(req.getUsername());
            }
        }

        eventRepo.save(ev);
        req.setStatus("APPROVED");
        reqRepo.save(req);
        csvExportService.exportAll();

        return ResponseEntity.ok(Map.of("message", "Approved successfully"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String admin = data.get("adminUsername");
        Optional<User> adminOpt = userRepo.findByUsername(admin);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) return ResponseEntity.status(403).build();

        Optional<RegistrationRequest> rOpt = reqRepo.findById(id);
        if (rOpt.isEmpty()) return ResponseEntity.notFound().build();
        RegistrationRequest req = rOpt.get();

        req.setStatus("REJECTED");
        reqRepo.save(req);
        csvExportService.exportAll();

        return ResponseEntity.ok(Map.of("message", "Rejected successfully"));
    }
}
