                                                   FastTrack Sports Management - README

This document provides instructions for building and running the application, details about design patterns used,
partially implemented features, and currently known bugs.


--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


                                                  SECTION 1: INSTRUCTIONS FOR COMPILING AND RUNNING

METHOD A: LOCAL SETUP AND EXECUTION (RECOMMENDED)

Prerequisites:

  Java JDK 21 or higher
  Node.js 18 or higher (with npm)
  H2 embedded database (bundled — no separate installation required)

Backend:
cd backend
./mvnw spring-boot:run

Frontend:
cd frontend
npm install
npm run dev

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

                                                            SECTION 2: DESIGN PATTERNS USED


           ---------SINGLETON PATTERN----------

Ensures a single shared instance of service and controller beans across the application lifecycle.

Implementations:

All Spring @RestController classes (e.g., AuthController, EventController, TeamController, MatchController,
NotificationController, ProfileController, RegistrationController, SearchController, MatchmakingController)
All Spring @Service classes (e.g., CsvExportService, EmailService)

Spring's IoC container manages singleton bean scope by default, guaranteeing one shared instance per bean
throughout the application.


           ---------REPOSITORY PATTERN----------

Abstracts data access operations behind clean repository interfaces, decoupling domain logic from persistence.

Implementations:

backend/src/main/java/com/example/demo/repository/UserRepository.java
backend/src/main/java/com/example/demo/repository/TeamRepository.java
backend/src/main/java/com/example/demo/repository/EventRepository.java
backend/src/main/java/com/example/demo/repository/MatchRepository.java

Spring Data JPA repositories provide CRUD operations and custom queries without manual SQL or DAO boilerplate.


           ---------STRATEGY PATTERN----------

Encapsulates interchangeable skill-based matchmaking algorithms for individual players and teams.

Implementations:

backend/src/main/java/com/example/demo/controller/MatchmakingController.java

The matchmaking engine selects an opponent by applying a skill-difference threshold strategy
(tolerance of ±15 skill points), enabling future strategy variants (e.g., ELO-based, region-based)
to be swapped in without changing the calling code.


           ---------OBSERVER PATTERN----------

Implements event-driven communication for notifications.

Implementations:

backend/src/main/java/com/example/demo/controller/NotificationController.java
backend/src/main/java/com/example/demo/service/EmailService.java

When notable events occur (e.g., join request accepted, match scheduled), the notification subsystem
observes the state change and dispatches in-app notifications and optional email alerts to relevant users.


           ---------FACADE PATTERN----------

Provides a simplified, unified interface over complex subsystem operations.

Implementations:

backend/src/main/java/com/example/demo/controller/EventController.java
backend/src/main/java/com/example/demo/controller/TeamController.java

Each controller acts as a facade, orchestrating repository queries, role checks, notification dispatch,
and CSV export behind a clean REST endpoint surface — hiding internal complexity from the frontend.


           ---------TEMPLATE METHOD PATTERN----------

Defines a skeleton workflow for data export operations, with subclasses or services providing specific steps.

Implementations:

backend/src/main/java/com/example/demo/service/CsvExportService.java

CsvExportService defines the fixed steps of a CSV generation pipeline (fetch data → map fields → write rows →
return file), while the specific entity type and field mapping vary per export call.



--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                                                      SECTION 3: FEATURES NOT IMPLEMENTED END-TO-END


Email Notification Delivery:

The EmailService is implemented and wired into the notification flow; however, actual SMTP delivery
requires an external mail server configuration (e.g., SendGrid, Gmail SMTP).

Without valid SMTP credentials in application.properties, email notifications are silently skipped.
In-app notifications continue to function regardless of email configuration.

Configuring SMTP delivery may be completed in a future iteration.


--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                                                                    SECTION 4: KNOWN BUGS

           
           ----------Session Expiry Handling----------
In some browsers, hard-refreshing the page during an active session may cause the authentication
context to lose the stored user token before re-initialization completes, resulting in an unexpected
redirect to the login page.

Workaround: Log in again. The session is re-established immediately upon successful login.

           ----------Team Registration Edge Cases----------
Currently, team registrations routed through the administrative approval queue might fail to reflect
instant rejection if the tournament constraints are changed simultaneously by an organizer.

Workaround: Organizers can manually dismiss pending requests in the Approvals dashboard.

	                                           ----THE END--- :)
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
