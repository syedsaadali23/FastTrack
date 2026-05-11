package com.example.demo.service;

import com.example.demo.model.Event;
import com.example.demo.model.Notification;
import com.example.demo.model.Team;
import com.example.demo.model.User;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.IOException;

@Service
public class CsvExportService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;

    private static final String CSV_DIR = "./backup_csvs/";

    @EventListener(ApplicationReadyEvent.class)
    public void exportAll() {
        java.io.File dir = new java.io.File(CSV_DIR);
        if (!dir.exists()) dir.mkdirs();
        
        exportUsers();
        exportEvents();
        exportEventRegistrations();
        exportNotifications();
        exportTeams();
    }

    public void exportUsers() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(CSV_DIR + "users.csv"))) {
            writer.println("id,username,role,rollNumber");
            for (User p : userRepository.findAll()) {
                writer.printf("%d,%s,%s,%s\n", p.getId(), escapeCsv(p.getUsername()), p.getRole(), escapeCsv(p.getRollNumber()));
            }
        } catch (IOException e) { e.printStackTrace(); }
    }

    public void exportEvents() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(CSV_DIR + "events.csv"))) {
            writer.println("id,eventName,sport,fee,isTeamSport,duration,startDate,endDate,totalSlots,tournamentType,isRegistrationOpen,createdBy");
            for (Event e : eventRepository.findAll()) {
                writer.printf("%d,%s,%s,%.2f,%b,%s,%s,%s,%d,%s,%b,%s\n", 
                    e.getId(), escapeCsv(e.getEventName()), escapeCsv(e.getSport()), 
                    e.getFee() == null ? 0.0 : e.getFee(), e.getIsTeamSport(),
                    escapeCsv(e.getDuration()), escapeCsv(e.getStartDate()), escapeCsv(e.getEndDate()), 
                    e.getTotalSlots(), escapeCsv(e.getTournamentType()), 
                    e.getIsRegistrationOpen(), escapeCsv(e.getCreatedBy())
                );
            }
        } catch (IOException e) { e.printStackTrace(); }
    }
    
    public void exportEventRegistrations() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(CSV_DIR + "event_registrations.csv"))) {
            writer.println("event_id,player_username");
            for (Event e : eventRepository.findAll()) {
                if (e.getRegisteredPlayers() != null) {
                    for (String username : e.getRegisteredPlayers()) {
                         writer.printf("%d,%s\n", e.getId(), escapeCsv(username));
                    }
                }
            }
        } catch (IOException e) { e.printStackTrace(); }
    }

    public void exportTeams() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(CSV_DIR + "teams.csv"))) {
            writer.println("id,name,sport,isOpenToRequests,captainUsername,memberCount");
            for (Team t : teamRepository.findAll()) {
                writer.printf("%d,%s,%s,%b,%s,%d\n", 
                    t.getId(), escapeCsv(t.getName()), escapeCsv(t.getSport()), 
                    t.getIsOpenToRequests(), escapeCsv(t.getCaptainUsername()), 
                    t.getMembers() != null ? t.getMembers().size() : 0);
            }
        } catch (IOException e) { e.printStackTrace(); }
    }

    public void exportNotifications() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(CSV_DIR + "notifications.csv"))) {
            writer.println("id,senderUsername,targetRole,status,title");
            for (Notification n : notificationRepository.findAll()) {
                writer.printf("%d,%s,%s,%s,%s\n", n.getId(), escapeCsv(n.getSenderUsername()), n.getTargetRole(), n.getStatus(), escapeCsv(n.getTitle()));
            }
        } catch (IOException e) { e.printStackTrace(); }
    }
    
    private String escapeCsv(String data) {
        if (data == null) return "";
        return "\"" + data.replace("\"", "\"\"") + "\"";
    }
}
