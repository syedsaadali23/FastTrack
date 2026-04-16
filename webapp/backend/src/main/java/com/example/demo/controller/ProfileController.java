package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CsvExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CsvExportService csvExportService;

    // Get current profile data
    @GetMapping("/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "name", user.getName(),
                "role", user.getRole(),
                "profilePicture", user.getProfilePicture() == null ? "" : user.getProfilePicture()
            ));
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
}
