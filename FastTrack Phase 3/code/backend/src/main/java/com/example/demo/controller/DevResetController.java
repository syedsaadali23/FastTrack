package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.*;
import com.example.demo.service.CsvExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dev")
@CrossOrigin(origins = "*")
public class DevResetController {

    @Autowired private UserRepository userRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private RegistrationRequestRepository registrationRequestRepository;
    @Autowired private CsvExportService csvExportService;

    /**
     * POST /api/dev/reset
     * Body: { "adminUsername": "...", "password": "..." }
     *
     * Deletes ALL events, teams, matches, notifications, registration requests,
     * and all non-ADMIN users. Resets pool/skill fields on the preserved admin account.
     * Requires valid ADMIN credentials to execute.
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetData(@RequestBody Map<String, String> data) {
        String username = data.get("adminUsername");
        String password = data.get("password");

        Optional<User> adminOpt = userRepository.findByUsername(username);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(403).body(Map.of("message", "User not found"));
        }
        User admin = adminOpt.get();
        if (!admin.getPassword().equals(password)) {
            return ResponseEntity.status(403).body(Map.of("message", "Invalid password"));
        }
        if (!"ADMIN".equals(admin.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Only ADMIN can perform a reset"));
        }

        // 1. Wipe all matches
        matchRepository.deleteAll();

        // 2. Wipe all registration requests
        registrationRequestRepository.deleteAll();

        // 3. Wipe all events
        eventRepository.deleteAll();

        // 4. Wipe all teams
        teamRepository.deleteAll();

        // 5. Wipe all notifications
        notificationRepository.deleteAll();

        // 6. Delete all non-ADMIN users; reset admin's pool/skill state
        List<User> allUsers = userRepository.findAll();
        List<User> toDelete = allUsers.stream()
                .filter(u -> !"ADMIN".equals(u.getRole()))
                .collect(Collectors.toList());
        userRepository.deleteAll(toDelete);

        // 7. Reset admin's matchmaking / pool state (keep credentials and name intact)
        admin.setLookingForTeamSport(null);
        admin.setLookingForTeamPosition(null);
        admin.setLookingForTeamSince(null);
        admin.setIsLookingForMatch(false);
        admin.getSkills().clear();
        admin.getPreferredPositions().clear();
        userRepository.save(admin);

        csvExportService.exportAll();

        return ResponseEntity.ok(Map.of(
            "message", "Reset complete. All events, teams, matches, notifications, and non-admin users have been wiped.",
            "keptAdmin", admin.getUsername()
        ));
    }
}
