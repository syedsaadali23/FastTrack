import type { Event, Team, Match, LeaderboardEntry } from "@/types";

export const MOCK_EVENTS: Event[] = [
  {
    id: 101,
    eventName: "Fast Spring Cup 2026",
    sport: "Cricket",
    fee: 2500,
    isTeamSport: true,
    duration: "2 Weeks",
    startDate: "2026-05-01",
    endDate: "2026-05-15",
    totalSlots: 16,
    tournamentType: "Elimination",
    teamCap: 11,
    minRequired: 8,
    isRegistrationOpen: true,
    eventStatus: "Upcoming",
    isRegistered: false,
    availableSlots: 4,
    picture: ""
  },
  {
    id: 102,
    eventName: "Inter-Departmental Football",
    sport: "Football",
    fee: 1000,
    isTeamSport: true,
    duration: "10 Days",
    startDate: "2026-04-10",
    endDate: "2026-04-20",
    totalSlots: 8,
    tournamentType: "RoundRobin",
    teamCap: 7,
    minRequired: 5,
    isRegistrationOpen: false,
    eventStatus: "Ongoing",
    isRegistered: true,
    availableSlots: 0,
    picture: ""
  },
  {
    id: 103,
    eventName: "Badminton Smash-Off",
    sport: "Badminton",
    fee: 500,
    isTeamSport: false,
    duration: "3 Days",
    startDate: "2026-04-01",
    endDate: "2026-04-04",
    totalSlots: 32,
    tournamentType: "Elimination",
    teamCap: 1,
    minRequired: 1,
    isRegistrationOpen: false,
    eventStatus: "Finished",
    isRegistered: false,
    availableSlots: 0,
    picture: ""
  }
];

export const MOCK_MATCHES: any[] = [
  // Elimination Bracket for Cricket
  { id: 1001, eventId: 101, sport: "Cricket", team1Name: "CS Titans", team2Name: "EE Lancers", team1Score: 0, team2Score: 0, status: "Scheduled", startTime: "2026-05-01T10:00", endTime: "2026-05-01T13:00", venue: "Main Ground", roundNumber: 1, nextMatchId: 1005 },
  { id: 1002, eventId: 101, sport: "Cricket", team1Name: "SE Warriors", team2Name: "BBA Lions", team1Score: 0, team2Score: 0, status: "Scheduled", startTime: "2026-05-01T14:00", endTime: "2026-05-01T17:00", venue: "Main Ground", roundNumber: 1, nextMatchId: 1005 },
  { id: 1003, eventId: 101, sport: "Cricket", team1Name: "AI Cyber", team2Name: "DS Mavericks", team1Score: 0, team2Score: 0, status: "Scheduled", startTime: "2026-05-02T10:00", endTime: "2026-05-02T13:00", venue: "Lower Ground", roundNumber: 1, nextMatchId: 1006 },
  { id: 1004, eventId: 101, sport: "Cricket", team1Name: "Winner of Q4", team2Name: "FAST Staff", team1Score: 0, team2Score: 0, status: "Scheduled", startTime: "2026-05-02T14:00", endTime: "2026-05-02T17:00", venue: "Lower Ground", roundNumber: 1, nextMatchId: 1006 },
  { id: 1005, eventId: 101, sport: "Cricket", team1Name: "Winner of M1", team2Name: "Winner of M2", team1Score: 0, team2Score: 0, status: "Scheduled", roundNumber: 2, nextMatchId: 1007 },
  { id: 1006, eventId: 101, sport: "Cricket", team1Name: "Winner of M3", team2Name: "Winner of M4", team1Score: 0, team2Score: 0, status: "Scheduled", roundNumber: 2, nextMatchId: 1007 },
  { id: 1007, eventId: 101, sport: "Cricket", team1Name: "Winner of S1", team2Name: "Winner of S2", team1Score: 0, team2Score: 0, status: "Scheduled", roundNumber: 3 }, // Final

  // Round Robin for Football
  { id: 2001, eventId: 102, sport: "Football", team1Name: "CS Kings", team2Name: "EE United", team1Score: 2, team2Score: 1, status: "Finished", winner: "CS Kings", roundNumber: 1, venue: "Futsal Court" },
  { id: 2002, eventId: 102, sport: "Football", team1Name: "BBA FC", team2Name: "AI Raiders", team1Score: 1, team2Score: 1, status: "Finished", winner: "Draw", roundNumber: 1, venue: "Futsal Court" },
  { id: 2003, eventId: 102, sport: "Football", team1Name: "CS Kings", team2Name: "BBA FC", team1Score: 3, team2Score: 0, status: "Finished", winner: "CS Kings", roundNumber: 2, venue: "Futsal Court" },
  { id: 2004, eventId: 102, sport: "Football", team1Name: "EE United", team2Name: "AI Raiders", team1Score: 0, team2Score: 0, status: "Scheduled", startTime: "2026-04-18T16:00", endTime: "2026-04-18T17:00", roundNumber: 2, venue: "Futsal Court" },
];

export const MOCK_LEADERBOARD = [
  {
    sport: "Cricket",
    tournamentType: "Elimination",
    leaderboard: [
      { team: "CS Titans", placement: "🏆 Champion", placementRank: 1 },
      { team: "EE Lancers", placement: "🥈 Runner-up", placementRank: 2 },
      { team: "BBA Lions", placement: "🥉 Semi-Finalist", placementRank: 3 },
    ]
  },
  {
    sport: "Football",
    tournamentType: "RoundRobin",
    leaderboard: [
      { team: "CS Kings", wins: 2, points: 6, goalDiff: 4, goalsFor: 5 },
      { team: "BBA FC", wins: 0, points: 1, goalDiff: -3, goalsFor: 1 },
      { team: "AI Raiders", wins: 0, points: 1, goalDiff: 0, goalsFor: 1 },
      { team: "EE United", wins: 0, points: 0, goalDiff: -1, goalsFor: 1 },
    ]
  }
];
