export const LEGAL_PAGES = {
  privacyPolicy: {
    title: 'Privacy Policy',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Anonymous Play & Zero PII Collection',
        content:
          'Chor Police: Bluff Royale is designed strictly for anonymous, recreational entertainment. We do not require, collect, or store personal names, email addresses, phone numbers, social media logins, or physical location data from regular players. Your temporary identity is represented by a generated safe pseudonym (such as "Silent Tiger").',
      },
      {
        heading: '2. Local Storage & Session Data',
        content:
          'The application uses standard browser LocalStorage to maintain your anonymous session, sound preferences, and lifetime statistics. Please note that manually clearing your browser cache or site storage may reset your local anonymous game history.',
      },
      {
        heading: '3. Payment & Billing Privacy',
        content:
          'Transactions for host passes are processed through secure, industry-standard gateways (Razorpay). We never store or transmit sensitive card numbers, CVVs, or UPI PINs on our servers. Only cryptographic verification signatures and order identifiers are securely retained.',
      },
      {
        heading: '4. Game Telemetry',
        content:
          'Aggregated, privacy-conscious telemetry events (such as match completion rates and seat fill times) are collected strictly without personal identifiers, role clues, or private room credentials.',
      },
    ],
  },
  termsOfUse: {
    title: 'Terms of Use',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Pure Entertainment & Social Deduction',
        content:
          'Chor Police: Bluff Royale is a fictional social deduction game inspired by traditional parlor games. All characters, cases, scenarios, and investigations are purely fictional works of entertainment. The game does not offer real-money gambling, cash prizes, or deposits.',
      },
      {
        heading: '2. Fair Play & Prohibited Actions',
        content:
          'Unsolicited automation, tampering with game communication protocols, or attempting to exploit multiplayer rooms is strictly forbidden. The game provides structured, controlled communication options rather than unmonitored open chat to maintain a positive and safe environment.',
      },
      {
        heading: '3. Disclosed Bot Players',
        content:
          'In public matchmaking and designated private rooms, vacant seats are filled with clearly labeled automated rule-based players (bearing a visible BOT badge) to ensure quick, seamless 6-player matches without misleading human users.',
      },
      {
        heading: '4. Host Passes & Validity',
        content:
          'Purchased private room host passes provide temporary room creation access for a fixed duration of two hours. Public quick match and joining existing private rooms are always free.',
      },
    ],
  },
  refundPolicy: {
    title: 'Refund & Cancellation Policy',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Digital Entitlements',
        content:
          'Private room host passes (₹29 for 2 hours) provide immediate digital activation. Because access is granted immediately upon payment confirmation, passes are generally non-refundable once activated.',
      },
      {
        heading: '2. Technical Disruptions & Billing Errors',
        content:
          'In the event of a verified double charge, payment gateway error, or severe server outage preventing room creation during your active pass window, please contact our support team with your transaction reference for an immediate review and refund resolution.',
      },
      {
        heading: '3. Contact Resolution',
        content:
          'Refund inquiries are typically reviewed within 2–3 business days. Approved refunds are credited back to the original payment source according to standard banking timelines.',
      },
    ],
  },
  communitySafety: {
    title: 'Community Safety & Respect',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Safe by Design',
        content:
          'To protect all participants from harassment, toxicity, and spam, Chor Police: Bluff Royale features structured game communication. Players interact exclusively using case-relevant questions, statements, and reaction emojis.',
      },
      {
        heading: '2. Prohibited Content & Reporting',
        content:
          'Custom aliases undergo automatic safety validation. If you observe any inappropriate behavior or suspected exploitation, use the in-game report feature to notify the administrative moderation team.',
      },
    ],
  },
  credits: {
    title: 'Credits & Technology',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: 'Game Design & Conception',
        content: 'Chor Police: Bluff Royale — An original social deduction strategy game.',
      },
      {
        heading: 'Audio & Acoustics',
        content:
          'All sound effects and harmonic tones are procedurally generated in real time using the standard Web Audio API synthesis oscillator system. No copyrighted audio tracks or third-party audio files are utilized.',
      },
      {
        heading: 'Visuals & UI Icons',
        content: 'Custom SVG graphics, Tailwind CSS styling, and Lucide React icons.',
      },
    ],
  },
};
