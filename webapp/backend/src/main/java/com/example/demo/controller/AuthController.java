package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.service.CsvExportService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final String ORGANIZER_CODE = "yeagerist";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CsvExportService csvExportService;

    // Seed the Admin user if it doesn't exist
    @PostConstruct
    public void seedAdmin() {
        if (userRepository.findByUsername("Admin").isEmpty()) {
            User admin = new User("System Admin", "Admin", "12345678", "ADMIN");
            userRepository.save(admin);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        String username = creds.get("username");
        String password = creds.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("role", user.getRole());
                response.put("name", user.getName());
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        String role = data.get("role");
        String username = data.get("username");
        String password = data.get("password");
        String name = data.get("name");

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }

        if (password == null || password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters long"));
        }

        User newUser = new User(name, username, password, role);

        if ("PLAYER".equals(role)) {
            String roll = data.get("rollNumber");
            
            if (roll == null || !roll.matches("^\\d{2}L\\d{4}$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid format. Example roll number is 24L1234"));
            }
            
            if (!roll.matches("^(22|23|24|25|26)L\\d{4}$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please select correct batch from 22 to 26"));
            }

            if (userRepository.findByRollNumber(roll).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Roll number already registered"));
            }
            newUser.setRollNumber(roll);
        } else if ("ORGANIZER".equals(role)) {
            String code = data.get("adminCode");
            if (!ORGANIZER_CODE.equals(code)) {
                return ResponseEntity.status(403).body(Map.of("message", "Invalid admin issued code"));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role specified"));
        }

        userRepository.save(newUser);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Account created successfully"));
    }
    
    @PostMapping("/wipe-all-now")
    public ResponseEntity<?> wipeAllExceptAdmins() {
        eventRepository.deleteAll();
        teamRepository.deleteAll();
        notificationRepository.deleteAll();
        for (User u : userRepository.findAll()) {
            if (!"ADMIN".equals(u.getRole())) {
                userRepository.delete(u);
            }
        }
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Wipe completed. Environment restored to baseline exclusively retaining Admins."));
    }
}
