package com.example.demo.repository;

import com.example.demo.model.RegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    List<RegistrationRequest> findByStatus(String status);
    List<RegistrationRequest> findByUsername(String username);
}
