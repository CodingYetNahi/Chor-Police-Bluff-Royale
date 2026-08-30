import { Case } from '../types';

export const SEED_CASES: Case[] = [
  {
    id: 'case-01-golden-samosa',
    title: 'The Missing Golden Samosa Trophy',
    intro: 'During the Annual College Food Fest, the coveted gilded Golden Samosa trophy disappeared from the glass display just before the awards ceremony.',
    location: 'Campus Auditorium Hall',
    difficulty: 'Easy',
    tags: ['Campus', 'Festival', 'Trophy'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Empty Velvet Display Pedestal',
        description: 'The glass case lock was picked cleanly with no shattered glass.',
        tag: 'Physical',
        inspectedDetail: 'Micro-scratches indicate a brass hairpin tool was used at 4:15 PM.'
      },
      {
        id: 'ev-2',
        name: 'Snack Stall Register Log',
        description: 'Shows that three contestants left their tables around 4:10 PM.',
        tag: 'Document',
        inspectedDetail: 'Entry #42 signed with a blue fountain pen.'
      },
      {
        id: 'ev-3',
        name: 'Spilled Tamarind Chutney Trail',
        description: 'Drips lead toward the backstage dressing room exit.',
        tag: 'Trace',
        inspectedDetail: 'Shoe impression matches size 9 sneaker with a zig-zag sole pattern.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was testing the microphone at the stage podium until 4:30 PM with the audio team.',
      policeVerifiedClue: 'Auditorium audio logs confirm the stage mic was muted and unmanned between 4:00 PM and 4:25 PM.',
      informerSecretClue: 'A volunteer spotted someone wearing a yellow food-stall apron tucking a heavy metallic object into a gym sack backstage.',
      protectorDefenseClue: 'The beverage coordinator was visibly present at the juice counter without leaving from 4:00 PM to 4:45 PM.',
      citizenClues: [
        'The main hallway lights flickered for two minutes at 4:12 PM during the power shift.',
        'Backstage exit doors were locked from the outside except for the green room side corridor.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Where were you during the 4:15 PM trophy presentation window?', category: 'timeline' },
      { id: 'q-2', text: 'Did anyone see the trophy glass cabinet being opened?', category: 'evidence' },
      { id: 'q-3', text: 'Were you wearing a yellow volunteer apron near backstage?', category: 'alibi' },
      { id: 'q-4', text: 'Can anyone vouch for your location when the lights dimmed?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was at the beverage counter helping serve fresh lime juice without leaving.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was testing the stage microphone continuously through 4:30 PM.', roleTypeHint: 'CHOR', contradictionTargetId: 'contra-audio' },
      { id: 'stmt-3', text: 'Audio desk logs show the stage mics were completely powered down before 4:25 PM.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'I saw someone in a yellow apron rushing through the green room corridor.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'I checked the side exits and verified the main doors were locked from outside.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'Someone mentioned the audio team swapped technicians right around 4:10 PM.' },
      { id: 'doubt-2', text: 'The snack stall register clock was running ten minutes fast all afternoon.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to test live microphones directly contradicts the audio log showing the system was unpowered until 4:25 PM.'
      }
    ],
    correctReasoning: 'The Chor fabricated an alibi about testing stage microphones, but verified audio records prove the system was entirely powered off at 4:15 PM. Furthermore, the yellow apron sighting points to backstage access.'
  },
  {
    id: 'case-02-swapped-presentation',
    title: 'The Swapped Keynote Presentation',
    intro: 'Minutes before the investor demo, the confidential product slideshow on the chief laptop was replaced with hilarious cat memes.',
    location: 'Skyline Tech Hub Boardroom',
    difficulty: 'Easy',
    tags: ['Office', 'Tech', 'Presentation'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'USB Drive Left in Laptop Port',
        description: 'A matte black 32GB thumb drive labelled "PROJECT_FINAL".',
        tag: 'Digital',
        inspectedDetail: 'File transfer timestamp shows files overwritten at 11:42 AM.'
      },
      {
        id: 'ev-2',
        name: 'Server Room Access Badge Swipe',
        description: 'Badge #108 was swiped at the second floor corridor at 11:40 AM.',
        tag: 'Access Log',
        inspectedDetail: 'Card registered to guest access badge pool.'
      },
      {
        id: 'ev-3',
        name: 'Boardroom Coffee Cup',
        description: 'Cold hazelnut latte left near the master HDMI switcher.',
        tag: 'Item',
        inspectedDetail: 'Receipt tucked underneath timestamped 11:35 AM from Ground Floor Brews.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was on a remote video sync in Booth C with headphones on from 11:30 AM to 12:00 PM.',
      policeVerifiedClue: 'Network router logs indicate Booth C had zero connected Wi-Fi or Ethernet devices after 11:20 AM.',
      informerSecretClue: 'The black USB drive has a scratch on the silver casing shaped like the letter Z, identical to one kept on the marketing desk.',
      protectorDefenseClue: 'The lead software engineer was troubleshooting the database console in full view of the CTO all morning.',
      citizenClues: [
        'The boardroom door was left unlatched during the coffee break between 11:35 AM and 11:45 AM.',
        'The cat meme file was downloaded from a public repository at 11:15 AM.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you inside Booth C during the 11:42 AM file swap?', category: 'alibi' },
      { id: 'q-2', text: 'Who owns the matte black thumb drive left in the projector rig?', category: 'evidence' },
      { id: 'q-3', text: 'Did anyone see who ordered the hazelnut latte in the boardroom?', category: 'timeline' },
      { id: 'q-4', text: 'Can anyone verify your computer activity before noon?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was at the open engineering bench with the CTO reviewing database logs.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was isolated in Booth C on a video call without interruption until noon.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Network AP metrics show Booth C was completely offline and empty during that window.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'The custom scratch on the USB casing matches items from the desk near the door.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The boardroom coffee break started exactly at 11:35 AM.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'Someone could have used mobile hotspot tethering inside Booth C.' },
      { id: 'doubt-2', text: 'The boardroom clock might have been synced to UTC instead of local time.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to conduct an uninterrupted online video sync in Booth C contradicts router logs proving zero connectivity.'
      }
    ],
    correctReasoning: 'The Chor claimed to be attending an online video call in Booth C, but network metrics prove Booth C had no devices connected at that time.'
  },
  {
    id: 'case-03-signed-cricket-bat',
    title: 'The Vanished Signed Cricket Bat',
    intro: 'A legendary commemorative cricket bat signed by the 1983 champions went missing from the clubhouse glass showcase after tea break.',
    location: 'Gymkhana Cricket Pavilion',
    difficulty: 'Medium',
    tags: ['Sports', 'Clubhouse', 'Cricket'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Showcase Cabinet Padlock',
        description: 'The brass padlock was found open with key #4 still inserted.',
        tag: 'Physical',
        inspectedDetail: 'Key #4 is the spare kept in the equipment shed drawer.'
      },
      {
        id: 'ev-2',
        name: 'Muddy Turf Cleat Marks',
        description: 'Fresh damp red clay turf tracks from the practice nets into the trophy room.',
        tag: 'Trace',
        inspectedDetail: 'Cleats have 8 metal spikes, unique to spin bowlers.'
      },
      {
        id: 'ev-3',
        name: 'Tea Break Scorecard',
        description: 'Matches match recess officially called between 4:30 PM and 5:00 PM.',
        tag: 'Document',
        inspectedDetail: 'Scorecard notes rain stoppage started at 4:35 PM.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the indoor gym treadmill room from 4:30 PM to 5:15 PM wearing flat sneakers.',
      policeVerifiedClue: 'Clubhouse CCTV at the entrance shows the suspect entering the pavilion wearing spiked turf boots at 4:40 PM.',
      informerSecretClue: 'The bat was wrapped in a blue rain poncho and stashed behind the scorekeeper board roller.',
      protectorDefenseClue: 'The pavilion secretary was serving chai to guests in the lounge continuously from 4:20 PM.',
      citizenClues: [
        'The equipment shed key box was unlocked during tea break.',
        'The rain started heavily at 4:35 PM, forcing all outfielders inside.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'What footwear were you wearing between 4:30 PM and 5:00 PM?', category: 'evidence' },
      { id: 'q-2', text: 'Did you enter the trophy corridor during the tea interval?', category: 'timeline' },
      { id: 'q-3', text: 'Who had access to the spare shed key drawer?', category: 'alibi' },
      { id: 'q-4', text: 'Where did you seek shelter when the rain started at 4:35 PM?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I stayed in the lounge having tea with the secretary throughout the rain break.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I stayed only in the treadmill gym in flat rubber shoes the whole time.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'CCTV timestamps prove the person wore spiked bowling turf shoes into the pavilion.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A blue rain poncho concealing a long wooden item was seen near the scoreboard.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The outfield grass was thoroughly soaked by 4:40 PM.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'Anyone could have walked in from the practice net before putting on sneakers.' },
      { id: 'doubt-2', text: 'The CCTV clock in the hallway might not have accounted for daylight saving.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming flat running shoes in the gym contradicts entrance video capturing spiked bowling cleats.'
      }
    ],
    correctReasoning: 'The Chor claimed they stayed inside the gym with flat sneakers, directly contradicted by the CCTV footage showing spiked bowling cleats entering at 4:40 PM.'
  },
  {
    id: 'case-04-altered-society-notice',
    title: 'The Altered Housing Society Notice',
    intro: 'The official resident general meeting notice was replaced with a fake flyer claiming elevator maintenance was postponed indefinitely.',
    location: 'Greenwood Enclave Notice Board',
    difficulty: 'Easy',
    tags: ['Society', 'Notice', 'Residential'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Tampered Notice Sheet',
        description: 'Printed on 90 GSM cream cardstock with a smudge of green highlighter.',
        tag: 'Document',
        inspectedDetail: 'Watermark shows it was printed from a HomeJet 300 series printer.'
      },
      {
        id: 'ev-2',
        name: 'Notice Board Glass Pins',
        description: 'Three red pushpins dropped on the lobby marble floor.',
        tag: 'Trace',
        inspectedDetail: 'Fingerprints found on the pinheads match the society stationery kit.'
      },
      {
        id: 'ev-3',
        name: 'Security Gate Register',
        description: 'Tracks courier and resident movement between 8:00 AM and 9:00 AM.',
        tag: 'Access Log',
        inspectedDetail: 'Resident in Flat 304 reported hearing stapler clicking at 8:25 AM.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the basement parking lot washing my bicycle from 8:00 AM to 8:45 AM.',
      policeVerifiedClue: 'Security camera at basement ramp shows no resident was near the water tap between 8:15 AM and 8:40 AM.',
      informerSecretClue: 'The original meeting agenda was hidden inside the empty newspaper rack near the elevator lobby.',
      protectorDefenseClue: 'The society treasurer was collecting maintenance cheques at the lobby desk with three witnesses from 8:00 AM.',
      citizenClues: [
        'The notice board lock was left open after the milk delivery schedule was posted at 7:45 AM.',
        'Cream cardstock is only stored in the ground-floor committee office drawer.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you in the lobby area around 8:25 AM when the stapler was heard?', category: 'timeline' },
      { id: 'q-2', text: 'Did you access the committee office stationery drawer today?', category: 'evidence' },
      { id: 'q-3', text: 'Where were you between 8:15 AM and 8:40 AM?', category: 'alibi' },
      { id: 'q-4', text: 'Why was the elevator notice changed right before the morning rush?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was chatting with the treasurer at the maintenance desk from 8:05 AM onward.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was washing my bicycle at the basement tap without stopping until 8:45 AM.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Basement ramp security footage shows the tap area was dry and totally deserted.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'The authentic original notice was discovered tucked in the newspaper slot.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The ground-floor committee drawer was unlocked when the morning mail arrived.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The basement tap might have a blind spot behind the pillar.' },
      { id: 'doubt-2', text: 'Several residents have printers compatible with that cardstock.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to wash a bicycle in the basement contradicts camera footage showing the tap area empty and dry.'
      }
    ],
    correctReasoning: 'The Chor fabricated a basement bicycle washing alibi, but ramp security video proves no one was at the basement tap.'
  },
  {
    id: 'case-05-vintage-stamp-album',
    title: 'The Missing Vintage Stamp Album',
    intro: 'A rare 1947 Independence Philatelic album was taken from the locked reference desk of the heritage city library.',
    location: 'Central Heritage Library',
    difficulty: 'Medium',
    tags: ['Library', 'Archive', 'Historical'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Reference Desk Brass Key',
        description: 'Key #7 found left in the lock cylinder.',
        tag: 'Physical',
        inspectedDetail: 'Key was logged as checked out to Desk 3 visitor.'
      },
      {
        id: 'ev-2',
        name: 'Cotton Handling Gloves',
        description: 'Pair of archival gloves left on the reading desk.',
        tag: 'Item',
        inspectedDetail: 'Traces of red ink stamping residue on the left index thumb.'
      },
      {
        id: 'ev-3',
        name: 'Library Turnstile Counter',
        description: 'Six readers checked into the historical research annex after 2:00 PM.',
        tag: 'Access Log',
        inspectedDetail: 'Turnstile recorded an exit with an oversized leather satchel at 2:40 PM.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the microfilm viewing booth with the door closed from 2:15 PM to 3:00 PM.',
      policeVerifiedClue: 'Microfilm reader power logs show machine #2 was only turned on at 3:05 PM.',
      informerSecretClue: 'The stamps were slipped inside the dust jacket of an encyclopedia on Section B shelf 4.',
      protectorDefenseClue: 'The head archivist was assisting a university professor at the digitization desk throughout 2:00 PM to 3:00 PM.',
      citizenClues: [
        'The reference room requires signing the physical ledger before viewing rare items.',
        'The overhead reading lights in Section B were turned off for maintenance until 2:30 PM.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you using the microfilm reader machine between 2:15 PM and 3:00 PM?', category: 'timeline' },
      { id: 'q-2', text: 'Who checked out archival cotton gloves today?', category: 'evidence' },
      { id: 'q-3', text: 'Did you carry an oversized leather bag into the annex?', category: 'alibi' },
      { id: 'q-4', text: 'What research subject were you studying during the afternoon session?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was seated with the head archivist reviewing digitization scans all hour.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was reading microfilm rolls continuously on machine 2 from 2:15 PM.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Microfilm power monitors confirm machine 2 remained completely cold until 3:05 PM.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'An encyclopedia dust jacket on shelf B4 felt suspiciously thick and padded.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The annex ledger was signed by all six research visitors.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The microfilm reader might have been used without switching on the lamp switch.' },
      { id: 'doubt-2', text: 'Anyone could have picked up the archival gloves from the cart.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to read microfilm rolls on machine 2 is debunked by automated power telemetry proving it was unpowered.'
      }
    ],
    correctReasoning: 'The Chor claimed to be using microfilm machine 2 during the theft, but power logs confirm the unit was completely powered off until 3:05 PM.'
  },
  {
    id: 'case-06-switched-wedding-envelope',
    title: 'The Switched Wedding Envelope',
    intro: 'At a grand family reception, the shagun blessing envelope containing a rare heirloom coin was swapped with plain colored paper.',
    location: 'Royal Palms Banquet Hall',
    difficulty: 'Medium',
    tags: ['Wedding', 'Celebration', 'Banquet'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Decorated Shagun Gift Box',
        description: 'Silk gift treasure box situated next to the stage sofa.',
        tag: 'Physical',
        inspectedDetail: 'The ribbon seal was cut cleanly using small embroidery shears.'
      },
      {
        id: 'ev-2',
        name: 'Banquet Buffet Token Sheet',
        description: 'Shows family meal allocations stamped between 7:30 PM and 8:30 PM.',
        tag: 'Document',
        inspectedDetail: 'Table 4 requested extra gift tags at 8:05 PM.'
      },
      {
        id: 'ev-3',
        name: 'Dropped Gold Foil Confetti',
        description: 'Traces of gold foil matching the envelope lining found near the dressing room.',
        tag: 'Trace',
        inspectedDetail: 'A silver embroidery scissors case was left on the dresser.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was outside near the entrance garden greeting arriving musicians until 8:20 PM.',
      policeVerifiedClue: 'The entrance valet logs show the musicians arrived early at 6:45 PM and no one was at the gate after 7:30 PM.',
      informerSecretClue: 'The heirloom coin was wrapped in a purple handkerchief and tucked inside the bridegroom grandfather coat pocket.',
      protectorDefenseClue: 'The event photographer was taking family portraits on the central stage without interruption from 7:45 PM to 8:30 PM.',
      citizenClues: [
        'The gift box was guarded until the dance performance started at 8:00 PM.',
        'Guests walked freely between the dining hall and dressing suites.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you near the entrance garden gate around 8:00 PM?', category: 'timeline' },
      { id: 'q-2', text: 'Who had small embroidery scissors during the function?', category: 'evidence' },
      { id: 'q-3', text: 'Did you step near the stage gift box during the dance recital?', category: 'alibi' },
      { id: 'q-4', text: 'Did anyone see the shagun box ribbon being untied?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was posing for stage photos with the photographer throughout the dance.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I spent the entire time from 7:45 PM to 8:20 PM at the gate welcoming the band.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Valet records verify the band arrived before 7:00 PM and the entrance was completely vacant.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A distinct purple silk handkerchief was seen concealing a round metal object.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The dance performances drew almost everyone away from the gift table.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'A second group of dhol players was scheduled to arrive later in the night.' },
      { id: 'doubt-2', text: 'Embroidery scissors are commonly found across all decoration tables.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to welcome musicians at 8:00 PM is contradicted by valet logs showing the band had arrived an hour earlier.'
      }
    ],
    correctReasoning: 'The Chor fabricated an alibi about waiting at the entrance for musicians, when official valet records prove the musicians arrived well before 7:00 PM.'
  },
  {
    id: 'case-07-misplaced-train-chart',
    title: 'The Misplaced Train Berthing Chart',
    intro: 'The primary conductor reservation chart for Coach B3 vanished right before the high-speed express departed the junction.',
    location: 'Platform 4 Station Master Office',
    difficulty: 'Hard',
    tags: ['Train', 'Platform', 'Transit'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Empty Metal Clipboard',
        description: 'The clip was bent open on the conductor desk in Cabin 2.',
        tag: 'Physical',
        inspectedDetail: 'Adhesive sticker backing peeled off at 9:15 PM.'
      },
      {
        id: 'ev-2',
        name: 'Platform Departure Signal Bell',
        description: 'Rung at 9:20 PM for the incoming express train.',
        tag: 'Event',
        inspectedDetail: 'Signal operator logged three personnel inside Cabin 2 during the chime.'
      },
      {
        id: 'ev-3',
        name: 'Chai Glass with Blue Chalk Powder',
        description: 'Found left near the chart printing kiosk.',
        tag: 'Trace',
        inspectedDetail: 'Blue chalk matches the shunting yard inspection sticks.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the passenger waiting room inspecting luggage scales from 9:00 PM to 9:30 PM.',
      policeVerifiedClue: 'The waiting room supervisor confirms the luggage scale room was under deep cleaning and locked all evening.',
      informerSecretClue: 'The chart was folded into a cylinder and slipped into a yellow reflective surveyor jacket pocket.',
      protectorDefenseClue: 'The deputy station master was announcing train arrivals on the public loudspeaker continuously.',
      citizenClues: [
        'Cabin 2 was crowded with parcel delivery couriers until 9:10 PM.',
        'The express train had two emergency VIP berths reserved in Coach B3.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you inside Cabin 2 when the 9:20 PM departure bell rang?', category: 'timeline' },
      { id: 'q-2', text: 'Did you use blue shunting chalk anywhere near the printing kiosk?', category: 'evidence' },
      { id: 'q-3', text: 'Were you in the passenger waiting room during the departure window?', category: 'alibi' },
      { id: 'q-4', text: 'Who had access to the conductor clipboard drawer?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was standing beside the deputy station master during the loudspeaker announcements.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was inside the passenger waiting room inspecting luggage scales until 9:30 PM.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Waiting room maintenance logs prove the scales room was locked and empty for deep cleaning.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A yellow reflective jacket was seen carrying a thick rolled-up paper cylinder.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The express platform was packed with passengers boarding Coach B3.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The luggage room key might have been left with a porter temporarily.' },
      { id: 'doubt-2', text: 'Blue chalk is used by all track maintenance crews on Platform 4.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to inspect luggage scales inside the locked, unstaffed cleaning area contradicts supervisor logs.'
      }
    ],
    correctReasoning: 'The Chor claimed they spent the departure window in the luggage scales room, which was locked for deep cleaning according to station supervisors.'
  },
  {
    id: 'case-08-tampered-rehearsal-schedule',
    title: 'The Tampered Stage Rehearsal Schedule',
    intro: 'The cue sheet for the opening night drama was modified, swapping the climax scene lighting and prop cues.',
    location: 'Community Cultural Auditorium',
    difficulty: 'Easy',
    tags: ['Theater', 'Performance', 'Arts'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Annotated Director Script Sheet',
        description: 'Handwritten ink corrections made with purple gel pen.',
        tag: 'Document',
        inspectedDetail: 'Ink is water-soluble pilot gel ink, batch 2026.'
      },
      {
        id: 'ev-2',
        name: 'Stage Lighting Dimmer Console',
        description: 'Preset #4 was adjusted at 5:45 PM.',
        tag: 'Digital',
        inspectedDetail: 'Console login used guest technician profile.'
      },
      {
        id: 'ev-3',
        name: 'Torn Stage Costume Fabric',
        description: 'Velvet silver swatch caught on the sound booth ladder.',
        tag: 'Trace',
        inspectedDetail: 'Matches the costume of the royal advisor character.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the basement prop workshop polishing the wooden swords from 5:30 PM to 6:15 PM.',
      policeVerifiedClue: 'Basement prop room timecard indicates the prop workshop was closed and the key was with the director until 6:30 PM.',
      informerSecretClue: 'The original unedited cue sheet was hidden underneath the synthesizer keyboard in the orchestra pit.',
      protectorDefenseClue: 'The lead actress was doing vocal warmups in the main green room with the dialogue coach without leaving.',
      citizenClues: [
        'The sound booth ladder was used to access the overhead spotlight rack.',
        'Rehearsal break was called between 5:30 PM and 6:00 PM.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Where were you between 5:30 PM and 6:00 PM when the cue sheet was rewritten?', category: 'timeline' },
      { id: 'q-2', text: 'Who owns the purple gel pen used for the script edits?', category: 'evidence' },
      { id: 'q-3', text: 'Did you climb the sound booth ladder during the lighting cue change?', category: 'alibi' },
      { id: 'q-4', text: 'Why were the lighting presets altered on the stage dimmer board?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was with the dialogue coach in the green room during the entire vocal warmup.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I spent the break in the basement prop workshop polishing stage swords.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'The prop workshop was locked and the director held the only master key until 6:30 PM.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'The real cue sheet was tucked under the orchestra pit electric keyboard.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The purple ink on the cue sheet was still damp at 6:00 PM.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'Someone could have slipped through the prop room ventilation shaft.' },
      { id: 'doubt-2', text: 'Multiple cast members were wearing costumes with silver velvet trims.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to work in the basement prop room is impossible since it remained locked by the director until 6:30 PM.'
      }
    ],
    correctReasoning: 'The Chor claimed an alibi of polishing swords in the basement prop workshop, but director records confirm the workshop was locked with no access allowed.'
  },
  {
    id: 'case-09-disappeared-cafe-recipe',
    title: 'The Disappeared Café Recipe Notebook',
    intro: 'The secret cardamom croissant recipe notebook vanished from the head pastry chef counter before the morning bake.',
    location: 'Monsoon Artisan Bakery & Café',
    difficulty: 'Medium',
    tags: ['Bakery', 'Café', 'Recipe'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Flour Dust Outline on Counter',
        description: 'Square indentation where the leather-bound book rested.',
        tag: 'Trace',
        inspectedDetail: 'Spilled vanilla extract nearby occurred at 6:15 AM.'
      },
      {
        id: 'ev-2',
        name: 'Oven Timer Bell Log',
        description: 'First batch of brioche loaded into Oven 2 at 6:20 AM.',
        tag: 'Timeline',
        inspectedDetail: 'Oven door handled by someone with cocoa powder on their apron.'
      },
      {
        id: 'ev-3',
        name: 'Back Kitchen Screen Door Latch',
        description: 'Found unhooked leading to the herb garden alley.',
        tag: 'Access',
        inspectedDetail: 'Fresh bicycle tire mark in the alleyway dust.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the cold storage room slicing butter blocks continuously from 6:00 AM to 6:40 AM.',
      policeVerifiedClue: 'Cold room temperature log shows the thermal door remained sealed without opening between 5:50 AM and 6:45 AM.',
      informerSecretClue: 'The recipe notebook was wrapped in greaseproof baking parchment and placed in the dry yeast storage bin.',
      protectorDefenseClue: 'The head barista was calibrating the espresso grinder at the front counter in front of early customers from 6:00 AM.',
      citizenClues: [
        'The pastry station flour was dusted fresh at 6:05 AM.',
        'The delivery driver arrived at the rear door at 6:30 AM.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you inside the walk-in cold room between 6:00 AM and 6:40 AM?', category: 'alibi' },
      { id: 'q-2', text: 'Who handled the vanilla extract on the pastry counter?', category: 'evidence' },
      { id: 'q-3', text: 'Did anyone see the back screen door being unlatched?', category: 'timeline' },
      { id: 'q-4', text: 'Why would the croissant recipe be targeted before the morning rush?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was pulling espresso shots with the head barista at the front counter.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was in the cold storage room cutting butter blocks the entire morning.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Electronic temperature logs prove the cold room door was never opened all hour.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A heavy parchment package was tucked into the large dry yeast tub.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The bakery rear screen door was swinging loose when the milk crates arrived.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The cold room sensor might have had a delayed telemetry sync.' },
      { id: 'doubt-2', text: 'Several staff members cut butter before the morning shift.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to enter the walk-in cold storage contradicts electronic sensor logs showing the door was never breached.'
      }
    ],
    correctReasoning: 'The Chor claimed to be inside the walk-in cold room slicing butter, but electronic temperature sensors prove the cold room door remained untouched and sealed all morning.'
  },
  {
    id: 'case-10-festival-rangoli-sabotage',
    title: 'The Festival Rangoli Sabotage',
    intro: 'The prize-winning 8-foot floral rangoli design in the society courtyard was swept away with a bucket of soapy water.',
    location: 'Shanti Heights Courtyard',
    difficulty: 'Easy',
    tags: ['Festival', 'Courtyard', 'Celebration'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Blue Plastic Cleaning Bucket',
        description: 'Left overturned beside the courtyard fountain.',
        tag: 'Physical',
        inspectedDetail: 'Filled with detergent water from the 2nd floor utility sink.'
      },
      {
        id: 'ev-2',
        name: 'Courtyard CCTV Camera 1',
        description: 'Footage obscured by a paper flyer taped over the lens at 10:10 PM.',
        tag: 'Access',
        inspectedDetail: 'Tape used was yellow masking tape from the clubhouse art set.'
      },
      {
        id: 'ev-3',
        name: 'Damp Footprint Path',
        description: 'Soapy footprint path leading up the clubhouse stairwell.',
        tag: 'Trace',
        inspectedDetail: 'Footprint size 8 with distinctive clover heel emblem.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the terrace garden setting up Diwali string lights from 10:00 PM to 10:45 PM.',
      policeVerifiedClue: 'The terrace master power switch was turned off at the main breaker until 11:00 PM, meaning no terrace lights were on.',
      informerSecretClue: 'The second roll of yellow masking tape was stuffed into the courtyard garden hose reel.',
      protectorDefenseClue: 'The society secretary was judging the lamp decoration contest in the clubhouse ground hall with ten residents.',
      citizenClues: [
        'The rangoli judging was scheduled for 10:30 PM sharp.',
        'The water tap in the 2nd floor utility room was heard running at 10:12 PM.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you on the terrace setting up lights around 10:15 PM?', category: 'timeline' },
      { id: 'q-2', text: 'Who used the 2nd floor utility sink detergent bucket?', category: 'evidence' },
      { id: 'q-3', text: 'Did anyone see who taped over the courtyard CCTV camera?', category: 'alibi' },
      { id: 'q-4', text: 'What footwear were you wearing on the clubhouse stairs?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was in the main hall watching the lamp contest with the secretary.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was on the terrace connecting fairy lights throughout the 10:00 PM window.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'The terrace circuit breaker was shut off at the meter board until 11:00 PM.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'Yellow masking tape identical to the camera patch was stashed by the hose reel.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The courtyard rangoli was in pristine condition at 10:05 PM.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The fairy lights might have been tested with solar battery packs.' },
      { id: 'doubt-2', text: 'Anyone could have brought soapy water from their own apartment.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to test electrical string lights on the terrace fails because the entire circuit breaker was switched off.'
      }
    ],
    correctReasoning: 'The Chor claimed to be installing fairy lights on the terrace, but electrical records show the terrace breaker was completely shut off until 11:00 PM.'
  },
  {
    id: 'case-11-vip-exhibition-badge',
    title: 'The Snatched VIP Exhibition Badge',
    intro: 'A gold-embossed VIP all-access pass for the International Art Expo vanished from the registration desk safe.',
    location: 'Modern Art Pavilion Gallery',
    difficulty: 'Medium',
    tags: ['Gallery', 'Art', 'Exhibition'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Registration Safe Combination Dial',
        description: 'The small counter safe was opened without forced damage.',
        tag: 'Physical',
        inspectedDetail: 'Combination was written on the underside of the mousepad.'
      },
      {
        id: 'ev-2',
        name: 'Lanyard Clip Ribbon',
        description: 'Snip of gold woven fabric caught in the cloakroom turnstile.',
        tag: 'Trace',
        inspectedDetail: 'Matches official VIP Gold Pass lanyard ribbon.'
      },
      {
        id: 'ev-3',
        name: 'Curator Gallery Logbook',
        description: 'Shows that private gallery tours ran from 3:00 PM to 4:00 PM.',
        tag: 'Document',
        inspectedDetail: 'Tour group size was strictly capped at 8 guests.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the sculpture garden sketching marble statues from 3:15 PM to 3:50 PM.',
      policeVerifiedClue: 'The sculpture garden was evacuated and locked at 3:00 PM for lawn sprinkler maintenance.',
      informerSecretClue: 'The gold pass was hidden inside an empty catalogue cardboard box behind the gallery café.',
      protectorDefenseClue: 'The head curator was conducting the official tour inside Room 4 continuously with witnesses.',
      citizenClues: [
        'The registration desk was unmanned during the 3:30 PM reception toast.',
        'VIP badges allow immediate priority access to the private auction wing.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you in the sculpture garden between 3:15 PM and 3:50 PM?', category: 'timeline' },
      { id: 'q-2', text: 'Did anyone see who opened the registration counter safe?', category: 'evidence' },
      { id: 'q-3', text: 'Who visited the cloakroom turnstiles around 3:40 PM?', category: 'alibi' },
      { id: 'q-4', text: 'Why did the registration desk remain unattended during the toast?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I accompanied the curator on the Room 4 tour from 3:00 PM onward.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was sketching peacefully in the sculpture garden the whole afternoon.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'The sculpture garden gates were locked for active sprinkler operations at 3:00 PM.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A gold ribbon lanyard was glimpsed inside a flat catalogue box by the café.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The registration safe combination was kept under the reception computer.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'One of the garden side gates might have remained unlocked by the gardeners.' },
      { id: 'doubt-2', text: 'Multiple guests carried similar gold ribbons from the gift shop.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to sketch in the sculpture garden is invalid because the garden was closed and sprinklers were active.'
      }
    ],
    correctReasoning: 'The Chor claimed to be sketching in the sculpture garden, but facility logs confirm the garden was evacuated and locked for sprinkler maintenance at 3:00 PM.'
  },
  {
    id: 'case-12-chemistry-lab-crystal',
    title: 'The Hidden Chemistry Lab Crystal',
    intro: 'A lab-grown prismatic copper sulfate specimen disappeared from the faculty research display cabinet.',
    location: 'National Science Academy Lab 3',
    difficulty: 'Hard',
    tags: ['Science', 'Academy', 'Laboratory'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Desiccator Glass Jar Lid',
        description: 'Found unscrewed with the blue crystal gone.',
        tag: 'Physical',
        inspectedDetail: 'Silicone grease seal was wiped away using a laboratory wipe.'
      },
      {
        id: 'ev-2',
        name: 'Fume Hood Airflow Indicator',
        description: 'Alarm tripped in Fume Hood #2 at 1:45 PM.',
        tag: 'Digital',
        inspectedDetail: 'Flow sensor registered an obstruction in the exhaust duct.'
      },
      {
        id: 'ev-3',
        name: 'Lab Coat Laundry Bin',
        description: 'Contains coats used during the morning titration practical.',
        tag: 'Item',
        inspectedDetail: 'Coat #14 has blue copper salt crystallization inside the right pocket.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the spectrophotometer darkroom calibrating optical lenses from 1:30 PM to 2:15 PM.',
      policeVerifiedClue: 'The spectrophotometer lamp error log shows the unit was in standby error state since 11:00 AM.',
      informerSecretClue: 'The crystal was placed inside an empty beaker on the top shelf of the organic solvent cabinet.',
      protectorDefenseClue: 'The lab supervisor was grading exam papers in the glass-walled office with students watching.',
      citizenClues: [
        'The chemical storage room requires keycard authorization after 1:00 PM.',
        'Lab coats must be returned to the laundry bin before leaving the floor.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you calibrating the spectrophotometer during the 1:45 PM alarm?', category: 'timeline' },
      { id: 'q-2', text: 'Who was assigned lab coat #14 during the morning session?', category: 'evidence' },
      { id: 'q-3', text: 'Did you enter the organic solvent cabinet area?', category: 'alibi' },
      { id: 'q-4', text: 'Why did the fume hood exhaust sensor trigger at 1:45 PM?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was discussing exam grading with the supervisor in the central office.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was using the spectrophotometer darkroom continuously from 1:30 PM.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Internal diagnostics show the spectrophotometer was completely disabled by a lamp error.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A brilliant blue crystal was seen sitting inside a glass beaker in the solvent rack.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The desiccator jar seal had fresh grease smears on the rim.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The darkroom user might have been cleaning lenses manually without turning on the lamp.' },
      { id: 'doubt-2', text: 'Blue stains can also come from fountain pen ink on lab coats.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to run spectrophotometer calibration is debunked by the hardware diagnostic error disabling the unit.'
      }
    ],
    correctReasoning: 'The Chor claimed to be performing measurements on the spectrophotometer, but the machine had an unaddressed hardware lamp error and was non-functional.'
  },
  {
    id: 'case-13-swapped-radio-knob',
    title: 'The Swapped Vintage Radio Knob',
    intro: 'An authentic 1930s bakelite tuning knob was stolen from a museum-grade Marconi receiver at the antique market.',
    location: 'Old Bazaar Antique Arcade',
    difficulty: 'Medium',
    tags: ['Antique', 'Bazaar', 'Vintage'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Receiver Tuning Shaft',
        description: 'The solid brass shaft has screwdriver pry marks.',
        tag: 'Physical',
        inspectedDetail: 'Small flathead screwdriver #2 residue found.'
      },
      {
        id: 'ev-2',
        name: 'Market Tea Stall Receipt',
        description: 'Receipt #88 issued for ginger chai at 3:15 PM.',
        tag: 'Document',
        inspectedDetail: 'Paid with exact 20 rupee denomination note.'
      },
      {
        id: 'ev-3',
        name: 'Antique Shop Brass Bell',
        description: 'Chimes whenever someone enters the back collector gallery.',
        tag: 'Sound',
        inspectedDetail: 'Bell chimed at 3:20 PM and again at 3:35 PM.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was at the corner phonograph stall browsing vinyl records from 3:10 PM to 3:45 PM.',
      policeVerifiedClue: 'The phonograph stall owner was packing inventory away for shipping and kept the stall shutter closed from 3:00 PM.',
      informerSecretClue: 'The bakelite knob was wrapped in a velvet jeweler pouch and stashed inside an old gramophone horn.',
      protectorDefenseClue: 'The antique arcade manager was doing cash accounting at the register with the head appraiser from 3:00 PM.',
      citizenClues: [
        'The radio display case glass was sliding easily on its brass track.',
        'Bakelite knobs are extremely rare and coveted by radio collectors.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you browsing at the phonograph stall around 3:25 PM?', category: 'timeline' },
      { id: 'q-2', text: 'Who carried a small flathead jeweler screwdriver today?', category: 'evidence' },
      { id: 'q-3', text: 'Did you hear the back gallery brass bell chime at 3:20 PM?', category: 'alibi' },
      { id: 'q-4', text: 'Where did you go after buying tea at 3:15 PM?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was reviewing appraisal valuations with the arcade manager at the till.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I spent the entire time browsing records at the corner phonograph booth.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'The phonograph booth shutter was locked and shuttered closed from 3:00 PM onward.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A small brown velvet pouch was hidden inside the flared brass gramophone horn.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The radio display case was unlocked when the morning crowd arrived.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The phonograph owner might have allowed someone to browse behind the shutter.' },
      { id: 'doubt-2', text: 'Jeweler screwdrivers are carried by several watchmakers in the arcade.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to browse at the phonograph stall is false because the stall was completely shut down and locked.'
      }
    ],
    correctReasoning: 'The Chor claimed to be browsing records at the phonograph stall, but that specific shop was locked and closed for stock shipping.'
  },
  {
    id: 'case-14-chess-club-knight',
    title: 'The Missing Chess Club Knight Piece',
    intro: 'During the regional tournament final, the handcrafted ebony Knight piece vanished from Board 1 during the intermission.',
    location: 'Grandmaster Chess Guild',
    difficulty: 'Easy',
    tags: ['Chess', 'Tournament', 'Guild'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Board 1 Intermission Clock',
        description: 'Paused at 14 minutes and 22 seconds on White side.',
        tag: 'Timeline',
        inspectedDetail: 'Clock paused officially at 4:30 PM.'
      },
      {
        id: 'ev-2',
        name: 'Ebony Wood Shavings',
        description: 'Small speck of black polished wood found near the coat rack.',
        tag: 'Trace',
        inspectedDetail: 'Piece has felt green base circular impression.'
      },
      {
        id: 'ev-3',
        name: 'Tournament Refreshment Ledger',
        description: 'Logs players who collected mint candies and water bottles.',
        tag: 'Document',
        inspectedDetail: 'Entry #16 signed at 4:35 PM.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the outdoor analysis courtyard reviewing opening moves from 4:25 PM to 4:50 PM.',
      policeVerifiedClue: 'Courtyard weather monitoring station recorded heavy hail and rain, making the open courtyard unusable.',
      informerSecretClue: 'The ebony knight piece was slipped inside an empty insulated thermos in the spectator locker #8.',
      protectorDefenseClue: 'The chief arbiter was entering scores into the tournament computer in full view of the audience from 4:25 PM.',
      citizenClues: [
        'The intermission lasted 25 minutes before Round 4 resumed.',
        'Board 1 was cordoned off with velvet ropes.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you in the outdoor courtyard during the intermission hail storm?', category: 'timeline' },
      { id: 'q-2', text: 'Did anyone see who approached Board 1 after the clocks paused?', category: 'evidence' },
      { id: 'q-3', text: 'Who accessed spectator locker #8 during the break?', category: 'alibi' },
      { id: 'q-4', text: 'Why was the ebony knight removed right before the endgame?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was watching the chief arbiter enter official scores on the projector screen.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was sitting in the outdoor analysis garden going over chess notation.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Severe hail and torrential rain kept the outdoor courtyard completely vacant and flooded.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A metal thermos inside locker 8 rattled with the weight of a wooden chess piece.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'Board 1 clock paused exactly when the arbiter blew the intermission whistle.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The courtyard has a small covered gazebo where someone could have sat.' },
      { id: 'doubt-2', text: 'Several players carry insulated thermoses to long matches.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to sit in the open outdoor analysis garden is impossible during an active hailstorm and torrential flooding.'
      }
    ],
    correctReasoning: 'The Chor claimed to be analyzing games in the outdoor courtyard, but heavy hail and rain flooded the open garden, making it impossible.'
  },
  {
    id: 'case-15-altered-marathon-map',
    title: 'The Altered Marathon Route Map',
    intro: 'The official milestone direction arrows for the city 10K charity run were flipped, sending runners towards the scenic lake detour.',
    location: 'Riverside Marathon Waypoint 3',
    difficulty: 'Medium',
    tags: ['Marathon', 'Sports', 'Outdoor'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Reversed Wooden Arrow Signpost',
        description: 'Direction arrow #3 was unscrewed and turned 180 degrees.',
        tag: 'Physical',
        inspectedDetail: 'Wingnut fastener shows fresh pliers grip marks.'
      },
      {
        id: 'ev-2',
        name: 'Volunteer Orange Vest Log',
        description: 'Waypoints staffed by assigned course marshals from 6:30 AM.',
        tag: 'Access',
        inspectedDetail: 'Waypoint 3 radio check-in skipped at 6:45 AM.'
      },
      {
        id: 'ev-3',
        name: 'Energy Drink Spill on Gravel',
        description: 'Electrolyte drink puddle found right beneath the signpost.',
        tag: 'Trace',
        inspectedDetail: 'Flavor is blue raspberry, distributed only at Station A.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was at the main start line inflating promotional balloon arches from 6:30 AM to 7:15 AM.',
      policeVerifiedClue: 'Start line event photos show balloon arches were fully inflated and tied by the stage crew at 6:00 AM.',
      informerSecretClue: 'The original route master template map was stashed behind the water cooler at Hydration Station 2.',
      protectorDefenseClue: 'The course race director was leading runner warmups on the loudspeaker from 6:30 AM to 7:00 AM.',
      citizenClues: [
        'The lead runners reached Waypoint 3 at 7:05 AM.',
        'Station A blue raspberry drinks were opened at 6:20 AM.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you inflating balloons at the start line around 6:45 AM?', category: 'timeline' },
      { id: 'q-2', text: 'Who carried multi-tool pliers on the course this morning?', category: 'evidence' },
      { id: 'q-3', text: 'Why was the radio check-in for Waypoint 3 missed at 6:45 AM?', category: 'alibi' },
      { id: 'q-4', text: 'Did anyone see someone holding a blue raspberry drink by the signpost?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was in the main crowd doing warmups with the race director on the stage.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was busy at the start line pumping air into the balloon arches until 7:15 AM.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Event photo timestamps confirm the balloon arches were finished and tied at 6:00 AM.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'The master route overlay map was hidden in a plastic sleeve near Station 2.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The signpost wingnuts were freshly tightened with steel pliers.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'Extra decorative mini-balloons might have been blown up closer to start time.' },
      { id: 'doubt-2', text: 'Course marshals regularly carry pliers for banner zip-ties.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to inflate balloon arches between 6:30 AM and 7:15 AM is disproved by photos showing them fully completed at 6:00 AM.'
      }
    ],
    correctReasoning: 'The Chor claimed to be inflating balloons at the start line, but official event photographs show all arches were already fully installed before 6:00 AM.'
  },
  {
    id: 'case-16-clock-tower-pendulum',
    title: 'The Vanished Heritage Clock Pendulum',
    intro: 'The heavy brass balance pendulum of the historic town hall clock was unhooked right before the noon chiming ceremony.',
    location: 'Old Town Heritage Clock Tower',
    difficulty: 'Hard',
    tags: ['Clock', 'Heritage', 'Town Hall'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Clock Escapement Suspension Spring',
        description: 'The suspension hook was unlatched cleanly without damage.',
        tag: 'Physical',
        inspectedDetail: 'Spring coated in synthetic clock oil #5.'
      },
      {
        id: 'ev-2',
        name: 'Spiral Staircase Key Register',
        description: 'Tower stairs key checked out between 11:00 AM and 11:45 AM.',
        tag: 'Access',
        inspectedDetail: 'Key signed by visitor with registered ID ending in #409.'
      },
      {
        id: 'ev-3',
        name: 'Tower Burlap Sack',
        description: 'Found left on the gear floor with yellow twine.',
        tag: 'Trace',
        inspectedDetail: 'Contains metal polish residue and cloth fibers.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the ground floor archive basement sorting historical maps from 11:15 AM to 11:55 AM.',
      policeVerifiedClue: 'The archive basement is protected by motion sensors which registered zero movement throughout the morning.',
      informerSecretClue: 'The heavy pendulum was wrapped in heavy burlap and placed in the belfry bell-rope chamber.',
      protectorDefenseClue: 'The municipal town clerk was conducting a public budget briefing in the council chamber with thirty citizens.',
      citizenClues: [
        'The clock mechanism requires ascending 80 spiral stone stairs.',
        'The noon chimes ring automatically when the escapement wheel releases.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you in the archive basement between 11:15 AM and 11:55 AM?', category: 'timeline' },
      { id: 'q-2', text: 'Who carried the yellow twine burlap bag up the tower?', category: 'evidence' },
      { id: 'q-3', text: 'Did you sign the staircase key register at 11:00 AM?', category: 'alibi' },
      { id: 'q-4', text: 'How could someone unhook the heavy pendulum without stopping the escapement?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was inside the council chamber listening to the town clerk budget report.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was in the basement archives organizing map cabinets the entire hour.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Security motion sensors in the map archives detected no human movement all morning.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'The brass pendulum was located hidden behind the belfry bell ropes.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The clock tower spiral stairs were dusty with recent footprints.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The motion sensors might have a blind corner between the tallest map shelves.' },
      { id: 'doubt-2', text: 'Burlap sacks are commonly kept for storing heavy maintenance weights.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to organize map cabinets in the basement is contradicted by motion sensor telemetry logging zero activity.'
      }
    ],
    correctReasoning: 'The Chor claimed to be working inside the basement archives, but infrared motion sensors proved the archive remained completely undisturbed.'
  },
  {
    id: 'case-17-rooftop-solar-sensor',
    title: 'The Displaced Rooftop Solar Sensor',
    intro: 'The automated tracking sensor on the green roof solar array was tilted toward the shade, halving energy output.',
    location: 'Eco Towers Rooftop Garden',
    difficulty: 'Easy',
    tags: ['Rooftop', 'Solar', 'Eco'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Sensor Mounting Bracket',
        description: 'The 10mm pivot bolt was loosened with an adjustable wrench.',
        tag: 'Physical',
        inspectedDetail: 'Bolt threads have blue threadlocker residue scraped off.'
      },
      {
        id: 'ev-2',
        name: 'Solar Inverter Power Curve',
        description: 'Shows sudden voltage drop at 1:15 PM.',
        tag: 'Digital',
        inspectedDetail: 'Array angle deviated 45 degrees north of optimal sun angle.'
      },
      {
        id: 'ev-3',
        name: 'Garden Soil Footprint',
        description: 'Muddy track across the sedum green roof walkway.',
        tag: 'Trace',
        inspectedDetail: 'Shoe print matches gardening gumboots with wave tread.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the 10th-floor fitness gym on the stationary bike from 1:00 PM to 1:45 PM.',
      policeVerifiedClue: 'Fitness gym biometric turnstile has no record of the suspect checking in after 11:30 AM.',
      informerSecretClue: 'The missing 10mm socket wrench was hidden under the water pump rain cover near the garden shed.',
      protectorDefenseClue: 'The building sustainability officer was giving an eco-tour in the lobby atrium to visiting delegates.',
      citizenClues: [
        'The rooftop access door is unlocked during daytime gardening hours.',
        'The inverter alarm sounded at the security desk at 1:20 PM.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you inside the 10th-floor gym between 1:00 PM and 1:45 PM?', category: 'timeline' },
      { id: 'q-2', text: 'Who used the 10mm wrench from the maintenance kit?', category: 'evidence' },
      { id: 'q-3', text: 'Did anyone see someone wearing gumboots on the roof walkway?', category: 'alibi' },
      { id: 'q-4', text: 'Why was the solar tracker shifted right at peak sunlight hours?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was attending the sustainability eco-tour in the main lobby atrium.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was exercising in the 10th-floor gym on the stationary bike the whole time.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'The gym turnstile biometrics show zero entry scans between noon and 2:00 PM.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'The wrench used to adjust the bracket was found stashed by the pump cover.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The green roof sedum path was wet from midday misting sprays.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'Someone could have entered the gym without scanning if the gate was propped open.' },
      { id: 'doubt-2', text: 'High winds might have caused the solar panel mount to slip on its own.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to exercise in the gym is disproved by the biometric access gate records showing no entry.'
      }
    ],
    correctReasoning: 'The Chor claimed to be working out in the gym during the solar shift, but biometric turnstile records prove they never entered the gym.'
  },
  {
    id: 'case-18-greenhouse-seed-jar',
    title: 'The Swapped Botanical Greenhouse Seed Jar',
    intro: 'A jar of rare heirloom Himalayan blue poppy seeds was replaced with ordinary birdseed in the conservatory vault.',
    location: 'Imperial Botanical Conservatory',
    difficulty: 'Medium',
    tags: ['Botanical', 'Greenhouse', 'Nature'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Apothecary Glass Seed Jar',
        description: 'The glass jar was labelled "Meconopsis betonicifolia" but filled with millet.',
        tag: 'Item',
        inspectedDetail: 'Wax seal was sliced neatly with a florist scalpel.'
      },
      {
        id: 'ev-2',
        name: 'Greenhouse Humidity Chart',
        description: 'Tropical House 2 humidity spiked at 10:40 AM when the mist valves opened.',
        tag: 'Timeline',
        inspectedDetail: 'Mist cycle runs automatically for 15 minutes.'
      },
      {
        id: 'ev-3',
        name: 'Fallen Orchid Pollen',
        description: 'Bright orange pollen powder on the seed vault handle.',
        tag: 'Trace',
        inspectedDetail: 'Pollen from Vanda coerulea orchid blooming only in Section 3.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the succulent desert wing watering cactus beds from 10:30 AM to 11:15 AM.',
      policeVerifiedClue: 'Desert wing watering logs show drip irrigation was automated and no manual hoses were enabled.',
      informerSecretClue: 'The genuine blue poppy seeds were sealed in a test tube inside a bamboo planter in the fern grotto.',
      protectorDefenseClue: 'The head botanist was giving a lecture on carnivorous plants to school students in the amphitheater.',
      citizenClues: [
        'The seed vault key is kept on the florist tool rack.',
        'Orange orchid pollen rubs off easily on clothing.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you in the desert succulent wing around 10:40 AM?', category: 'timeline' },
      { id: 'q-2', text: 'Who brushed against the blooming orange orchids in Section 3?', category: 'evidence' },
      { id: 'q-3', text: 'Did anyone see the seed vault wax seal being sliced?', category: 'alibi' },
      { id: 'q-4', text: 'Why swap the rare seeds with ordinary birdseed?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was seated in the amphitheater listening to the botanist lecture.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I spent the morning hand-watering cactus beds in the desert pavilion.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'Automated irrigation records prove manual watering in the desert wing was shut off.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'A glass test tube with blue poppy seeds was concealed in the fern bamboo pot.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The tropical greenhouse mist was very thick at 10:40 AM.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'Someone could have used a handheld spray bottle instead of the main hose.' },
      { id: 'doubt-2', text: 'Pollen could have drifted through the greenhouse ventilation fans.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to hand-water the desert wing fails because water lines were locked out for automated cycles.'
      }
    ],
    correctReasoning: 'The Chor claimed they spent the morning hand-watering the desert pavilion, but facility irrigation telemetry confirms all manual watering lines were deactivated.'
  },
  {
    id: 'case-19-film-clapperboard',
    title: 'The Missing Film Festival Clapperboard',
    intro: 'The autographed clapperboard from the cinema jubilee opening ceremony vanished from the red carpet display easel.',
    location: 'Silver Screen Cinema Hall',
    difficulty: 'Medium',
    tags: ['Cinema', 'Film', 'Festival'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Empty Wooden Display Easel',
        description: 'The velvet easel ribbon was untied without knocking the stand.',
        tag: 'Physical',
        inspectedDetail: 'Chalk dust from the clapperboard slate left on the velvet.'
      },
      {
        id: 'ev-2',
        name: 'Projection Booth Schedule',
        description: 'Screening #1 teaser trailer rolled at 7:10 PM.',
        tag: 'Timeline',
        inspectedDetail: 'House lights dimmed exactly at 7:08 PM.'
      },
      {
        id: 'ev-3',
        name: 'Popcorn Butter Stained Glove',
        description: 'Found discarded in the lobby poster corridor.',
        tag: 'Trace',
        inspectedDetail: 'White cotton usher glove with red piping.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was inside the projection room rewinding the 35mm film reel from 7:00 PM to 7:30 PM.',
      policeVerifiedClue: 'The projectionist was running digital DCP files exclusively; all 35mm equipment was in storage.',
      informerSecretClue: 'The autographed clapperboard was slid behind the vintage standee of the silent movie star in Corridor C.',
      protectorDefenseClue: 'The festival jury president was on the red carpet giving live television interviews throughout 7:00 PM to 7:30 PM.',
      citizenClues: [
        'The house lights dimmed for four minutes before the opening premiere.',
        'Usher gloves are distributed from the ticket booth drawer.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you in the projection booth rewinding film around 7:10 PM?', category: 'timeline' },
      { id: 'q-2', text: 'Who was wearing white cotton usher gloves with red trim?', category: 'evidence' },
      { id: 'q-3', text: 'Did anyone see the clapperboard being removed when lights dimmed?', category: 'alibi' },
      { id: 'q-4', text: 'Why did the red carpet easel ribbon come untied?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was standing by the TV cameras watching the jury president interview.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I spent the entire time in the projection room rewinding 35mm film reels.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'The cinema runs 100% digital DCP files and has no 35mm physical film reels in service.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'The clapperboard was wedged behind the silent film cardboard cutout in Corridor C.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The lobby went very dark when the teaser began at 7:08 PM.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'Vintage 35mm reels might have been inspected as a festival exhibition piece.' },
      { id: 'doubt-2', text: 'All lobby staff wear identical white usher gloves.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to rewind 35mm film reels is completely fabricated because the theater operates purely on digital DCP format.'
      }
    ],
    correctReasoning: 'The Chor claimed they were rewinding 35mm film reels in the projection booth, but the cinema runs exclusively digital projection with no 35mm film present.'
  },
  {
    id: 'case-20-secret-masala-blend',
    title: 'The Stolen Secret Masala Blend',
    intro: 'The generational spice formula brass canister vanished from the family mill blending room before the grand harvest dispatch.',
    location: 'Heritage Spice Mill & Roasting House',
    difficulty: 'Hard',
    tags: ['Spice', 'Heritage', 'Culinary'],
    contentSafetyStatus: 'APPROVED',
    enabled: true,
    publicEvidence: [
      {
        id: 'ev-1',
        name: 'Brass Spice Vault Latch',
        description: 'The antique tumbler lock was opened using the master brass key.',
        tag: 'Physical',
        inspectedDetail: 'Key kept in the master blender wooden desk drawer.'
      },
      {
        id: 'ev-2',
        name: 'Roasting Drum Thermometer Chart',
        description: 'Batch #5 cinnamon roast completed at 2:30 PM.',
        tag: 'Timeline',
        inspectedDetail: 'Exhaust fan speed increased at 2:35 PM to vent smoke.'
      },
      {
        id: 'ev-3',
        name: 'Spilled Saffron and Star Anise Pods',
        description: 'Traces of golden saffron pollen leading to the burlap sack storage.',
        tag: 'Trace',
        inspectedDetail: 'Sack marked with red export stencil #77.'
      }
    ],
    roleClues: {
      chorCoverClue: 'I was in the cold spice grinding cellar operating the stone chakki from 2:15 PM to 3:00 PM.',
      policeVerifiedClue: 'The stone chakki motor was under electrical maintenance and had its power cables unplugged all afternoon.',
      informerSecretClue: 'The brass canister was hidden inside a sack of dried whole nutmeg in the rear dry storage bin.',
      protectorDefenseClue: 'The head master blender was tasting sample teas with the quality audit committee in the front tasting parlor.',
      citizenClues: [
        'The aroma of roasted cinnamon was strong throughout the mill at 2:30 PM.',
        'The master desk key was in place at the start of the afternoon shift.'
      ]
    },
    predefinedQuestions: [
      { id: 'q-1', text: 'Were you in the grinding cellar using the stone chakki around 2:30 PM?', category: 'timeline' },
      { id: 'q-2', text: 'Who accessed the master blender desk drawer key?', category: 'evidence' },
      { id: 'q-3', text: 'Did anyone see who tracked saffron dust toward the export sacks?', category: 'alibi' },
      { id: 'q-4', text: 'Why did the roasting drum exhaust fan speed spike at 2:35 PM?', category: 'motive' }
    ],
    allowedStatements: [
      { id: 'stmt-1', text: 'I was tasting tea samples in the parlor with the master blender and auditors.', roleTypeHint: 'CITIZEN' },
      { id: 'stmt-2', text: 'I was grinding whole spices on the stone chakki in the cellar the entire time.', roleTypeHint: 'CHOR' },
      { id: 'stmt-3', text: 'The stone chakki motor had its power cord disconnected for scheduled maintenance.', roleTypeHint: 'POLICE' },
      { id: 'stmt-4', text: 'The brass masala canister was stuffed into a heavy nutmeg burlap bag.', roleTypeHint: 'INFORMER' },
      { id: 'stmt-5', text: 'The cinnamon roasting batch finished right at 2:30 PM.', roleTypeHint: 'CITIZEN' }
    ],
    plantDoubtOptions: [
      { id: 'doubt-1', text: 'The stone chakki might have been turned manually by hand without the electric motor.' },
      { id: 'doubt-2', text: 'Saffron dust is present on all packaging workers in the roasting hall.' }
    ],
    contradictionMap: [
      {
        statementId: 'stmt-2',
        counterStatementId: 'stmt-3',
        explanation: 'Claiming to grind spices on the stone chakki is impossible because the unit was unplugged and decommissioned for maintenance.'
      }
    ],
    correctReasoning: 'The Chor claimed to be running the stone chakki grinder in the cellar, but maintenance logs prove the grinder was completely unplugged for electrical servicing.'
  }
];
