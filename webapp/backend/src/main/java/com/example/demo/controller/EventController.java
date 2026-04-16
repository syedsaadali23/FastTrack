package com.example.demo.controller;

import com.example.demo.model.Event;
import com.example.demo.model.Notification;
import com.example.demo.model.User;
import com.example.demo.model.Team;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.service.CsvExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private CsvExportService csvExportService;

    @GetMapping
    public ResponseEntity<?> getAllEvents(@RequestParam String username) {
        List<Event> events = eventRepository.findAll();
        events.sort((a,b) -> Long.compare(b.getId(), a.getId()));
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (Event e : events) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("eventName", e.getEventName());
            map.put("sport", e.getSport());
            map.put("fee", e.getFee());
            map.put("picture", e.getPicture() != null ? e.getPicture() : "");
            
            map.put("isTeamSport", e.getIsTeamSport() != null ? e.getIsTeamSport() : false);
            map.put("duration", e.getDuration());
            map.put("startDate", e.getStartDate());
            map.put("endDate", e.getEndDate());
            map.put("totalSlots", e.getTotalSlots());
            map.put("tournamentType", e.getTournamentType());
            map.put("teamCap", e.getTeamCap());
            map.put("minRequired", e.getMinRequired());
            map.put("isRegistrationOpen", e.getIsRegistrationOpen() != null ? e.getIsRegistrationOpen() : true);
            map.put("eventStatus", e.getEventStatus() != null ? e.getEventStatus() : "Upcoming");
            
            int registeredCount = e.getRegisteredPlayers() != null ? e.getRegisteredPlayers().size() : 0;
            map.put("availableSlots", e.getTotalSlots() != null ? Math.max(0, e.getTotalSlots() - registeredCount) : 0);
            
            map.put("isRegistered", e.getRegisteredPlayers() != null && e.getRegisteredPlayers().contains(username));
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> data) {
        String eventName = (String) data.get("eventName");
        String sport = (String) data.get("sport");
        
        Object feeObj = data.get("fee");
        Double fee = 0.0;
        if (feeObj != null && !feeObj.toString().trim().isEmpty()) {
            fee = Double.valueOf(feeObj.toString());
        }
        
        Boolean isTeamSport = data.containsKey("isTeamSport") && Boolean.TRUE.equals(data.get("isTeamSport"));
        String duration = (String) data.get("duration");
        String startDate = (String) data.get("startDate");
        String endDate = (String) data.get("endDate");
        
        Object totalSlotsObj = data.get("totalSlots");
        Integer totalSlots = 0;
        if (totalSlotsObj != null && !totalSlotsObj.toString().trim().isEmpty()) {
            totalSlots = Integer.valueOf(totalSlotsObj.toString());
        }
        
        String tournamentType = (String) data.get("tournamentType");
        
        Object teamCapObj = data.get("teamCap");
        Integer teamCap = null;
        if (teamCapObj != null && !teamCapObj.toString().trim().isEmpty()) {
            teamCap = Integer.valueOf(teamCapObj.toString());
        }

        Object minReqObj = data.get("minRequired");
        Integer minRequired = null;
        if (minReqObj != null && !minReqObj.toString().trim().isEmpty()) {
            minRequired = Integer.valueOf(minReqObj.toString());
        }

        String picture = (String) data.get("picture");
        String creator = (String) data.get("createdBy");
        
        if (eventName == null || eventName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Event Name is mandatory"));
        }
        if (sport == null || sport.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Sport is mandatory"));
        }

        Event e = new Event(eventName, sport, fee, isTeamSport, duration, startDate, endDate, totalSlots, tournamentType, teamCap, minRequired, picture, creator);
        eventRepository.save(e);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event created successfully"));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        if ("Ongoing".equalsIgnoreCase(ev.getEventStatus())) return ResponseEntity.badRequest().body(Map.of("message", "Event has already started."));
        if (ev.getIsRegistrationOpen() != null && !ev.getIsRegistrationOpen()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration is currently closed"));
        }
        if (Boolean.TRUE.equals(ev.getIsTeamSport())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Team events registration disabled individually"));
        }
        if (ev.getTotalSlots() != null && ev.getRegisteredPlayers().size() >= ev.getTotalSlots()) {
             return ResponseEntity.badRequest().body(Map.of("message", "Event is fully booked"));
        }
        if (ev.getRegisteredPlayers().contains(username)) {
             return ResponseEntity.badRequest().body(Map.of("message", "Already registered"));
        }
        ev.getRegisteredPlayers().add(username);
        eventRepository.save(ev);
        
        broadcastEventUpdate(ev, "New Registration", username + " successfully registered for individual event: " + ev.getEventName());
        
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Successfully registered!"));
    }

    @PostMapping("/{id}/cancel-registration")
    public ResponseEntity<?> cancelRegistration(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        if ("Ongoing".equalsIgnoreCase(ev.getEventStatus())) return ResponseEntity.badRequest().body(Map.of("message", "Cannot cancel logic. Event has already started."));
        
        if (!ev.getRegisteredPlayers().contains(username)) {
             return ResponseEntity.badRequest().body(Map.of("message", "Not registered."));
        }
        ev.getRegisteredPlayers().remove(username);
        eventRepository.save(ev);
        
        broadcastEventUpdate(ev, "Registration Cancelled", username + " dropped out cleanly from individual event: " + ev.getEventName());
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Successfully unregistered locally!"));
    }

    @PostMapping("/{id}/toggle-registration")
    public ResponseEntity<?> toggleRegistration(@PathVariable Long id) {
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        ev.setIsRegistrationOpen(ev.getIsRegistrationOpen() == null ? false : !ev.getIsRegistrationOpen());
        eventRepository.save(ev);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Registration status updated", "isOpen", ev.getIsRegistrationOpen()));
    }

    @PostMapping("/{id}/postpone")
    public ResponseEntity<?> postponeEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        
        if (data.containsKey("startDate")) ev.setStartDate(data.get("startDate"));
        if (data.containsKey("endDate")) ev.setEndDate(data.get("endDate"));
        if (data.containsKey("duration")) ev.setDuration(data.get("duration"));
        
        ev.setEventStatus("Postponed");
        eventRepository.save(ev);
        broadcastEventUpdate(ev, "Event Postponed", "The event " + ev.getEventName() + " has been physically postponed.");
        
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event successfully postponed"));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        ev.setEventStatus("Ongoing");
        eventRepository.save(ev);
        broadcastEventUpdate(ev, "Event Started", "The event " + ev.getEventName() + " has now officially started!");
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event officially initialized successfully!"));
    }
    
    @PostMapping("/{id}/pause")
    public ResponseEntity<?> pauseEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        ev.setEventStatus("Paused");
        eventRepository.save(ev);
        broadcastEventUpdate(ev, "Event Paused", "The event " + ev.getEventName() + " has been actively paused.");
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event actively paused cleanly."));
    }

    private void broadcastEventUpdate(Event event, String title, String msg) {
        Set<String> recipients = new HashSet<>();
        for (User u : userRepository.findAll()) {
            if ("ADMIN".equals(u.getRole()) || "ORGANIZER".equals(u.getRole())) {
                recipients.add(u.getUsername());
            }
        }
        if (event.getRegisteredPlayers() != null) {
            recipients.addAll(event.getRegisteredPlayers());
        }
        for (String r : recipients) {
            notificationRepository.save(new Notification("SYSTEM", "USER", r, title, msg, "BROADCASTED"));
        }
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        String givenPw = data.get("password");
        Optional<com.example.demo.model.User> uOpt = userRepository.findByUsername(username);
        if(uOpt.isEmpty() || !uOpt.get().getPassword().equals(givenPw)) {
             return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials... Auth Denied."));
        }
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        eventRepository.deleteById(id);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event violently torn down"));
    }

    @PostMapping("/wipe-all-now")
    public ResponseEntity<?> wipeAll() {
        eventRepository.deleteAll();
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "All events wiped"));
    }
}
