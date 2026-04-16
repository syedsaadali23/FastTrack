interface Props {
  sport: string;
  className?: string;
  size?: number;
}

/**
 * Custom SVG sport icons since lucide-react doesn't have proper sport icons.
 */
export function SportIcon({ sport, className = "", size = 28 }: Props) {
  const s = sport.toLowerCase().trim();

  // Football (soccer ball)
  if (s === "football") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" opacity="0.15" fill="currentColor" />
      </svg>
    );
  }

  // Cricket (bat and ball)
  if (s === "cricket") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Bat */}
        <path d="M4.5 19.5l2-2" />
        <path d="M6.5 17.5l8-11a2 2 0 0 1 3 0l.5.5a2 2 0 0 1 0 3l-11 8z" />
        <path d="M3 21l2-2" />
        {/* Ball */}
        <circle cx="18.5" cy="5.5" r="2.5" />
        <path d="M17 4c1 1 2 2 1 4" />
      </svg>
    );
  }

  // Basketball
  if (s === "basketball") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
        <path d="M2 12h20" />
        <path d="M4.93 4.93c4.08 2.64 8.2 3.07 14.14 0" />
        <path d="M4.93 19.07c4.08-2.64 8.2-3.07 14.14 0" />
      </svg>
    );
  }

  // Volleyball
  if (s === "volleyball") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2c-1.5 5-1.5 10 0 15" />
        <path d="M12 2c1.5 5 1.5 10 0 15" />
        <path d="M2 12c5 1.5 10 1.5 15 0" />
        <path d="M2 12c5-1.5 10-1.5 15 0" />
      </svg>
    );
  }

  // Table Tennis (paddle and ball)
  if (s === "table tennis") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Paddle */}
        <path d="M15.5 3.5a5 5 0 0 1 0 7.07l-6.36 6.36a2 2 0 0 1-2.83 0L4.07 14.7a2 2 0 0 1 0-2.83L10.43 5.5a5 5 0 0 1 5.07-2z" />
        {/* Handle */}
        <path d="M4 20l3.5-3.5" />
        {/* Ball */}
        <circle cx="19" cy="5" r="2" />
      </svg>
    );
  }

  // Badminton (shuttlecock)
  if (s === "badminton") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Shuttlecock cork */}
        <circle cx="12" cy="19" r="2.5" />
        {/* Feathers */}
        <path d="M12 16.5V5" />
        <path d="M8 3c0 4 4 8 4 13.5" />
        <path d="M16 3c0 4-4 8-4 13.5" />
        <path d="M6 6c2 2 6 4 6 10.5" />
        <path d="M18 6c-2 2-6 4-6 10.5" />
      </svg>
    );
  }

  // Fallback: generic trophy icon
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
