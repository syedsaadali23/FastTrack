package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Configuration
public class DatabaseInitializer {

    // Usually sqlserver://localhost:1433
    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @PostConstruct
    public void init() {
        try {
            // We strip out the databaseName property to connect to master
            // e.g. jdbc:sqlserver://localhost:1433;databaseName=FastTrackDB;...
            String[] parts = datasourceUrl.split(";");
            StringBuilder masterUrl = new StringBuilder();
            String dbName = "FastTrackDB"; // default
            
            for (String part : parts) {
                if (part.toLowerCase().startsWith("databasename=")) {
                    dbName = part.split("=")[1];
                } else {
                    masterUrl.append(part).append(";");
                }
            }
            
            // Connect to master database
            try (Connection conn = DriverManager.getConnection(masterUrl.toString());
                 Statement stmt = conn.createStatement()) {
                
                // Check if database exists, create if not
                System.out.println("Checking if database " + dbName + " exists...");
                stmt.execute("IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '" + dbName + "') " +
                             "BEGIN " +
                             "    CREATE DATABASE [" + dbName + "]; " +
                             "END;");
                System.out.println("Database initialization guaranteed!");
            }
        } catch (Exception e) {
            System.err.println("Could not auto-initialize DB: " + e.getMessage());
            // It will fall back to normal application flow which might succeed if DB exists or fail.
        }
    }
}
