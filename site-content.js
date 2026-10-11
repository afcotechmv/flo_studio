/* =========================================================
   FLO Studio — site-content.js
   The content layer for the public website.

   - FLO.DEFAULTS mirrors what the public page showed before the
     admin Website editor existed, so an empty database changes
     nothing visually.
   - Saved settings (Supabase key "website") are merged over the
     defaults and applied to the page: section order, visibility
     and the hero text/image.
   - The last good copy is cached in the browser so the page does
     not flash its defaults on repeat visits, and so the site still
     looks right if the database cannot be reached.

   Covers: page order, section visibility, hero, classes, FLO Kids,
   our story, the team, workshops & events and the footer.
   ========================================================= */
(function () {
  'use strict';

  var FLO = (window.FLO = window.FLO || {});
  var CACHE_KEY = 'flo_website_cache_v1';

  /* ── Reorderable sections ───────────────────────────── */
  // els: elements that belong to the section and move together.
  // nav: navbar link (if any) that points at the section.
  FLO.SECTIONS = [
    { key: 'hero',        label: 'Hero & event banner', els: ['.hero', '.event-banner'] },
    { key: 'classes',     label: 'Classes',             els: ['#classes'],     nav: '#classes' },
    { key: 'kids',        label: 'FLO Kids',            els: ['#kids'] },
    { key: 'about',       label: 'Our Story',           els: ['#about'],       nav: '#about' },
    { key: 'instructors', label: 'The Team',            els: ['#instructors'] },
    { key: 'workshops',   label: 'Workshops & Events',  els: ['#workshops'] }
  ];

  /* ── Defaults (identical to the original hard-coded page) ── */
  FLO.DEFAULTS = {
    version: 1,
    order: ['hero', 'classes', 'kids', 'about', 'instructors', 'workshops'],
    hidden: {},
    hero: {
      tagline: 'Feel \u00B7 Look \u00B7 Own \u00B7 Hulhumal\u00E9, Maldives',
      titleLines: ['Feel good.', 'Look strong.', 'Own your journey.'],
      subtitle: 'A women-only studio for movement, strength,\nand mental wellbeing.',
      buttonLabel: 'View Classes',
      buttonLink: '#classes',
      backgroundImage: '',
      imageFade: 0.55
    },
    classes: {
      "groupsOn": false,
      "groups": [],
      "header": {
        "label": "What we offer",
        "title": "Find your flow.",
        "sub": "Nine ways to move, breathe, and grow — at your own pace."
      },
      "cards": [
        {
          "id": "class-flow",
          "classId": "flow",
          "icon": "images/class-icons/flow.png",
          "name": "Flow",
          "type": "Vinyasa Yoga",
          "desc": "Movement, breath, flexibility, and balance. A continuous flow that connects body and mind.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Mats provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Sun · 6:00 AM",
              "status": "available"
            },
            {
              "text": "Mon · 7:00 AM",
              "status": "available"
            },
            {
              "text": "Wed · 5:30 PM",
              "status": "available"
            },
            {
              "text": "Thu · 6:30 PM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-pulse",
          "classId": "pulse",
          "icon": "images/class-icons/pulse.png",
          "name": "Pulse",
          "type": "Barre",
          "desc": "Ballet and yoga-inspired movements to tone, strengthen, and improve posture.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Equipment provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Sun · 8:00 AM",
              "status": "available"
            },
            {
              "text": "Tue · 6:00 PM",
              "status": "full"
            },
            {
              "text": "Thu · 8:00 AM",
              "status": "full"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": true,
          "hidden": false
        },
        {
          "id": "class-soar",
          "classId": "soar",
          "icon": "images/class-icons/soar.png",
          "name": "Soar",
          "type": "Aerial Hammock",
          "desc": "Deep stretching, strength, and decompression — suspended in the air with confidence.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "Beginners welcome",
            "Hammock provided"
          ],
          "slotsLabel": "No slots available",
          "slots": [
            {
              "text": "Sun · 9:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Tue · 5:00 PM · Full",
              "status": "full"
            },
            {
              "text": "Thu · 9:00 AM · Full",
              "status": "full"
            }
          ],
          "buttonLabel": "Join Waitlist",
          "buttonLink": "#",
          "waitlist": true,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-sculpt",
          "classId": "sculpt",
          "icon": "images/class-icons/sculpt.png",
          "name": "Sculpt",
          "type": "Mat Pilates",
          "desc": "Correct posture, strengthen the core, and improve body alignment on the mat.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Mats provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Mon · 9:00 AM",
              "status": "available"
            },
            {
              "text": "Wed · 7:00 AM",
              "status": "full"
            },
            {
              "text": "Fri · 6:00 PM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-reform",
          "classId": "reform",
          "icon": "images/class-icons/reform.png",
          "name": "Reform",
          "type": "Reformer Pilates",
          "desc": "Build strength, control, and alignment using a reformer bed.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Reformer bed included"
          ],
          "slotsLabel": "No slots available",
          "slots": [
            {
              "text": "Mon · 6:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Wed · 6:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Fri · 7:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Sun · 5:30 PM · Full",
              "status": "full"
            }
          ],
          "buttonLabel": "Join Waitlist",
          "buttonLink": "#",
          "waitlist": true,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-reboot",
          "classId": "reboot",
          "icon": "images/class-icons/reboot.png",
          "name": "ReBoot",
          "type": "Indoor Bootcamp",
          "desc": "High-intensity workout targeted for weight loss and stamina. Push your limits.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "Intermediate level",
            "Equipment provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Tue · 6:00 AM",
              "status": "available"
            },
            {
              "text": "Thu · 6:00 AM",
              "status": "available"
            },
            {
              "text": "Sat · 7:00 AM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": true,
          "hidden": false
        },
        {
          "id": "class-transform",
          "classId": "transform",
          "icon": "images/class-icons/transform.png",
          "name": "Transform",
          "type": "Cadillac Pilates",
          "desc": "Strength, resistance, posture correction, and alignment on a reformer with tower.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "Intermediate level",
            "Cadillac bed included"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Tue · 9:00 AM",
              "status": "full"
            },
            {
              "text": "Thu · 5:30 PM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-connect",
          "classId": "connect",
          "icon": "images/class-icons/connect.png",
          "name": "Connect",
          "type": "Partner Stretch",
          "desc": "Thai yoga bodywork and partner yoga for deep tissue stretch, flexibility, and relaxation.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "Bring a partner",
            "Props provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Wed · 6:00 PM",
              "status": "available"
            },
            {
              "text": "Fri · 5:00 PM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "class-reset",
          "classId": "reset",
          "icon": "images/class-icons/reset.png",
          "name": "Reset",
          "type": "Meditation & Breathwork",
          "desc": "Calm and relax the mind and body through meditation and breathing practices.",
          "price": "MVR 1,000",
          "meta": [
            "50 min session",
            "All levels welcome",
            "Mats provided"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Sun · 7:00 AM",
              "status": "available"
            },
            {
              "text": "Mon · 8:00 PM",
              "status": "available"
            },
            {
              "text": "Wed · 8:00 PM",
              "status": "available"
            },
            {
              "text": "Fri · 8:00 AM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        }
      ]
    },
    kids: {
      "header": {
        "label": "For little ones",
        "title": "FLO Kids",
        "sub": "Introducing girls aged 5–12 to movement, confidence,\nand the joy of being in their body."
      },
      "cards": [
        {
          "id": "kids-fly",
          "programId": "kids-aerial-only",
          "icon": "images/class-icons/fly.png",
          "name": "Fly",
          "type": "Aerial for Girls",
          "desc": "A fun, safe introduction to aerial movement using hammocks. Builds strength, confidence, and coordination in a playful environment.",
          "price": "MVR 1,000",
          "meta": [
            "Ages 5–12",
            "Hammock provided",
            "Beginners welcome"
          ],
          "slotsLabel": "Available slots",
          "slots": [
            {
              "text": "Sat · 9:00 AM",
              "status": "available"
            },
            {
              "text": "Sun · 10:00 AM",
              "status": "available"
            }
          ],
          "buttonLabel": "Join Class",
          "buttonLink": "#",
          "waitlist": false,
          "highlight": false,
          "hidden": false
        },
        {
          "id": "kids-fusion",
          "programId": "kids-fusion",
          "icon": "images/class-icons/fusion.png",
          "name": "Fusion",
          "type": "Ballet & Aerial",
          "desc": "A blend of classical ballet and aerial movement designed to build grace, posture, flexibility, and fearlessness in young girls.",
          "price": "MVR 1,000",
          "meta": [
            "Ages 5–12",
            "Equipment provided",
            "All levels"
          ],
          "slotsLabel": "No slots available",
          "slots": [
            {
              "text": "Sat · 11:00 AM · Full",
              "status": "full"
            },
            {
              "text": "Sun · 12:00 PM · Full",
              "status": "full"
            }
          ],
          "buttonLabel": "Join Waitlist",
          "buttonLink": "#",
          "waitlist": true,
          "highlight": false,
          "hidden": false
        }
      ]
    },
    story: {
      "label": "Our story",
      "titleLines": [
        "Built for women.",
        "By women."
      ],
      "paragraphs": [
        "FLO was born from a simple belief — that every woman deserves a space that truly understands her body, her rhythm, and her journey. No competition. No judgment. Just movement, breath, and growth at your own pace.",
        "Whether you're here to build strength, find calm, or simply carve out an hour that's entirely yours — FLO is that place."
      ],
      "buttonLabel": "Meet the Team",
      "buttonLink": "#instructors",
      "pillars": [
        {
          "word": "Feel",
          "desc": "Your mental wellbeing comes first. Every class is designed to leave you calmer, clearer, and more connected to yourself."
        },
        {
          "word": "Look",
          "desc": "Move with intention and your body will follow. Build real strength, posture, and energy that shows."
        },
        {
          "word": "Own",
          "desc": "Your journey is yours alone. No races, no comparisons. Just you, learning and growing at your own pace."
        }
      ],
      "stats": [
        {
          "value": "9",
          "label": "Class types",
          "auto": ""
        },
        {
          "value": "100%",
          "label": "Women only",
          "auto": ""
        },
        {
          "value": "",
          "label": "Expert instructors",
          "auto": "team"
        },
        {
          "value": "Hulhumalé",
          "label": "Maldives",
          "auto": ""
        }
      ],
      "closing": ""
    },
    team: {
      "header": {
        "label": "The team",
        "title": "The hands that guide you.",
        "sub": "Every instructor at FLO is chosen not just for their expertise,\nbut for the way they hold a room."
      },
      "cards": [
        {
          "id": "team-maani",
          "photo": "images/profiles/aisha.jpg",
          "name": "Maani",
          "role": "Founder & Owner",
          "bio": "The heart behind FLO. Maani created a space where women can feel safe, strong, inspired, and connected — and she shows up in every class with that same intention.",
          "tags": [
            {
              "text": "Flow",
              "style": ""
            },
            {
              "text": "Pulse",
              "style": ""
            },
            {
              "text": "Soar",
              "style": ""
            },
            {
              "text": "Reform",
              "style": ""
            },
            {
              "text": "Transform",
              "style": ""
            },
            {
              "text": "Connect",
              "style": ""
            },
            {
              "text": "Reset",
              "style": ""
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-amu",
          "photo": "images/profiles/fathun.jpg",
          "name": "Amu",
          "role": "",
          "bio": "Sweet, prepared, and guiding. Amu's classes feel safe, smooth, and well-planned — helping clients feel confident and never insecure.",
          "tags": [
            {
              "text": "Flow",
              "style": ""
            },
            {
              "text": "Sculpt",
              "style": ""
            },
            {
              "text": "Soar",
              "style": ""
            },
            {
              "text": "ReBoot",
              "style": "accent"
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-hafy",
          "photo": "images/profiles/maryam.jpg",
          "name": "Hafy",
          "role": "",
          "bio": "Disciplined and reliable. Hafy inspires early birds to begin their day with purpose and health — her consistency is contagious.",
          "tags": [
            {
              "text": "Flow",
              "style": ""
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-shaba",
          "photo": "images/profiles/aminath.jpg",
          "name": "Shaba",
          "role": "",
          "bio": "Social and friendly, Shaba creates a warm and welcoming space for women who seek connection and belonging. Her classes feel like community.",
          "tags": [
            {
              "text": "Flow",
              "style": ""
            },
            {
              "text": "Connect",
              "style": ""
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-niya",
          "photo": "images/profiles/khadeeja.jpg",
          "name": "Niya",
          "role": "",
          "bio": "Trustworthy and consistent. Niya is loved by kids and loyal clients alike who value her calm, steady guidance in every session.",
          "tags": [
            {
              "text": "Flow",
              "style": ""
            },
            {
              "text": "Soar",
              "style": ""
            },
            {
              "text": "Reform",
              "style": ""
            },
            {
              "text": "Transform",
              "style": ""
            },
            {
              "text": "Fly · Kids",
              "style": "accent"
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-miru",
          "photo": "images/profiles/zainab.jpg",
          "name": "Miru",
          "role": "",
          "bio": "Dynamic and goal-oriented. Miru connects with busy women who want results, strength, and self-growth — and delivers every time.",
          "tags": [
            {
              "text": "Flow",
              "style": ""
            },
            {
              "text": "Soar",
              "style": ""
            },
            {
              "text": "ReBoot",
              "style": "accent"
            },
            {
              "text": "Fly · Kids",
              "style": "accent"
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-shamma",
          "photo": "images/profiles/aisha.jpg",
          "name": "Shamma",
          "role": "",
          "bio": "Caring and attentive, with a nurturing approach that makes every client feel supported. Shamma notices what others miss.",
          "tags": [
            {
              "text": "Reform",
              "style": ""
            },
            {
              "text": "Soar",
              "style": ""
            },
            {
              "text": "Transform",
              "style": ""
            },
            {
              "text": "Fly · Kids",
              "style": "accent"
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-salie",
          "photo": "images/profiles/fathun.jpg",
          "name": "Salie",
          "role": "",
          "bio": "Helpful and guiding, Salie is always ready to assist, encourage, and uplift. She meets every client exactly where they are.",
          "tags": [
            {
              "text": "Reform",
              "style": ""
            },
            {
              "text": "Transform",
              "style": ""
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-shiu",
          "photo": "images/profiles/maryam.jpg",
          "name": "Shiu",
          "role": "",
          "bio": "Sharp and result-oriented. Shiu is focused on progress, precision, and strength — her clients know exactly what they're working toward.",
          "tags": [
            {
              "text": "Reform",
              "style": ""
            },
            {
              "text": "ReBoot",
              "style": "accent"
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-dheena",
          "photo": "images/profiles/aminath.jpg",
          "name": "Dheena",
          "role": "",
          "bio": "Friendly and supportive, Dheena creates comfort, trust, and connection in every class. She makes the studio feel like a second home.",
          "tags": [
            {
              "text": "Reform",
              "style": ""
            },
            {
              "text": "Connect",
              "style": ""
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-meera",
          "photo": "images/profiles/khadeeja.jpg",
          "name": "Meera",
          "role": "",
          "bio": "Reliable, focused, and graceful. Meera motivates women who train with intention and brings nurturing patience and beauty to young ballet students.",
          "tags": [
            {
              "text": "Sculpt",
              "style": ""
            },
            {
              "text": "Reform",
              "style": ""
            },
            {
              "text": "Transform",
              "style": ""
            },
            {
              "text": "Ballet",
              "style": ""
            },
            {
              "text": "Twirl Ballet · Kids",
              "style": "accent"
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        },
        {
          "id": "team-zira",
          "photo": "images/profiles/zainab.jpg",
          "name": "Zira",
          "role": "",
          "bio": "Naturally calming, with a psychology background that helps guide breathing, quiet the mind, and leave every client in a peaceful space.",
          "tags": [
            {
              "text": "Reset",
              "style": ""
            },
            {
              "text": "Breathwork",
              "style": ""
            },
            {
              "text": "Psychology",
              "style": ""
            }
          ],
          "focus": "center",
          "counts": true,
          "hidden": false
        }
      ]
    },
    events: {
      "header": {
        "label": "Beyond the class",
        "title": "Workshops & Events.",
        "sub": "Deeper dives, shared moments, and special gatherings.\nOpen to all women — members and non-members alike."
      },
      "tabLabels": {
        "upcoming": "Coming Up",
        "past": "Past Events"
      },
      "emptyText": "No upcoming events scheduled.",
      "banner": {
        "mode": "auto",
        "badge": "Coming Up",
        "text": "",
        "linkLabel": "Learn more →",
        "link": "#workshops"
      },
      "types": [
        {
          "id": "workshop",
          "label": "Workshop",
          "color": "teal"
        },
        {
          "id": "retreat",
          "label": "Retreat",
          "color": "purple"
        },
        {
          "id": "gathering",
          "label": "Gathering",
          "color": "gold"
        },
        {
          "id": "tea",
          "label": "Tea",
          "color": "tangerine"
        }
      ],
      "upcoming": [
        {
          "id": "event-breathwork-stillness",
          "typeId": "workshop",
          "date": "2025-02-14",
          "time": "16:00",
          "title": "Breathwork & Stillness",
          "desc": "A two-hour deep dive into conscious breathing and meditation with Aisha. Suitable for complete beginners and experienced practitioners alike.",
          "duration": "2 hrs",
          "location": "Studio · Mat room",
          "spots": "8 spots left",
          "price": "MVR 500",
          "buttonLabel": "Register",
          "buttonLink": "#",
          "hidden": false
        },
        {
          "id": "event-aerial-foundations",
          "typeId": "workshop",
          "date": "2025-02-28",
          "time": "09:00",
          "title": "Aerial Foundations",
          "desc": "A half-day introduction to aerial movement for first-timers. Learn the basics of the hammock, breathing, and trust in a safe, women-only space.",
          "duration": "3 hrs",
          "location": "Studio · Aerial room",
          "spots": "4 spots left",
          "price": "MVR 750",
          "buttonLabel": "Register",
          "buttonLink": "#",
          "hidden": false
        },
        {
          "id": "event-island-wellness-retreat",
          "typeId": "retreat",
          "date": "2025-03-08",
          "time": "07:00",
          "title": "Island Wellness Retreat",
          "desc": "A full-day retreat on a nearby island. Morning yoga, breathwork, a shared meal, and an afternoon of rest and reflection. Limited to 10 women.",
          "duration": "Full day",
          "location": "Island location · TBA",
          "spots": "3 spots left",
          "price": "MVR 2,500",
          "buttonLabel": "Register",
          "buttonLink": "#",
          "hidden": false
        },
        {
          "id": "event-women-s-circle",
          "typeId": "gathering",
          "date": "2025-03-15",
          "time": "18:00",
          "title": "Women's Circle",
          "desc": "An open evening of gentle movement, sharing, and connection. No experience needed — just come as you are. Tea and light refreshments provided.",
          "duration": "1.5 hrs",
          "location": "Studio · Main room",
          "spots": "Open",
          "price": "Free",
          "buttonLabel": "Register",
          "buttonLink": "#",
          "hidden": false
        },
        {
          "id": "event-saturday-morning-tea",
          "typeId": "tea",
          "date": "2025-03-22",
          "time": "10:00",
          "title": "Saturday Morning Tea",
          "desc": "A relaxed morning gathering after the 9:00 AM class. Tea, conversation, and community. Drop in, no registration needed.",
          "duration": "1 hr",
          "location": "Studio · Lounge",
          "spots": "Open",
          "price": "Free",
          "buttonLabel": "Register",
          "buttonLink": "#",
          "hidden": false
        }
      ],
      "past": []
    },
    footer: {
      brandName: 'FLO Studio',
      tagline: 'Feel · Look · Own',
      description: 'A women-only movement and wellness studio in Hulhumalé, Maldives. Every class, every session, every breath — held with care.',
      addressHeading: 'Come find us.',
      addressLines: ['2nd Floor, Placeholder Building', 'Hulhumalé, Maldives'],
      mapLabel: 'Open in Maps →',
      mapLink: 'https://maps.google.com',
      contactHeading: 'Get in touch.',
      contacts: [
        { label: 'WhatsApp',  value: '+960 777 1234',      link: 'https://wa.me/9607771234' },
        { label: 'Email',     value: 'hello@flostudio.mv', link: 'mailto:hello@flostudio.mv' },
        { label: 'Instagram', value: '@flostudio.mv',      link: 'https://instagram.com/flostudio.mv' }
      ],
      hoursHeading: 'Studio hours.',
      hours: [
        { days: 'Sun — Thu',    time: '6:00 AM – 9:00 PM' },
        { days: 'Sat',               time: '8:00 AM – 8:00 PM' },
        { days: 'Friday closed',     time: '' }
      ],
      copyright: '© {year} FLO Studio. All rights reserved.',
      legal: [
        { label: 'Privacy Policy',     link: '#' },
        { label: 'Studio Rules',       link: '#' },
        { label: 'Terms & Conditions', link: '#' }
      ]
    }
  };

  /* ── Merge saved settings over the defaults ─────────── */
  function normalizeOrder(stored) {
    var known = FLO.SECTIONS.map(function (s) { return s.key; });
    var out = [];
    (Array.isArray(stored) ? stored : []).forEach(function (k) {
      if (known.indexOf(k) !== -1 && out.indexOf(k) === -1) out.push(k);
    });
    // A section added after a layout was saved goes right after the section
    // that precedes it in the default order (e.g. FLO Kids follows Classes).
    var defaults = FLO.DEFAULTS.order;
    known.forEach(function (k) {
      if (out.indexOf(k) !== -1) return;
      var at = out.length;
      for (var i = defaults.indexOf(k) - 1; i >= 0; i--) {
        var pos = out.indexOf(defaults[i]);
        if (pos !== -1) { at = pos + 1; break; }
      }
      out.splice(at, 0, k);
    });
    return out;
  }

  function clamp01(n, fallback) {
    n = parseFloat(n);
    if (isNaN(n)) return fallback;
    return Math.min(0.95, Math.max(0, n));
  }

  FLO.mergeWebsite = function (stored) {
    var d = FLO.clone(FLO.DEFAULTS);
    if (!stored || typeof stored !== 'object') return d;

    d.order = normalizeOrder(stored.order);

    d.hidden = {};
    if (stored.hidden && typeof stored.hidden === 'object') {
      FLO.SECTIONS.forEach(function (s) { if (stored.hidden[s.key] === true) d.hidden[s.key] = true; });
    }

    if (stored.hero && typeof stored.hero === 'object') {
      var h = stored.hero;
      var dh = d.hero;
      if (typeof h.tagline === 'string') dh.tagline = h.tagline;
      if (Array.isArray(h.titleLines)) {
        var lines = h.titleLines
          .map(function (l) { return String(l == null ? '' : l).trim(); })
          .filter(Boolean)
          .slice(0, 6);
        if (lines.length) dh.titleLines = lines;
      }
      if (typeof h.subtitle === 'string') dh.subtitle = h.subtitle;
      if (typeof h.buttonLabel === 'string') dh.buttonLabel = h.buttonLabel;
      if (typeof h.buttonLink === 'string') dh.buttonLink = h.buttonLink;
      if (typeof h.backgroundImage === 'string') dh.backgroundImage = h.backgroundImage;
      dh.imageFade = clamp01(h.imageFade, dh.imageFade);
    }
    mergeCollection(stored, d, 'classes');
    mergeCollection(stored, d, 'kids');
    mergeStory(stored, d);
    mergeTeam(stored, d);
    mergeEvents(stored, d);
    mergeFooter(stored, d);
    return d;
  };

  /* ── Classes: merge / validate ──────────────────────── */
  function str(v, max, fallback) {
    return typeof v === 'string' ? v.slice(0, max) : fallback;
  }
  function list(v) { return Array.isArray(v) ? v : []; }

  FLO.newId = function (prefix) {
    return (prefix || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  function mergeCard(c) {
    if (!c || typeof c !== 'object') return null;
    var name = str(c.name, 60, '').trim();
    if (!name) return null;
    return {
      id: str(c.id, 40, '') || FLO.newId('c'),
      icon: str(c.icon, 400, ''),
      name: name,
      type: str(c.type, 80, ''),
      desc: str(c.desc, 400, ''),
      price: str(c.price, 40, ''),
      meta: list(c.meta).map(function (m) { return String(m == null ? '' : m).trim().slice(0, 80); })
                        .filter(Boolean).slice(0, 8),
      slotsLabel: str(c.slotsLabel, 60, ''),
      slots: list(c.slots).map(function (s) {
        return { text: String(s && s.text != null ? s.text : '').trim().slice(0, 60),
                 status: s && s.status === 'full' ? 'full' : 'available' };
      }).filter(function (s) { return s.text; }).slice(0, 12),
      buttonLabel: str(c.buttonLabel, 40, ''),
      buttonLink: str(c.buttonLink, 300, '#') || '#',
      waitlist: c.waitlist === true,
      highlight: c.highlight === true,
      hidden: c.hidden === true,
      groupId: str(c.groupId, 40, ''),
      // The studio class this card is tied to (see site-studio.js); '' = a card written by hand.
      classId: str(c.classId, 60, ''),
      programId: str(c.programId, 60, '')
    };
  }

  // Display groups (e.g. Grace, Align, Elevate): named headings that the
  // class cards can be sorted under. A card belongs to at most one group.
  FLO.GROUP_COLORS = [
    { value: 'teal',      label: 'Teal' },
    { value: 'tangerine', label: 'Tangerine' },
    { value: 'coral',     label: 'Coral' }
  ];
  FLO.MAX_GROUPS = 8;

  function mergeGroups(sc, target) {
    if (Array.isArray(sc.groups)) {
      var seen = {};
      target.groups = sc.groups.map(function (g) {
        if (!g || typeof g !== 'object') return null;
        var name = str(g.name, 30, '').trim();
        if (!name) return null;
        var color = FLO.GROUP_COLORS.some(function (o) { return o.value === g.color; }) ? g.color : 'teal';
        return { id: str(g.id, 40, '') || FLO.newId('g'), name: name, desc: str(g.desc, 200, '').trim(),
                 color: color, icon: str(g.icon, 400, '') };
      }).filter(function (g) {
        if (!g || seen[g.id]) return false;
        seen[g.id] = true;
        return true;
      }).slice(0, FLO.MAX_GROUPS);
    }
    target.groupsOn = sc.groupsOn === true;
    // A card pointing at a group that no longer exists becomes ungrouped.
    var ids = {};
    target.groups.forEach(function (g) { ids[g.id] = true; });
    target.cards.forEach(function (c) { if (c.groupId && !ids[c.groupId]) c.groupId = ''; });
  }

  // Classes and FLO Kids share one shape: a heading plus a list of cards.
  function mergeCollection(stored, d, key) {
    var sc = stored[key];
    if (!sc || typeof sc !== 'object') return;
    var target = d[key];
    if (sc.header && typeof sc.header === 'object') {
      target.header.label = str(sc.header.label, 80, target.header.label);
      target.header.title = str(sc.header.title, 120, target.header.title);
      target.header.sub = str(sc.header.sub, 300, target.header.sub);
    }
    if (Array.isArray(sc.cards)) {
      var seen = {};
      target.cards = sc.cards.map(mergeCard).filter(function (c) {
        if (!c || seen[c.id]) return false;
        seen[c.id] = true;
        return true;
      }).slice(0, 24);
    }
    if (key === 'classes') mergeGroups(sc, target);
  }

  /* ── Our Story: merge / validate ────────────────────── */
  function mergeStory(stored, d) {
    var ss = stored.story;
    if (!ss || typeof ss !== 'object') return;
    var t = d.story;
    t.label = str(ss.label, 80, t.label);
    if (Array.isArray(ss.titleLines)) {
      var lines = ss.titleLines.map(function (l) { return String(l == null ? '' : l).trim().slice(0, 80); })
                               .filter(Boolean).slice(0, 4);
      if (lines.length) t.titleLines = lines;
    }
    if (Array.isArray(ss.paragraphs)) {
      t.paragraphs = ss.paragraphs.map(function (x) { return String(x == null ? '' : x).trim().slice(0, 1200); })
                                  .filter(Boolean).slice(0, 8);
    }
    t.buttonLabel = str(ss.buttonLabel, 40, t.buttonLabel);
    t.buttonLink = str(ss.buttonLink, 300, t.buttonLink) || '#';
    if (Array.isArray(ss.pillars)) {
      t.pillars = ss.pillars.map(function (p) {
        return { word: String(p && p.word != null ? p.word : '').trim().slice(0, 30),
                 desc: String(p && p.desc != null ? p.desc : '').trim().slice(0, 400) };
      }).filter(function (p) { return p.word || p.desc; }).slice(0, 6);
    }
    if (Array.isArray(ss.stats)) {
      t.stats = ss.stats.map(function (x) {
        var auto = x && (x.auto === 'classes' || x.auto === 'team') ? x.auto : '';
        return { value: String(x && x.value != null ? x.value : '').trim().slice(0, 30),
                 label: String(x && x.label != null ? x.label : '').trim().slice(0, 40), auto: auto };
      }).filter(function (x) { return x.value || x.label || x.auto; }).slice(0, 6);
    }
    t.closing = str(ss.closing, 200, t.closing);
  }

  /* ── The Team: merge / validate ─────────────────────── */
  function mergeTeamCard(c) {
    if (!c || typeof c !== 'object') return null;
    var name = str(c.name, 60, '').trim();
    if (!name) return null;
    return {
      id: str(c.id, 40, '') || FLO.newId('t'),
      photo: str(c.photo, 400, ''),
      name: name,
      role: str(c.role, 80, ''),
      bio: str(c.bio, 400, ''),
      tags: list(c.tags).map(function (t) {
        return { text: String(t && t.text != null ? t.text : '').trim().slice(0, 40),
                 style: t && t.style === 'accent' ? 'accent' : '' };
      }).filter(function (t) { return t.text; }).slice(0, 10),
      focus: c.focus === 'top' || c.focus === 'bottom' ? c.focus : 'center',
      counts: c.counts !== false,
      hidden: c.hidden === true
    };
  }

  function mergeTeam(stored, d) {
    var st = stored.team;
    if (!st || typeof st !== 'object') return;
    if (st.header && typeof st.header === 'object') {
      d.team.header.label = str(st.header.label, 80, d.team.header.label);
      d.team.header.title = str(st.header.title, 120, d.team.header.title);
      d.team.header.sub = str(st.header.sub, 300, d.team.header.sub);
    }
    if (Array.isArray(st.cards)) {
      var seen = {};
      d.team.cards = st.cards.map(mergeTeamCard).filter(function (c) {
        if (!c || seen[c.id]) return false;
        seen[c.id] = true;
        return true;
      }).slice(0, 30);
    }
  }

  FLO.teamCardHTML = function (c) {
    var esc = FLO.esc;
    var photo = FLO.safeImageUrl(c.photo);
    var pos = c.focus === 'top' ? 'center top' : c.focus === 'bottom' ? 'center bottom' : '';
    var img = photo
      ? '<img src="' + esc(photo) + '" alt="' + esc(c.name) + '" class="instructor-img"' +
        (pos ? ' style="object-position:' + pos + '"' : '') + ' />'
      : '<span class="instructor-img-ph" aria-hidden="true">' + esc((c.name || '?').charAt(0).toUpperCase()) + '</span>';
    var tags = (c.tags || []).map(function (t) {
      return '<span class="tag' + (t.style === 'accent' ? ' tag-accent' : '') + '">' + esc(t.text) + '</span>';
    }).join('');
    return '<div class="instructor-card">' +
      '<div class="instructor-img-wrap">' + img +
        (c.bio ? '<div class="instructor-overlay"><p class="instructor-bio">' + esc(c.bio) + '</p></div>' : '') +
      '</div>' +
      '<div class="instructor-info">' +
        '<h3>' + esc(c.name) + '</h3>' +
        (c.role ? '<p class="class-type">' + esc(c.role) + '</p>' : '') +
        (tags ? '<div class="instructor-tags">' + tags + '</div>' : '') +
      '</div>' +
    '</div>';
  };

  // Automatic figures for the stats row.
  FLO.autoStat = function (kind, w) {
    w = w || FLO.website;
    if (kind === 'classes') {
      return w.classes.cards.filter(function (c) { return !c.hidden; }).length;
    }
    if (kind === 'team') {
      // Visible team cards that are marked "count as an instructor".
      return w.team.cards.filter(function (c) { return !c.hidden && c.counts; }).length;
    }
    return 0;
  };

  FLO.storyHTML = function (st, w) {
    var esc = FLO.esc;
    var text = '<div class="about-text">' +
      (st.label ? '<p class="section-label">' + esc(st.label) + '</p>' : '') +
      (st.titleLines.length
        ? '<h2 class="section-title" style="text-align:left;">' + st.titleLines.map(esc).join('<br>') + '</h2>'
        : '') +
      st.paragraphs.map(function (p) { return '<p class="about-desc">' + esc(p) + '</p>'; }).join('') +
      (st.buttonLabel ? '<a href="' + esc(FLO.safeHref(st.buttonLink)) + '" class="btn">' + esc(st.buttonLabel) + '</a>' : '') +
    '</div>';

    var pillars = '<div class="about-pillars">' +
      st.pillars.map(function (p) {
        return '<div class="pillar">' +
          (p.word ? '<span class="pillar-word">' + esc(p.word) + '</span>' : '') +
          (p.desc ? '<p class="pillar-desc">' + esc(p.desc) + '</p>' : '') +
        '</div>';
      }).join('') +
    '</div>';

    var html = '<div class="about-grid">' + text + pillars + '</div>';
    if (st.closing) html += '<p class="about-closing">' + esc(st.closing) + '</p>';
    if (st.stats.length) {
      var cols = st.stats.length <= 4 ? st.stats.length : 3;
      html += '<div class="about-stats" style="--stat-cols:' + cols + '">' +
        st.stats.map(function (x) {
          var value = x.auto ? String(FLO.autoStat(x.auto, w)) : x.value;
          return '<div class="stat"><span class="stat-number">' + esc(value) + '</span>' +
            '<span class="stat-label">' + esc(x.label) + '</span></div>';
        }).join('') +
      '</div>';
    }
    return html;
  };

  /* ── Workshops & Events ─────────────────────────────── */
  FLO.EVENT_COLORS = ['teal', 'purple', 'gold', 'tangerine', 'blue', 'rose', 'green', 'grey'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  FLO.validDate = function (s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ''))) return false;
    var p = s.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return d.getUTCFullYear() === p[0] && d.getUTCMonth() === p[1] - 1 && d.getUTCDate() === p[2];
  };

  // Today's date in the Maldives (UTC+5), as YYYY-MM-DD, whatever the visitor's own timezone.
  FLO.today = function () {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Indian/Maldives', year: 'numeric', month: '2-digit', day: '2-digit'
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (x) { o[x.type] = x.value; });
      return o.year + '-' + o.month + '-' + o.day;
    } catch (e) {
      var t = new Date(Date.now() + 5 * 3600 * 1000);
      return t.toISOString().slice(0, 10);
    }
  };

  FLO.dateParts = function (iso) {
    var p = iso.split('-').map(Number);
    var wd = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
    return { year: p[0], day: p[2], dayText: (p[2] < 10 ? '0' : '') + p[2], mon: MONTHS[p[1] - 1], weekday: WEEKDAYS[wd] };
  };

  FLO.fmtTime = function (t) {
    var m = /^(\d{2}):(\d{2})$/.exec(String(t || ''));
    if (!m) return '';
    var h = parseInt(m[1], 10);
    return (((h + 11) % 12) + 1) + ':' + m[2] + ' ' + (h >= 12 ? 'PM' : 'AM');
  };

  function cleanTime(t) {
    var m = /^(\d{2}):(\d{2})$/.exec(String(t || ''));
    return m && +m[1] < 24 && +m[2] < 60 ? t : '';
  }

  function mergeEvents(stored, d) {
    var se = stored.events;
    if (!se || typeof se !== 'object') return;
    var t = d.events;
    if (se.header && typeof se.header === 'object') {
      t.header.label = str(se.header.label, 80, t.header.label);
      t.header.title = str(se.header.title, 120, t.header.title);
      t.header.sub = str(se.header.sub, 300, t.header.sub);
    }
    if (se.tabLabels && typeof se.tabLabels === 'object') {
      t.tabLabels.upcoming = str(se.tabLabels.upcoming, 30, t.tabLabels.upcoming) || t.tabLabels.upcoming;
      t.tabLabels.past = str(se.tabLabels.past, 30, t.tabLabels.past) || t.tabLabels.past;
    }
    t.emptyText = str(se.emptyText, 120, t.emptyText);
    if (se.banner && typeof se.banner === 'object') {
      var b = se.banner;
      t.banner.mode = b.mode === 'custom' || b.mode === 'off' ? b.mode : 'auto';
      t.banner.badge = str(b.badge, 30, t.banner.badge);
      t.banner.text = str(b.text, 200, t.banner.text);
      t.banner.linkLabel = str(b.linkLabel, 40, t.banner.linkLabel);
      t.banner.link = str(b.link, 300, t.banner.link) || '#';
    }

    // Event types (keep the defaults if the stored list is unusable)
    if (Array.isArray(se.types)) {
      var tseen = {};
      var types = se.types.map(function (x) {
        if (!x || typeof x !== 'object') return null;
        var id = String(x.id == null ? '' : x.id).replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
        var label = str(x.label, 30, '').trim();
        if (!id || !label || tseen[id]) return null;
        tseen[id] = true;
        return { id: id, label: label, color: FLO.EVENT_COLORS.indexOf(x.color) !== -1 ? x.color : 'teal' };
      }).filter(Boolean).slice(0, 12);
      if (types.length) t.types = types;
    }
    var known = {};
    t.types.forEach(function (x) { known[x.id] = true; });

    if (Array.isArray(se.upcoming)) {
      var useen = {};
      t.upcoming = se.upcoming.map(function (e) {
        if (!e || typeof e !== 'object') return null;
        var title = str(e.title, 120, '').trim();
        if (!title || !FLO.validDate(e.date)) return null;
        var id = str(e.id, 40, '') || FLO.newId('e');
        if (useen[id]) return null;
        useen[id] = true;
        return {
          id: id, typeId: known[e.typeId] ? e.typeId : '', date: e.date, time: cleanTime(e.time), title: title,
          desc: str(e.desc, 600, ''), duration: str(e.duration, 40, ''), location: str(e.location, 80, ''),
          spots: str(e.spots, 40, ''), price: str(e.price, 40, ''), buttonLabel: str(e.buttonLabel, 40, ''),
          buttonLink: str(e.buttonLink, 300, '#') || '#', hidden: e.hidden === true
        };
      }).filter(Boolean).slice(0, 60);
    }

    if (Array.isArray(se.past)) {
      var pseen = {};
      t.past = se.past.map(function (e) {
        if (!e || typeof e !== 'object') return null;
        var title = str(e.title, 120, '').trim();
        if (!title || !FLO.validDate(e.date)) return null;
        var id = str(e.id, 40, '') || FLO.newId('p');
        if (pseen[id]) return null;
        pseen[id] = true;
        return {
          id: id, typeId: known[e.typeId] ? e.typeId : '', date: e.date, title: title,
          text: str(e.text, 4000, ''),
          images: list(e.images).filter(FLO.isGalleryPath).slice(0, 24),
          hidden: e.hidden === true
        };
      }).filter(Boolean).slice(0, 60);
    }
  }

  function typeOf(w, id) {
    return w.events.types.filter(function (x) { return x.id === id; })[0] || null;
  }

  // Upcoming = visible and not yet past, soonest first.
  FLO.upcomingList = function (w) {
    var today = FLO.today();
    return w.events.upcoming.filter(function (e) { return !e.hidden && e.date >= today; })
      .sort(function (a, b) { return (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')); });
  };
  // Past = visible, most recent first.
  FLO.pastList = function (w) {
    return w.events.past.filter(function (e) { return !e.hidden; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });
  };

  function badgeHTML(w, typeId) {
    var t = typeOf(w, typeId);
    return t ? '<span class="workshop-badge badge-c-' + FLO.esc(t.color) + '">' + FLO.esc(t.label) + '</span>' : '';
  }

  FLO.upcomingItemHTML = function (e, w) {
    var esc = FLO.esc, dp = FLO.dateParts(e.date);
    var when = dp.weekday + (e.time ? ' \u00B7 ' + FLO.fmtTime(e.time) : '');
    var meta = '<span>' + esc(when) + '</span>' +
      (e.duration ? '<span>' + esc(e.duration) + '</span>' : '') +
      (e.location ? '<span>' + esc(e.location) + '</span>' : '') +
      (e.spots ? '<span class="spots-left">' + esc(e.spots) + '</span>' : '');
    return '<div class="workshop-item">' +
      '<div class="workshop-left">' + badgeHTML(w, e.typeId) +
        '<div class="workshop-date"><span class="workshop-day">' + dp.dayText + '</span><span class="workshop-month">' + dp.mon + '</span></div>' +
      '</div>' +
      '<div class="workshop-main"><h3>' + esc(e.title) + '</h3>' +
        (e.desc ? '<p class="workshop-desc">' + esc(e.desc) + '</p>' : '') +
        '<div class="workshop-meta">' + meta + '</div></div>' +
      '<div class="workshop-right">' +
        (e.price ? '<p class="workshop-price">' + esc(e.price) + '</p>' : '') +
        (e.buttonLabel ? '<a href="' + esc(FLO.safeHref(e.buttonLink)) + '" class="btn">' + esc(e.buttonLabel) + '</a>' : '') +
      '</div>' +
    '</div>';
  };

  FLO.pastEventHTML = function (e, w) {
    var esc = FLO.esc, dp = FLO.dateParts(e.date);
    var paras = String(e.text || '').split(/\r?\n\s*\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean);
    var imgs = e.images || [];
    var gallery = imgs.length
      ? '<div class="past-gallery">' + imgs.map(function (path, i) {
          return '<button type="button" class="past-thumb" data-pi="' + i + '" aria-label="' +
            esc('Open photo ' + (i + 1) + ' of ' + imgs.length + ': ' + e.title) + '">' +
            '<img src="' + esc(FLO.storageUrl(FLO.thumbPath(path))) + '" alt="' + esc(e.title) + ' \u2013 photo ' + (i + 1) + '" loading="lazy" /></button>';
        }).join('') + '</div>'
      : '';
    return '<article class="past-event" data-peid="' + esc(e.id) + '">' +
      '<div class="past-event-head">' + badgeHTML(w, e.typeId) +
        '<span class="past-event-date">' + dp.day + ' ' + dp.mon + ' ' + dp.year + '</span></div>' +
      '<h3>' + esc(e.title) + '</h3>' +
      (paras.length ? '<div class="past-event-text">' + paras.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>' : '') +
      gallery +
    '</article>';
  };

  FLO.bannerText = function (e) {
    var dp = FLO.dateParts(e.date);
    return e.title + ' \u00B7 ' + dp.weekday + ' ' + dp.day + ' ' + dp.mon + (e.time ? ' \u00B7 ' + FLO.fmtTime(e.time) : '');
  };

  /* ── Photo viewer (lightbox) ────────────────────────── */
  var lb = null;
  function lightbox() {
    if (lb) return lb;
    var el = document.createElement('div');
    el.className = 'flo-lightbox';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Photo viewer');
    el.hidden = true;
    el.innerHTML =
      '<button type="button" class="flo-lb-close" aria-label="Close photo viewer">\u2715</button>' +
      '<button type="button" class="flo-lb-nav flo-lb-prev" aria-label="Previous photo">\u2039</button>' +
      '<figure class="flo-lb-figure"><img class="flo-lb-img" alt="" /><figcaption class="flo-lb-cap"></figcaption></figure>' +
      '<button type="button" class="flo-lb-nav flo-lb-next" aria-label="Next photo">\u203A</button>';
    document.body.appendChild(el);
    lb = { el: el, img: el.querySelector('.flo-lb-img'), cap: el.querySelector('.flo-lb-cap'), urls: [], i: 0, title: '', from: null };
    function show() {
      lb.img.src = lb.urls[lb.i];
      lb.img.alt = lb.title + ' \u2013 photo ' + (lb.i + 1);
      lb.cap.textContent = lb.title + ' \u00B7 ' + (lb.i + 1) + ' / ' + lb.urls.length;
      el.querySelector('.flo-lb-prev').hidden = el.querySelector('.flo-lb-next').hidden = lb.urls.length < 2;
    }
    function step(n) { lb.i = (lb.i + n + lb.urls.length) % lb.urls.length; show(); }
    function close() {
      el.hidden = true;
      document.body.classList.remove('flo-lb-open');
      lb.img.removeAttribute('src');
      if (lb.from && lb.from.focus) lb.from.focus();
    }
    el.addEventListener('click', function (e) {
      if (e.target === el || e.target.closest('.flo-lb-close')) close();
      else if (e.target.closest('.flo-lb-prev')) step(-1);
      else if (e.target.closest('.flo-lb-next')) step(1);
    });
    document.addEventListener('keydown', function (e) {
      if (el.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
    lb.open = function (urls, i, title, from) {
      lb.urls = urls; lb.i = i; lb.title = title; lb.from = from;
      el.hidden = false;
      document.body.classList.add('flo-lb-open');
      show();
      el.querySelector('.flo-lb-close').focus();
    };
    return lb;
  }

  /* ── Apply events to the page ───────────────────────── */
  FLO.eventsTab = 'upcoming';

  function applyBanner(w) {
    var el = document.querySelector('.event-banner');
    if (!el) return;
    var b = w.events.banner, next = FLO.upcomingList(w)[0], text = '';
    if (b.mode === 'custom' && b.text.trim()) text = b.text.trim();
    else if (b.mode === 'auto' && next) text = FLO.bannerText(next);
    el.classList.toggle('banner-off', !text);
    if (!text) return;
    var badge = el.querySelector('.event-banner-badge');
    var txt = el.querySelector('.event-banner-text');
    var link = el.querySelector('.event-banner-link');
    if (badge) { badge.textContent = b.badge; badge.hidden = !b.badge; }
    if (txt) txt.textContent = text;
    if (link) {
      link.textContent = b.linkLabel;
      link.hidden = !b.linkLabel;
      link.setAttribute('href', FLO.safeHref(b.link));
    }
  }

  function applyEvents(w) {
    var sec = document.querySelector('#workshops');
    if (!sec) return;
    var ev = w.events, esc = FLO.esc;
    var hdr = sec.querySelector('.section-header');
    if (hdr) {
      var label = hdr.querySelector('.section-label');
      var title = hdr.querySelector('.section-title');
      var sub = hdr.querySelector('.section-sub');
      if (label) label.textContent = ev.header.label;
      if (title) title.textContent = ev.header.title;
      if (sub) sub.innerHTML = esc(ev.header.sub).replace(/\r?\n/g, '<br>');
    }

    var up = FLO.upcomingList(w), past = FLO.pastList(w);
    var tabbed = past.length > 0;
    var active = tabbed && FLO.eventsTab === 'past' ? 'past' : 'upcoming';

    sec.querySelectorAll('.events-tabs, .workshops-list, .past-events').forEach(function (n) { n.remove(); });

    var html = '';
    if (tabbed) {
      html += '<div class="events-tabs" role="tablist" aria-label="Events">' +
        '<button type="button" role="tab" class="events-tab' + (active === 'upcoming' ? ' active' : '') + '" id="eventsTabUpcoming" data-etab="upcoming" aria-controls="eventsUpcoming" aria-selected="' + (active === 'upcoming') + '" tabindex="' + (active === 'upcoming' ? 0 : -1) + '">' + esc(ev.tabLabels.upcoming) + '</button>' +
        '<button type="button" role="tab" class="events-tab' + (active === 'past' ? ' active' : '') + '" id="eventsTabPast" data-etab="past" aria-controls="eventsPast" aria-selected="' + (active === 'past') + '" tabindex="' + (active === 'past' ? 0 : -1) + '">' + esc(ev.tabLabels.past) + '</button>' +
      '</div>';
    }
    html += '<div class="workshops-list" id="eventsUpcoming"' +
      (tabbed ? ' role="tabpanel" aria-labelledby="eventsTabUpcoming"' : '') + (active === 'past' ? ' hidden' : '') + '>' +
      (up.length ? up.map(function (e) { return FLO.upcomingItemHTML(e, w); }).join('')
                 : '<p class="events-empty">' + esc(ev.emptyText) + '</p>') +
    '</div>';
    if (tabbed) {
      html += '<div class="past-events" id="eventsPast" role="tabpanel" aria-labelledby="eventsTabPast"' + (active === 'upcoming' ? ' hidden' : '') + '>' +
        past.map(function (e) { return FLO.pastEventHTML(e, w); }).join('') + '</div>';
    }
    sec.insertAdjacentHTML('beforeend', html);

    if (tabbed) {
      var tabs = sec.querySelectorAll('.events-tab');
      var select = function (key, focus) {
        FLO.eventsTab = key;
        tabs.forEach(function (t) {
          var on = t.getAttribute('data-etab') === key;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          if (on && focus) t.focus();
        });
        sec.querySelector('#eventsUpcoming').hidden = key !== 'upcoming';
        sec.querySelector('#eventsPast').hidden = key !== 'past';
      };
      tabs.forEach(function (t) {
        t.addEventListener('click', function () { select(t.getAttribute('data-etab'), false); });
        t.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            var order = ['upcoming', 'past'];
            var cur = order.indexOf(t.getAttribute('data-etab'));
            var nxt = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : (cur + (e.key === 'ArrowRight' ? 1 : -1) + 2) % 2;
            select(order[nxt], true);
          }
        });
      });
      sec.querySelector('#eventsPast').addEventListener('click', function (e) {
        var btn = e.target.closest('.past-thumb');
        if (!btn) return;
        var card = btn.closest('[data-peid]');
        var found = FLO.website.events.past.filter(function (x) { return x.id === card.getAttribute('data-peid'); })[0];
        if (!found) return;
        lightbox().open(found.images.map(FLO.storageUrl), parseInt(btn.getAttribute('data-pi'), 10), found.title, btn);
      });
    }
  }

  /* ── Hero rendering (shared by page and admin preview) ── */
  FLO.heroHTML = function (h) {
    var esc = FLO.esc;
    var html = '';
    if (h.tagline) html += '<p class="hero-tagline">' + esc(h.tagline) + '</p>';
    if (h.titleLines && h.titleLines.length) {
      var last = h.titleLines.length - 1;
      html += '<h1 class="hero-title">' +
        h.titleLines.map(function (line, i) {
          return i === last ? '<span>' + esc(line) + '</span>' : esc(line);
        }).join('<br>') +
        '</h1>';
    }
    if (h.subtitle) html += '<p class="hero-sub">' + esc(h.subtitle).replace(/\r?\n/g, '<br>') + '</p>';
    if (h.buttonLabel) {
      html += '<a href="' + esc(FLO.safeHref(h.buttonLink)) + '" class="btn">' + esc(h.buttonLabel) + '</a>';
    }
    return html;
  };

  // Returns { backgroundImage, backgroundSize, backgroundPosition } for the hero.
  FLO.heroBackground = function (h) {
    var url = FLO.safeImageUrl(h.backgroundImage);
    if (!url) return { backgroundImage: '', backgroundSize: '', backgroundPosition: '' };
    var a = clamp01(h.imageFade, 0.55);
    var wash = 'linear-gradient(rgba(250,250,248,' + a + '), rgba(250,250,248,' + a + '))';
    return {
      backgroundImage: wash + ', url("' + url + '")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  };

  /* ── Class card rendering (shared by page and admin preview) ── */
  FLO.classCardHTML = function (c) {
    var esc = FLO.esc;
    var icon = FLO.safeImageUrl(c.icon);
    var iconHTML = icon
      ? '<img src="' + esc(icon) + '" alt="' + esc(c.name) + '" class="class-icon-img" />'
      : '<span class="class-icon-ph" aria-hidden="true">' + esc((c.name || '?').charAt(0).toUpperCase()) + '</span>';

    var hover = '';
    if (c.price) hover += '<p class="class-price">' + esc(c.price) + '</p>';
    if (c.meta && c.meta.length) {
      hover += '<ul class="class-meta">' + c.meta.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>';
    }
    if ((c.slots && c.slots.length) || c.slotsLabel) {
      hover += '<div class="class-slots">';
      if (c.slotsLabel) hover += '<p class="slots-label">' + esc(c.slotsLabel) + '</p>';
      (c.slots || []).forEach(function (s) {
        // Available slots on a highlighted (tangerine) card use the light style.
        var cls = s.status === 'full' ? 'full' : 'available' + (c.highlight ? ' slot-light' : '');
        // The trailing newline matters: browsers render the whitespace between
        // inline chips as a small gap, exactly as the original hand-written markup did.
        hover += '<div class="slot ' + cls + '">' + esc(s.text) + '</div>\n';
      });
      hover += '</div>';
    }
    if (c.buttonLabel) {
      hover += '<a href="' + esc(FLO.safeHref(c.buttonLink)) + '" class="btn btn-card' +
        (c.waitlist ? ' btn-waitlist' : '') + '">' + esc(c.buttonLabel) + '</a>';
    }

    return '<div class="class-card' + (c.highlight ? ' highlight-card' : '') + '">' +
      '<div class="card-inner">' +
        '<div class="card-lottie-wrap">' + iconHTML + '</div>' +
        '<div class="card-content">' +
          '<h3>' + esc(c.name) + '</h3>' +
          (c.type ? '<p class="class-type">' + esc(c.type) + '</p>' : '') +
          (c.desc ? '<p class="class-desc">' + esc(c.desc) + '</p>' : '') +
          (hover ? '<div class="card-hover-info">' + hover + '</div>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  };

  // The cards area of the Classes section. Without groups it is the plain
  // grid of cards; with groups switched on, each group gets a heading.
  FLO.classesBodyHTML = function (col) {
    var esc = FLO.esc;
    var visible = col.cards.filter(function (c) { return !c.hidden; });
    if (!col.groupsOn || !col.groups.length) {
      return { grouped: false, html: visible.map(FLO.classCardHTML).join('') };
    }
    var used = {};
    var parts = [];
    col.groups.forEach(function (g) {
      var cards = visible.filter(function (c) { return c.groupId === g.id; });
      if (!cards.length) return;
      cards.forEach(function (c) { used[c.id] = true; });
      var icon = FLO.safeImageUrl(g.icon);
      var sub = g.desc || cards.map(function (c) { return c.name; }).join(' • ');
      parts.push(
        '<div class="class-group class-group--' + esc(g.color) + '">' +
          '<div class="class-group-head">' +
            (icon ? '<img class="class-group-icon" src="' + esc(icon) + '" alt="">' : '') +
            '<div class="class-group-text">' +
              '<h3 class="class-group-name">' + esc(g.name) + '</h3>' +
              '<p class="class-group-sub">' + esc(sub) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="class-group-cards">' + cards.map(FLO.classCardHTML).join('') + '</div>' +
        '</div>');
    });
    var rest = visible.filter(function (c) { return !used[c.id]; });
    if (rest.length) {
      parts.push('<div class="class-group class-group--plain"><div class="class-group-cards">' +
        rest.map(FLO.classCardHTML).join('') + '</div></div>');
    }
    return { grouped: true, html: parts.join('') };
  };

  /* ── FLO Kids card rendering ────────────────────────── */
  FLO.kidsCardHTML = function (c) {
    var esc = FLO.esc;
    var icon = FLO.safeImageUrl(c.icon);
    var iconHTML = icon
      ? '<img src="' + esc(icon) + '" alt="' + esc(c.name) + '" class="kids-icon-img" />'
      : '<span class="kids-icon-ph" aria-hidden="true">' + esc((c.name || '?').charAt(0).toUpperCase()) + '</span>';

    var html = '<div class="kids-card">' +
      '<div class="kids-icon">' + iconHTML + '</div>' +
      '<div class="kids-content">' +
        '<h3>' + esc(c.name) + '</h3>' +
        (c.type ? '<p class="kids-type">' + esc(c.type) + '</p>' : '') +
        (c.desc ? '<p class="kids-desc">' + esc(c.desc) + '</p>' : '');
    if (c.meta && c.meta.length) {
      html += '<div class="kids-meta">' +
        c.meta.map(function (t) { return '<span class="kids-tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    }
    if (c.price) html += '<p class="kids-price">' + esc(c.price) + '</p>';
    if ((c.slots && c.slots.length) || c.slotsLabel) {
      html += '<div class="class-slots">';
      if (c.slotsLabel) html += '<p class="slots-label">' + esc(c.slotsLabel) + '</p>';
      (c.slots || []).forEach(function (s) {
        html += '<div class="slot ' + (s.status === 'full' ? 'full' : 'available') + '">' + esc(s.text) + '</div>\n';
      });
      html += '</div>';
    }
    if (c.buttonLabel) {
      html += '<a href="' + esc(FLO.safeHref(c.buttonLink)) + '" class="btn btn-card' +
        (c.waitlist ? ' btn-waitlist' : '') + '" style="margin-top:16px;">' + esc(c.buttonLabel) + '</a>';
    }
    return html + '</div></div>';
  };

  /* ── Footer: merge / render ─────────────────────────── */
  function mergeFooter(stored, d) {
    var sf = stored.footer;
    if (!sf || typeof sf !== 'object') return;
    var t = d.footer;
    t.brandName      = str(sf.brandName, 60, t.brandName);
    t.tagline        = str(sf.tagline, 80, t.tagline);
    t.description    = str(sf.description, 400, t.description);
    t.addressHeading = str(sf.addressHeading, 60, t.addressHeading);
    t.mapLabel       = str(sf.mapLabel, 40, t.mapLabel);
    t.mapLink        = str(sf.mapLink, 400, t.mapLink);
    t.contactHeading = str(sf.contactHeading, 60, t.contactHeading);
    t.hoursHeading   = str(sf.hoursHeading, 60, t.hoursHeading);
    t.copyright      = str(sf.copyright, 200, t.copyright);

    if (Array.isArray(sf.addressLines)) {
      t.addressLines = sf.addressLines.map(function (l) { return String(l == null ? '' : l).trim().slice(0, 100); })
                                      .filter(Boolean).slice(0, 6);
    }
    if (Array.isArray(sf.contacts)) {
      t.contacts = sf.contacts.map(function (x) {
        return { label: String(x && x.label != null ? x.label : '').trim().slice(0, 40),
                 value: String(x && x.value != null ? x.value : '').trim().slice(0, 100),
                 link:  String(x && x.link  != null ? x.link  : '').trim().slice(0, 400) };
      }).filter(function (x) { return x.label || x.value; }).slice(0, 6);
    }
    if (Array.isArray(sf.hours)) {
      t.hours = sf.hours.map(function (x) {
        return { days: String(x && x.days != null ? x.days : '').trim().slice(0, 60),
                 time: String(x && x.time != null ? x.time : '').trim().slice(0, 60) };
      }).filter(function (x) { return x.days || x.time; }).slice(0, 8);
    }
    if (Array.isArray(sf.legal)) {
      t.legal = sf.legal.map(function (x) {
        return { label: String(x && x.label != null ? x.label : '').trim().slice(0, 60),
                 link:  String(x && x.link  != null ? x.link  : '').trim().slice(0, 400) };
      }).filter(function (x) { return x.label; }).slice(0, 6);
    }
  }

  // The inside of <footer>. Mirrors the original hard-coded markup.
  FLO.footerHTML = function (f) {
    var esc = FLO.esc;
    function open(cls, link) {
      var h = FLO.safeHref(link);
      var ext = /^https?:/i.test(h);
      return '<a href="' + esc(h) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') +
             (cls ? ' class="' + cls + '"' : '') + '>';
    }

    var brand = (f.brandName || f.tagline || f.description)
      ? '<div class="footer-brand">' +
          (f.brandName ? '<div class="footer-logo">' + esc(f.brandName) + '</div>' : '') +
          (f.tagline ? '<p class="footer-tagline">' + esc(f.tagline) + '</p>' : '') +
          (f.description ? '<p class="footer-desc">' + esc(f.description) + '</p>' : '') +
        '</div>'
      : '';

    var address = (f.addressHeading || f.addressLines.length || (f.mapLabel && f.mapLink))
      ? '<div class="footer-contact">' +
          (f.addressHeading ? '<p class="footer-heading">' + esc(f.addressHeading) + '</p>' : '') +
          (f.addressLines.length ? '<p class="footer-address">' + f.addressLines.map(esc).join('<br>') + '</p>' : '') +
          (f.mapLabel && f.mapLink ? open('footer-map-link', f.mapLink) + esc(f.mapLabel) + '</a>' : '') +
        '</div>'
      : '';

    var reach = (f.contactHeading || f.contacts.length)
      ? '<div class="footer-reach">' +
          (f.contactHeading ? '<p class="footer-heading">' + esc(f.contactHeading) + '</p>' : '') +
          '<div class="footer-links">' +
            f.contacts.map(function (c) {
              var inner = (c.label ? '<span class="footer-link-label">' + esc(c.label) + '</span>' : '') +
                          (c.value ? '<span class="footer-link-value">' + esc(c.value) + '</span>' : '');
              return c.link ? open('footer-link', c.link) + inner + '</a>'
                            : '<div class="footer-link">' + inner + '</div>';
            }).join('') +
          '</div>' +
        '</div>'
      : '';

    var hours = (f.hoursHeading || f.hours.length)
      ? '<div class="footer-hours">' +
          (f.hoursHeading ? '<p class="footer-heading">' + esc(f.hoursHeading) + '</p>' : '') +
          '<div class="footer-schedule">' +
            f.hours.map(function (r) {
              return '<div class="footer-schedule-row"><span>' + esc(r.days) + '</span>' +
                     (r.time ? '<span>' + esc(r.time) + '</span>' : '') + '</div>';
            }).join('') +
          '</div>' +
        '</div>'
      : '';

    var year = (FLO.today ? FLO.today() : String(new Date().getFullYear())).slice(0, 4);
    var copy = String(f.copyright || '').replace(/\{year\}/gi, year);

    return '<div class="footer-top">' + brand + address + reach + hours + '</div>' +
      '<div class="footer-bottom">' +
        (copy ? '<p class="footer-copy">' + esc(copy) + '</p>' : '<p class="footer-copy"></p>') +
        '<div class="footer-bottom-links">' +
          f.legal.map(function (l) { return open('', l.link) + esc(l.label) + '</a>'; }).join('') +
        '</div>' +
      '</div>';
  };

  /* ── Apply to the page ──────────────────────────────── */
  function applyFooter(w) {
    var footer = document.querySelector('footer.footer');
    if (footer) footer.innerHTML = FLO.footerHTML(w.footer);
  }

  function applyOrderAndVisibility(w) {
    var footer = document.querySelector('footer.footer');
    if (!footer || !footer.parentNode) return;

    w.order.forEach(function (key) {
      var def = FLO.SECTIONS.filter(function (s) { return s.key === key; })[0];
      if (!def) return;
      def.els.forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) footer.parentNode.insertBefore(el, footer);
      });
    });

    FLO.SECTIONS.forEach(function (def) {
      var hide = w.hidden[def.key] === true;
      def.els.forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) el.classList.toggle('site-hidden', hide);
      });
      if (def.nav) {
        var link = document.querySelector('.nav-links a[href="' + def.nav + '"]');
        if (link && link.parentElement) link.parentElement.classList.toggle('site-hidden', hide);
      }
    });
  }

  function applyHero(w) {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var content = hero.querySelector('.hero-content');
    if (content) content.innerHTML = FLO.heroHTML(w.hero);
    var bg = FLO.heroBackground(w.hero);
    hero.style.backgroundImage = bg.backgroundImage;
    hero.style.backgroundSize = bg.backgroundSize;
    hero.style.backgroundPosition = bg.backgroundPosition;
  }

  function applyClasses(w) {
    var sec = document.querySelector('#classes');
    if (!sec) return;
    var hdr = sec.querySelector('.section-header');
    if (hdr) {
      var h = w.classes.header;
      var label = hdr.querySelector('.section-label');
      var title = hdr.querySelector('.section-title');
      var sub = hdr.querySelector('.section-sub');
      if (label) label.textContent = h.label;
      if (title) title.textContent = h.title;
      if (sub) sub.innerHTML = FLO.esc(h.sub).replace(/\r?\n/g, '<br>');
    }
    var grid = sec.querySelector('.classes-grid');
    if (grid) {
      var body = FLO.classesBodyHTML(w.classes);
      grid.classList.toggle('classes-grid--grouped', body.grouped);
      grid.innerHTML = body.html;
    }
  }

  function applyKids(w) {
    var sec = document.querySelector('#kids');
    if (!sec) return;
    var hdr = sec.querySelector('.kids-header');
    if (hdr) {
      var h = w.kids.header;
      var label = hdr.querySelector('.section-label');
      var title = hdr.querySelector('.section-title');
      var sub = hdr.querySelector('.section-sub');
      if (label) label.textContent = h.label;
      if (title) title.textContent = h.title;
      if (sub) sub.innerHTML = FLO.esc(h.sub).replace(/\r?\n/g, '<br>');
    }
    var grid = sec.querySelector('.kids-grid');
    if (grid) {
      grid.innerHTML = w.kids.cards
        .filter(function (c) { return !c.hidden; })
        .map(FLO.kidsCardHTML)
        .join('');
    }
  }

  function applyTeam(w) {
    var sec = document.querySelector('#instructors');
    if (!sec) return;
    var hdr = sec.querySelector('.section-header');
    if (hdr) {
      var h = w.team.header;
      var label = hdr.querySelector('.section-label');
      var title = hdr.querySelector('.section-title');
      var sub = hdr.querySelector('.section-sub');
      if (label) label.textContent = h.label;
      if (title) title.textContent = h.title;
      if (sub) sub.innerHTML = FLO.esc(h.sub).replace(/\r?\n/g, '<br>');
    }
    var grid = sec.querySelector('.instructors-grid');
    if (grid) {
      grid.innerHTML = w.team.cards
        .filter(function (c) { return !c.hidden; })
        .map(FLO.teamCardHTML)
        .join('');
    }
  }

  function applyStory(w) {
    var sec = document.querySelector('#about');
    if (sec) sec.innerHTML = FLO.storyHTML(w.story, w);
  }

  FLO.applyWebsite = function (w0) {
    try {
      // Class cards take their name and times from the real class schedule.
      var w = (FLO.studio && FLO.studio.resolveWebsite) ? FLO.studio.resolveWebsite(w0) : w0;
      applyOrderAndVisibility(w);
      applyHero(w);
      applyClasses(w);
      applyKids(w);
      applyTeam(w);
      applyEvents(w);
      applyBanner(w);
      applyFooter(w);
      applyStory(w);   // last: a number in the story row can count class and team cards
    } catch (err) {
      console.error('FLO: could not apply website content.', err);
    }
  };

  /* ── Cache ──────────────────────────────────────────── */
  function readCache() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeCache(value) {
    try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  /* ── Load / save ────────────────────────────────────── */
  FLO.website = FLO.mergeWebsite(readCache());

  // useCache: apply the cached copy immediately (public page load).
  // The admin editor passes false so it always edits fresh server data.
  FLO.loadWebsite = async function (useCache) {
    var hadCache = false;
    if (useCache !== false) {
      var cached = readCache();
      if (cached) {
        hadCache = true;
        FLO.website = FLO.mergeWebsite(cached);
        FLO.applyWebsite(FLO.website);
      }
    }
    var res = await FLO.settings.get('website');
    if (!res.ok && !hadCache) FLO.applyWebsite(FLO.website);   // e.g. offline on a first visit
    if (res.ok) {
      FLO.website = FLO.mergeWebsite(res.value);
      writeCache(res.value);
      FLO.applyWebsite(FLO.website);
    }
    return { ok: res.ok, error: res.error };
  };

  FLO.saveWebsite = async function (next) {
    var merged = FLO.mergeWebsite(next);
    var res = await FLO.settings.set('website', merged);
    if (!res.ok) return res;
    FLO.website = merged;
    writeCache(merged);
    FLO.applyWebsite(merged);
    return { ok: true };
  };

  // When the class schedule changes (loaded, or edited by the administrator),
  // redraw the page so the class cards and the numbers row follow.
  document.addEventListener('flo:studio', function () {
    if (FLO.website) FLO.applyWebsite(FLO.website);
  });

  /* ── Start ──────────────────────────────────────────── */
  FLO.loadWebsite(true);
})();
