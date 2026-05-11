package com.example.demo.controller;

import com.example.demo.model.Event;
import com.example.demo.model.Team;
import com.example.demo.model.User;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TeamRepository teamRepository;

    @GetMapping
    public ResponseEntity<?> globalSearch(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) Boolean openRegistration,
            @RequestParam(required = false) Boolean openRequests) {
            
        String query = q != null ? q.toLowerCase().trim() : "";

        // Filter Profiles (Users)
        List<User> users = userRepository.findAll().stream().filter(u -> {
            if (openRegistration != null || openRequests != null || (sport != null && !sport.isEmpty())) return false; // filters don't apply to users
            boolean matches = query.isEmpty();
            if (!matches) {
                matches = (u.getUsername() != null && u.getUsername().toLowerCase().contains(query)) ||
                          (u.getName() != null && u.getName().toLowerCase().contains(query));
            }
            return matches;
        }).collect(Collectors.toList());

        // Filter Events
        List<Event> events = eventRepository.findAll().stream().filter(e -> {
            boolean matches = query.isEmpty() || 
                             (e.getEventName() != null && e.getEventName().toLowerCase().contains(query)) ||
                             (e.getSport() != null && e.getSport().toLowerCase().contains(query));
            
            if (sport != null && !sport.isEmpty() && (!sport.equalsIgnoreCase(e.getSport()))) matches = false;
            
            if (openRegistration != null) {
                 Boolean isOpen = e.getIsRegistrationOpen() != null ? e.getIsRegistrationOpen() : true;
                 if (!isOpen.equals(openRegistration)) matches = false;
            }
            
            // Events are independent of openRequests filter strictly? 
            if (openRequests != null && Boolean.TRUE.equals(openRequests)) {
                 matches = false; // "open join requests teams" implies only teams match this filter
            }
                             
            return matches;
        }).collect(Collectors.toList());

        // Filter Teams
        List<Team> teams = teamRepository.findAll().stream().filter(t -> {
            boolean matches = query.isEmpty() || 
                             (t.getName() != null && t.getName().toLowerCase().contains(query)) ||
                             (t.getSport() != null && t.getSport().toLowerCase().contains(query));
                             
            if (sport != null && !sport.isEmpty() && (!sport.equalsIgnoreCase(t.getSport()))) matches = false;
            
            if (openRequests != null) {
                 Boolean isOpen = t.getIsOpenToRequests() != null ? t.getIsOpenToRequests() : false;
                 if (!isOpen.equals(openRequests)) matches = false;
            }
            
            if (openRegistration != null && Boolean.TRUE.equals(openRegistration)) {
                 matches = false; // event specific
            }
            return matches;
        }).collect(Collectors.toList());

        Map<String, Object> results = new HashMap<>();
        results.put("profiles", users);
        results.put("events", events);
        results.put("teams", teams);

        return ResponseEntity.ok(results);
    }
}
