package com.example.demo.controller;

import com.example.demo.model.Event;
import com.example.demo.model.Notification;
import com.example.demo.model.User;
import com.example.demo.model.Team;
import com.example.demo.model.Match;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.MatchRepository;
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
    private MatchRepository matchRepository;

    @Autowired
    private com.example.demo.repository.RegistrationRequestRepository registrationRequestRepository;

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
            
            int registeredCount = 0;
            if (Boolean.TRUE.equals(e.getIsTeamSport())) {
                registeredCount = e.getRegisteredTeamIds() != null ? e.getRegisteredTeamIds().size() : 0;
            } else {
                registeredCount = e.getRegisteredPlayers() != null ? e.getRegisteredPlayers().size() : 0;
            }
            map.put("availableSlots", e.getTotalSlots() != null ? Math.max(0, e.getTotalSlots() - registeredCount) : 0);
            map.put("registeredCount", registeredCount);
            map.put("registeredTeamIds", e.getRegisteredTeamIds());
            
            List<String> registeredNames = new ArrayList<>();
            if (Boolean.TRUE.equals(e.getIsTeamSport())) {
                for (Long tid : e.getRegisteredTeamIds()) {
                    Optional<Team> tOpt = teamRepository.findById(tid);
                    if (tOpt.isPresent()) registeredNames.add(tOpt.get().getName());
                }
            } else {
                if (e.getRegisteredPlayers() != null) registeredNames.addAll(e.getRegisteredPlayers());
            }
            map.put("registeredNames", registeredNames);
            
            // Check specific registration status for this user
            String registrationStatus = "NONE";
            boolean isRegistered = false;

            // 1. Check if already in the event's permanent records
            if (e.getRegisteredPlayers() != null && e.getRegisteredPlayers().contains(username)) {
                isRegistered = true;
                registrationStatus = "APPROVED";
            } else if (Boolean.TRUE.equals(e.getIsTeamSport())) {
                for (Long tid : e.getRegisteredTeamIds()) {
                    Optional<Team> tOpt = teamRepository.findById(tid);
                    if (tOpt.isPresent() && tOpt.get().getMembers().contains(username)) {
                        isRegistered = true;
                        registrationStatus = "APPROVED";
                        break;
                    }
                }
            }

            // 2. If not permanently registered, check for pending/other requests in RegistrationRequest table
            if (!isRegistered) {
                List<com.example.demo.model.RegistrationRequest> userReqs = registrationRequestRepository.findByUsername(username);
                // Priority: APPROVED > PENDING > REJECTED — iterate all and pick highest priority
                for (com.example.demo.model.RegistrationRequest rr : userReqs) {
                    if (rr.getEventId().equals(e.getId())) {
                        if ("APPROVED".equals(rr.getStatus())) {
                            // APPROVED via DB record — treat as registered even if not in registeredPlayers yet
                            registrationStatus = "APPROVED";
                            isRegistered = true;
                            break;
                        } else if ("PENDING".equals(rr.getStatus())) {
                            registrationStatus = "PENDING";
                            // Don't break — keep checking in case there's also an APPROVED record
                        } else if ("REJECTED".equals(rr.getStatus()) && !"PENDING".equals(registrationStatus)) {
                            // Only set REJECTED if we haven't found a PENDING one already
                            registrationStatus = "REJECTED";
                        }
                    }
                }
            }
            
            map.put("isRegistered", isRegistered);
            map.put("registrationStatus", registrationStatus);
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

    @PostMapping("/{id}/request-registration")
    public ResponseEntity<?> requestRegistration(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String username = (String) data.get("username");
        String paymentProof = (String) data.get("paymentProof");
        Boolean isTeam = Boolean.TRUE.equals(data.get("isTeam"));
        Boolean isSinglePlayerJoin = Boolean.TRUE.equals(data.get("isSinglePlayerJoin"));
        Boolean isRandomJoin = Boolean.TRUE.equals(data.get("isRandomJoin"));
        Number teamIdNum = (Number) data.get("teamId");
        Long teamId = teamIdNum != null ? teamIdNum.longValue() : null;
        Boolean autoFill = Boolean.TRUE.equals(data.get("autoFill"));

        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();

        if (ev.getFee() != null && ev.getFee() > 0 && (paymentProof == null || paymentProof.isEmpty())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payment proof is required."));
        }
        
        if ("Ongoing".equalsIgnoreCase(ev.getEventStatus())) return ResponseEntity.badRequest().body(Map.of("message", "Event has already started."));
        if (ev.getIsRegistrationOpen() != null && !ev.getIsRegistrationOpen()) return ResponseEntity.badRequest().body(Map.of("message", "Registration closed"));

        if (!isTeam && !isSinglePlayerJoin && !isRandomJoin && ev.getRegisteredPlayers().contains(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already registered"));
        }
        
        com.example.demo.model.RegistrationRequest req = new com.example.demo.model.RegistrationRequest(id, (isTeam || isSinglePlayerJoin) ? teamId : null, username, paymentProof, autoFill);
        req.setIsSinglePlayerJoin(isSinglePlayerJoin);
        req.setIsRandomJoin(isRandomJoin);
        registrationRequestRepository.save(req);
        csvExportService.exportAll();

        return ResponseEntity.ok(Map.of("message", "Registration request sent to admin for approval."));
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
    public ResponseEntity<?> toggleRegistration(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String adminUsername = data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }
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
        String adminUsername = data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }
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

    @PostMapping("/{id}/upcoming")
    public ResponseEntity<?> makeUpcoming(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String adminUsername = data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        ev.setEventStatus("Upcoming");
        eventRepository.save(ev);
        broadcastEventUpdate(ev, "Event Resumed", "The event " + ev.getEventName() + " has been marked as upcoming.");
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event is now upcoming"));
    }

    @PostMapping("/{id}/join-random")
    public ResponseEntity<?> joinRandomTeam(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String username = data.get("username");
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        if (!Boolean.TRUE.equals(ev.getIsTeamSport())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not a team sport event"));
        }
        
        List<Team> allTeams = teamRepository.findAll();
        Team targetTeam = null;
        for (Team t : allTeams) {
            if (t.getSport().equalsIgnoreCase(ev.getSport()) && 
                Boolean.TRUE.equals(t.getIsOpenToRequests()) && 
                t.getName().startsWith("Team") && 
                t.getMembers().size() < (t.getTeamCap() != null ? t.getTeamCap() : 11)) {
                
                if (!t.getMembers().contains(username)) {
                    targetTeam = t;
                    break;
                }
            }
        }
        
        if (targetTeam != null) {
            targetTeam.getMembers().add(username);
            Optional<User> uOpt = userRepository.findByUsername(username);
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                String role = u.getLookingForTeamPosition();
                if (role == null || !ev.getSport().equalsIgnoreCase(u.getLookingForTeamSport())) {
                    role = u.getPreferredPosition(ev.getSport());
                }
                targetTeam.getMemberRoles().put(username, role);
            }
            if (targetTeam.getMembers().size() >= (targetTeam.getTeamCap() != null ? targetTeam.getTeamCap() : 11)) {
                targetTeam.setIsOpenToRequests(false);
            }
            teamRepository.save(targetTeam);
            csvExportService.exportAll();
            return ResponseEntity.ok(Map.of("message", "You have been placed in " + targetTeam.getName()));
        } else {
            String newTeamName = "Team" + (new Random().nextInt(9000) + 1000);
            int teamCap = ev.getTeamCap() != null ? ev.getTeamCap() : 11;
            Team newTeam = new Team(newTeamName, ev.getSport(), true, null, username, teamCap);
            newTeam.getMembers().add(username);
            Optional<User> uOpt = userRepository.findByUsername(username);
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                String role = u.getLookingForTeamPosition();
                if (role == null || !ev.getSport().equalsIgnoreCase(u.getLookingForTeamSport())) {
                    role = u.getPreferredPosition(ev.getSport());
                }
                newTeam.getMemberRoles().put(username, role);
            }
            teamRepository.save(newTeam);
            csvExportService.exportAll();
            return ResponseEntity.ok(Map.of("message", "Created and placed in new team: " + newTeamName + ". You are the captain!"));
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String adminUsername = data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        ev.setEventStatus("Ongoing");
        
        List<String> participants = new ArrayList<>();
        if (Boolean.TRUE.equals(ev.getIsTeamSport())) {
            for (Team t : teamRepository.findAll()) {
                if (ev.getSport().equalsIgnoreCase(t.getSport()) && Boolean.TRUE.equals(t.getIsRegistered())) {
                    participants.add(t.getName());
                }
            }
        } else {
            if (ev.getRegisteredPlayers() != null) {
                participants.addAll(ev.getRegisteredPlayers());
            }
        }
        
        if (participants.size() < 2) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough participants to start matchmaking."));
        }

        // Shuffle for randomness
        Collections.shuffle(participants);
        String venue = data.getOrDefault("venue", "TBA");
        
        if ("Elimination".equalsIgnoreCase(ev.getTournamentType()) || "Knockout".equalsIgnoreCase(ev.getTournamentType())) {
            // Elimination Bracket Logic
            int n = participants.size();
            int powerOf2 = 1;
            while (powerOf2 < n) {
                powerOf2 *= 2;
            }
            int byes = powerOf2 - n;
            
            // Pad with BYEs
            List<String> bracket = new ArrayList<>(participants);
            for (int i = 0; i < byes; i++) {
                bracket.add("BYE");
            }
            
            // Create Round 1
            int matchesInRound = powerOf2 / 2;
            List<Match> currentRoundMatches = new ArrayList<>();
            int currentRound = 1;
            
            for (int i = 0; i < matchesInRound; i++) {
                String t1 = bracket.get(2 * i);
                String t2 = bracket.get(2 * i + 1);
                Match m = new Match(ev.getId(), ev.getSport(), t1, t2, venue, currentRound);
                if ("BYE".equals(t1) && "BYE".equals(t2)) {
                    m.setStatus("Finished"); m.setWinner("BYE");
                } else if ("BYE".equals(t1)) {
                    m.setStatus("Finished"); m.setWinner(t2);
                } else if ("BYE".equals(t2)) {
                    m.setStatus("Finished"); m.setWinner(t1);
                }
                matchRepository.save(m);
                currentRoundMatches.add(m);
            }
            
            // Create subsequent rounds
            List<Match> previousRoundMatches = currentRoundMatches;
            currentRound++;
            while (matchesInRound > 1) {
                matchesInRound /= 2;
                currentRoundMatches = new ArrayList<>();
                for (int i = 0; i < matchesInRound; i++) {
                    Match m1 = previousRoundMatches.get(2 * i);
                    Match m2 = previousRoundMatches.get(2 * i + 1);
                    
                    String nextT1 = "Winner of Match " + m1.getId();
                    String nextT2 = "Winner of Match " + m2.getId();
                    
                    if ("Finished".equals(m1.getStatus())) nextT1 = m1.getWinner();
                    if ("Finished".equals(m2.getStatus())) nextT2 = m2.getWinner();
                    
                    Match nextMatch = new Match(ev.getId(), ev.getSport(), nextT1, nextT2, venue, currentRound);
                    if ("BYE".equals(nextT1) && "BYE".equals(nextT2)) {
                        nextMatch.setStatus("Finished"); nextMatch.setWinner("BYE");
                    } else if ("BYE".equals(nextT1)) {
                        nextMatch.setStatus("Finished"); nextMatch.setWinner(nextT2);
                    } else if ("BYE".equals(nextT2)) {
                        nextMatch.setStatus("Finished"); nextMatch.setWinner(nextT1);
                    }
                    matchRepository.save(nextMatch);
                    currentRoundMatches.add(nextMatch);
                    
                    m1.setNextMatchId(nextMatch.getId());
                    m2.setNextMatchId(nextMatch.getId());
                    matchRepository.save(m1);
                    matchRepository.save(m2);
                }
                previousRoundMatches = currentRoundMatches;
                currentRound++;
            }
            
        } else {
            // Default Round-Robin Logic
            if (participants.size() % 2 != 0) {
                participants.add("BYE");
            }
            int numTeams = participants.size();
            int numRounds = numTeams - 1;
            int matchesPerRound = numTeams / 2;

            for (int round = 0; round < numRounds; round++) {
                for (int match = 0; match < matchesPerRound; match++) {
                    int home = (round + match) % (numTeams - 1);
                    int away = (numTeams - 1 - match + round) % (numTeams - 1);
                    if (match == 0) {
                        away = numTeams - 1;
                    }
                    String team1 = participants.get(home);
                    String team2 = participants.get(away);
                    
                    if (!"BYE".equals(team1) && !"BYE".equals(team2)) {
                        Match newMatch = new Match(ev.getId(), ev.getSport(), team1, team2, venue, round + 1);
                        matchRepository.save(newMatch);
                    }
                }
            }
        }

        eventRepository.save(ev);
        broadcastEventUpdate(ev, "Event Started", "The event " + ev.getEventName() + " has now officially started! Matches have been generated.");
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event officially initialized successfully! Matchmaking complete."));
    }
    
    @PostMapping("/{id}/pause")
    public ResponseEntity<?> pauseEvent(@PathVariable Long id, @RequestBody Map<String, String> data) {
        String adminUsername = data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();
        ev.setEventStatus("Paused");
        eventRepository.save(ev);
        broadcastEventUpdate(ev, "Event Paused", "The event " + ev.getEventName() + " has been actively paused.");
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event actively paused cleanly."));
    }

    @PostMapping("/{id}/update-details")
    public ResponseEntity<?> updateEventDetails(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        String adminUsername = (String) data.get("adminUsername");
        Optional<User> adminOpt = userRepository.findByUsername(adminUsername);
        if (adminOpt.isEmpty() || (!"ADMIN".equals(adminOpt.get().getRole()) && !"ORGANIZER".equals(adminOpt.get().getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event ev = evOpt.get();

        if (data.containsKey("eventName")) ev.setEventName((String) data.get("eventName"));
        if (data.containsKey("sport")) ev.setSport((String) data.get("sport"));
        
        if (data.containsKey("fee")) {
            Object feeObj = data.get("fee");
            ev.setFee(feeObj != null ? Double.valueOf(feeObj.toString()) : 0.0);
        }
        
        if (data.containsKey("isTeamSport")) ev.setIsTeamSport(Boolean.TRUE.equals(data.get("isTeamSport")));
        if (data.containsKey("duration")) ev.setDuration((String) data.get("duration"));
        if (data.containsKey("startDate")) ev.setStartDate((String) data.get("startDate"));
        if (data.containsKey("endDate")) ev.setEndDate((String) data.get("endDate"));
        
        if (data.containsKey("totalSlots")) {
            Object slotsObj = data.get("totalSlots");
            ev.setTotalSlots(slotsObj != null ? Integer.valueOf(slotsObj.toString()) : 0);
        }
        
        if (data.containsKey("tournamentType")) ev.setTournamentType((String) data.get("tournamentType"));
        
        if (data.containsKey("teamCap")) {
            Object capObj = data.get("teamCap");
            ev.setTeamCap(capObj != null && !capObj.toString().trim().isEmpty() ? Integer.valueOf(capObj.toString()) : null);
        }
        
        if (data.containsKey("minRequired")) {
            Object minReqObj = data.get("minRequired");
            ev.setMinRequired(minReqObj != null && !minReqObj.toString().trim().isEmpty() ? Integer.valueOf(minReqObj.toString()) : null);
        }
        
        if (data.containsKey("picture")) ev.setPicture((String) data.get("picture"));

        eventRepository.save(ev);
        broadcastEventUpdate(ev, "Event Updated", "The event " + ev.getEventName() + " has been updated by the admin.");
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event updated successfully"));
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
        User user = uOpt.get();
        if (!"ADMIN".equals(user.getRole()) && !"ORGANIZER".equals(user.getRole())) {
             return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }
        Optional<Event> evOpt = eventRepository.findById(id);
        if (evOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        List<Match> eventMatches = matchRepository.findByEventId(id);
        if (eventMatches != null && !eventMatches.isEmpty()) {
            matchRepository.deleteAll(eventMatches);
        }
        
        eventRepository.deleteById(id);
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "Event violently torn down"));
    }

    @PostMapping("/wipe-all-now")
    public ResponseEntity<?> wipeAll() {
        matchRepository.deleteAll();
        eventRepository.deleteAll();
        csvExportService.exportAll();
        return ResponseEntity.ok(Map.of("message", "All events wiped"));
    }
}
