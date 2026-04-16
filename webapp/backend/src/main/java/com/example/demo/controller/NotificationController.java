package com.example.demo.controller;

import com.example.demo.model.Notification;
import com.example.demo.model.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CsvExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CsvExportService csvExportService;

    @GetMapping("/{username}")
    public ResponseEntity<?> getNotifications(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        User user = userOpt.get();

        List<Notification> allVisible = new ArrayList<>();
        
        // 1. ALL Broadcasts
        allVisible.addAll(notificationRepository.findByTargetRoleAndStatus("ALL", "BROADCASTED"));
        
        // 2. Personal Broadcasts (like rejections)
        allVisible.addAll(notificationRepository.findByTargetUsernameAndStatus(username, "BROADCASTED"));
        
        // 3. Pending requests for Admins
        if ("ADMIN".equals(user.getRole())) {
            allVisible.addAll(notificationRepository.findByTargetRoleAndStatus("ADMIN", "PENDING"));
        }

        // Sort by ID descending (newest first)
        allVisible.sort((a, b) -> Long.compare(b.getId(), a.getId()));

        List<Map<String, Object>> responseList = new ArrayList<>();
        int unreadCount = 0;

        for (Notification n : allVisible) {
            boolean isRead = n.getReadBy().contains(username);
            if (!isRead) unreadCount++;
            
            responseList.add(Map.of(
                "id", n.getId(),
                "sender", n.getSenderUsername(),
                "title", n.getTitle(),
                "body", n.getBody(),
                "isRead", isRead,
                "isPending", "PENDING".equals(n.getStatus())
            ));
        }

        return ResponseEntity.ok(Map.of("unreadCount", unreadCount, "notifications", responseList));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, String> data) {
        String username = data.get("senderUsername");
        String title = data.get("title");
        String body = data.get("body");

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();
        User user = userOpt.get();

        if ("PLAYER".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Players cannot send notifications"));
        }

        if ("ADMIN".equals(user.getRole())) {
            Notification n = new Notification(username, "ALL", null, title, body, "BROADCASTED");
            notificationRepository.save(n);
        } else if ("ORGANIZER".equals(user.getRole())) {
            Notification n = new Notification(username, "ADMIN", null, title, body, "PENDING");
            notificationRepository.save(n);
        }

        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Notification processed successfully"));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveNotification(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String admin = data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(admin);
        if (adminOpt.isEmpty() || !"ADMIN".equals(adminOpt.get().getRole())) return ResponseEntity.status(403).build();

        Optional<Notification> nOpt = notificationRepository.findById(id);
        if (nOpt.isEmpty()) return ResponseEntity.notFound().build();
        Notification n = nOpt.get();

        if ("PENDING".equals(n.getStatus())) {
            n.setStatus("BROADCASTED");
            n.setTargetRole("ALL");
            notificationRepository.save(n);
        }
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Approved"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectNotification(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String admin = data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(admin);
        if (adminOpt.isEmpty() || !"ADMIN".equals(adminOpt.get().getRole())) return ResponseEntity.status(403).build();

        Optional<Notification> nOpt = notificationRepository.findById(id);
        if (nOpt.isEmpty()) return ResponseEntity.notFound().build();
        Notification n = nOpt.get();

        if ("PENDING".equals(n.getStatus())) {
            // System message to the original sender
            Notification rejection = new Notification(
                "System Admin",
                "USER",
                n.getSenderUsername(),
                "Request to send message was rejected",
                "Your notification titled '" + n.getTitle() + "' was rejected by the admin.",
                "BROADCASTED"
            );
            notificationRepository.save(rejection);
            notificationRepository.delete(n);
        }
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Rejected"));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Notification> nOpt = notificationRepository.findById(id);
        if (nOpt.isPresent()) {
            Notification n = nOpt.get();
            n.getReadBy().add(username);
            notificationRepository.save(n);
            csvExportService.exportAll();
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();
        User user = userOpt.get();

        List<Notification> allVisible = new ArrayList<>();
        allVisible.addAll(notificationRepository.findByTargetRoleAndStatus("ALL", "BROADCASTED"));
        allVisible.addAll(notificationRepository.findByTargetUsernameAndStatus(username, "BROADCASTED"));
        if ("ADMIN".equals(user.getRole())) {
            allVisible.addAll(notificationRepository.findByTargetRoleAndStatus("ADMIN", "PENDING"));
        }

        for (Notification n : allVisible) {
            n.getReadBy().add(username);
        }
        notificationRepository.saveAll(allVisible);
        csvExportService.exportAll();
        return ResponseEntity.ok().build();
    }
}
