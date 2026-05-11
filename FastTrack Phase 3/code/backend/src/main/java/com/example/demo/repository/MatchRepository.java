package com.example.demo.repository;

import com.example.demo.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByEventId(Long eventId);
    List<Match> findBySport(String sport);
}
