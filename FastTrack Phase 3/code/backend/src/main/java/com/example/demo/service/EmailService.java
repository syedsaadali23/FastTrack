package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {
    private static final String SERVICE_ID = "service_8j6zuth";
    private static final String TEMPLATE_ID = "template_nbiew6h";
    private static final String PUBLIC_KEY = "KUZoA0Z-AnOZqkBKu";
    private static final String API_URL = "https://api.emailjs.com/api/v1.0/email/send";

    public boolean sendEmail(String to, String subject, String text) {
        try {
            String safeSubject = subject.replace("\"", "\\\"");
            String safeText = text.replace("\"", "\\\"").replace("\n", "<br>");

            String jsonBody = String.format(
                "{" +
                "  \"service_id\": \"%s\"," +
                "  \"template_id\": \"%s\"," +
                "  \"user_id\": \"%s\"," +
                "  \"template_params\": {" +
                "    \"to_email\": \"%s\"," +
                "    \"subject\": \"%s\"," +
                "    \"message\": \"%s\"" +
                "  }" +
                "}",
                SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY, to, safeSubject, safeText
            );

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .header("Origin", "http://localhost:5173")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            System.out.println("EmailJS response code: " + response.statusCode());
            System.out.println("EmailJS response body: " + response.body());

            return response.statusCode() >= 200 && response.statusCode() < 300;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
