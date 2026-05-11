package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CsvExportService;
import com.example.demo.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;
import com.example.demo.model.Match;
import com.example.demo.model.Team;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.TeamRepository;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private CsvExportService csvExportService;

    @Autowired
    private EmailService emailService;

    // Get current profile data
    @GetMapping("/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("username", user.getUsername());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("skills", user.getSkills());
            response.put("preferredPositions", user.getPreferredPositions());
            response.put("lookingForTeamSport", user.getLookingForTeamSport());
            response.put("lookingForTeamPosition", user.getLookingForTeamPosition());
            response.put("email", user.getEmail());
            response.put("profilePicture", user.getProfilePicture() == null ? "" : user.getProfilePicture());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(404).body(Map.of("message", "User not found"));
    }

    // Update username
    @PutMapping("/{currentUsername}/username")
    public ResponseEntity<?> updateUsername(@PathVariable String currentUsername, @RequestBody Map<String, String> data) {
        String newUsername = data.get("newUsername");
        if (newUsername == null || newUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username cannot be empty"));
        }
        
        Optional<User> userOpt = userRepository.findByUsername(currentUsername);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        
        if (!currentUsername.equals(newUsername) && userRepository.findByUsername(newUsername).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
        }
        
        User user = userOpt.get();
        user.setUsername(newUsername);
        userRepository.save(user);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Username updated successfully", "username", newUsername));
    }

    // Update email
    @PutMapping("/{username}/email")
    public ResponseEntity<?> updateEmail(@PathVariable String username, @RequestBody Map<String, String> data) {
        String email = data.get("email");
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email address"));
        }
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        
        User user = userOpt.get();
        
        // Try sending welcome email
        boolean sent = emailService.sendEmail(email, "Welcome to FastTrack", "Hello " + user.getName() + ",\n\nWelcome to FastTrack! Your email has been successfully linked to your account.");
        
        if (!sent) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or unable to send welcome email"));
        }
        
        user.setEmail(email);
        userRepository.save(user);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Email updated successfully"));
    }

    // Update password
    @PutMapping("/{username}/password")
    public ResponseEntity<?> updatePassword(@PathVariable String username, @RequestBody Map<String, String> data) {
        String oldPassword = data.get("oldPassword");
        String newPassword = data.get("newPassword");
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        
        User user = userOpt.get();
        if (!user.getPassword().equals(oldPassword)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password"));
        }
        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 8 characters long"));
        }
        
        user.setPassword(newPassword);
        userRepository.save(user);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    // Upload/delete profile picture
    @PutMapping("/{username}/picture")
    public ResponseEntity<?> updateProfilePicture(@PathVariable String username, @RequestBody Map<String, String> data) {
        String base64Image = data.get("profilePicture"); // Can be null to delete
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        
        User user = userOpt.get();
        user.setProfilePicture(base64Image);
        userRepository.save(user);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Profile picture updated successfully"));
    }

    // Update skill level
    @PutMapping("/{username}/skill")
    public ResponseEntity<?> updateSkillLevel(@PathVariable String username, @RequestBody Map<String, Object> data) {
        String sport = (String) data.get("sport");
        Object skillObj = data.get("skillLevel");
        
        if (sport == null || sport.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Sport is required"));
        }
        if (skillObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Skill level is required"));
        }
        
        Integer newSkill;
        try {
            newSkill = Integer.parseInt(skillObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Skill level must be an integer"));
        }
        
        if (newSkill < 1 || newSkill > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Skill level must be between 1 and 100"));
        }
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        
        User user = userOpt.get();
        user.setSkillLevel(sport, newSkill);
        userRepository.save(user);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Skill level updated successfully"));
    }

    // Update position
    @PutMapping("/{username}/position")
    public ResponseEntity<?> updatePosition(@PathVariable String username, @RequestBody Map<String, String> data) {
        String sport = data.get("sport");
        String position = data.get("position");
        
        if (sport == null || position == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Sport and position are required"));
        }
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        
        User user = userOpt.get();
        user.setPreferredPosition(sport, position);
        userRepository.save(user);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Position updated successfully"));
    }

    // Toggle Looking for Team Pool
    @PostMapping("/{username}/toggle-pool")
    public ResponseEntity<?> togglePool(@PathVariable String username, @RequestBody Map<String, String> data) {
        String sport = data.get("sport");
        String position = data.get("position");
        Boolean active = Boolean.valueOf(data.get("active"));
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        
        User user = userOpt.get();
        if (Boolean.TRUE.equals(active)) {
            if (sport == null || position == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Sport and position are required to enter pool"));
            }
            user.setLookingForTeamSport(sport);
            user.setLookingForTeamPosition(position);
            user.setLookingForTeamSince(java.time.LocalDateTime.now());
        } else {
            user.setLookingForTeamSport(null);
            user.setLookingForTeamPosition(null);
            user.setLookingForTeamSince(null);
        }
        
        userRepository.save(user);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", active ? "Entered player pool" : "Left player pool"));
    }

    // Delete Account
    @PostMapping("/{username}/delete")
    public ResponseEntity<?> deleteAccount(@PathVariable String username, @RequestBody Map<String, String> data) {
        String password = data.get("password");
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        
        User user = userOpt.get();
        
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect password"));
        }
        
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Admins cannot delete their accounts"));
        }
        
        if ("ORGANIZER".equals(user.getRole())) {
            long count = userRepository.countByRole("ORGANIZER");
            if (count <= 1) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete account. You are the sole active Organizer."));
            }
        }
        
        userRepository.delete(user);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Account permanently deleted."));
    }
    // Get Analytics
    @GetMapping("/{username}/analytics")
    public ResponseEntity<?> getAnalytics(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "User not found"));

        List<String> userEntities = new ArrayList<>();
        userEntities.add(username);
        for (Team t : teamRepository.findAll()) {
            if (t.getMembers().contains(username)) {
                userEntities.add(t.getName());
            }
        }

        int totalMatches = 0;
        int wins = 0;
        int losses = 0;
        int casualMatches = 0;
        int tournamentMatches = 0;

        for (Match m : matchRepository.findAll()) {
            if (userEntities.contains(m.getTeam1Name()) || userEntities.contains(m.getTeam2Name())) {
                if ("Finished".equalsIgnoreCase(m.getStatus())) {
                    totalMatches++;
                    if (Boolean.TRUE.equals(m.getIsCasual())) {
                        casualMatches++;
                    } else {
                        tournamentMatches++;
                    }
                    if (userEntities.contains(m.getWinner())) {
                        wins++;
                    } else if (m.getWinner() != null && !m.getWinner().isEmpty() && !m.getWinner().equalsIgnoreCase("Draw")) {
                        losses++;
                    }
                }
            }
        }

        double winRate = totalMatches > 0 ? Math.round(((double) wins / totalMatches) * 100.0) : 0.0;

        return ResponseEntity.ok(Map.of(
            "totalMatches", totalMatches,
            "wins", wins,
            "losses", losses,
            "winRate", winRate,
            "casualMatches", casualMatches,
            "tournamentMatches", tournamentMatches
        ));
    }
}
