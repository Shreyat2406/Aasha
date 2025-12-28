import type { LearningModule } from "./types"

export const learningModules: LearningModule[] = [
  {
    id: "1",
    title: "Phishing Basics",
    description: "Learn to identify and avoid phishing attacks",
    category: "Phishing",
    difficulty: "beginner",
    points: 50,
    content: [
      {
        type: "text",
        content:
          "Phishing is a cybercrime where attackers try to trick you into revealing sensitive information like passwords, credit card numbers, or personal data.",
      },
      {
        type: "text",
        content:
          "Common signs of phishing include urgent messages, suspicious sender addresses, requests for personal information, spelling errors, and mismatched links.",
      },
      {
        type: "text",
        content:
          "Always verify the sender, hover over links before clicking, and never share passwords via email. When in doubt, contact the organization directly.",
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "What is phishing?",
        options: [
          "A type of fishing sport",
          "An attempt to steal personal information by pretending to be trustworthy",
          "A legitimate email from your bank",
          "A computer virus",
        ],
        correctAnswer: 1,
        explanation:
          "Phishing is a social engineering attack where criminals try to trick you into giving away sensitive information.",
      },
      {
        id: "q2",
        question: "Which is a common sign of a phishing email?",
        options: [
          "Professional formatting",
          "Urgent requests for personal information",
          "Personalized greeting",
          "Official company logo",
        ],
        correctAnswer: 1,
        explanation:
          "Phishing emails often create urgency to pressure you into acting quickly without thinking carefully.",
      },
      {
        id: "q3",
        question: "What should you do with a suspicious email?",
        options: [
          "Click all the links",
          "Reply with your password",
          "Delete it and report as spam",
          "Forward to contacts",
        ],
        correctAnswer: 2,
        explanation:
          "Delete suspicious emails and report them. Never click links or provide information to suspicious senders.",
      },
    ],
  },
  {
    id: "2",
    title: "Password Security",
    description: "Master the art of creating and managing secure passwords",
    category: "Privacy",
    difficulty: "beginner",
    points: 50,
    content: [
      {
        type: "text",
        content:
          "Strong passwords are your first line of defense against cyber attacks. A weak password can be cracked in seconds, while a strong one can take years.",
      },
      {
        type: "text",
        content:
          "Best practices: Use at least 12 characters, mix uppercase and lowercase letters, include numbers and symbols, avoid common words or personal information, and never reuse passwords across sites.",
      },
      {
        type: "text",
        content:
          "Consider using a password manager to generate and store unique passwords for each account. Enable two-factor authentication (2FA) whenever possible for extra security.",
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "What makes a password strong?",
        options: [
          "Using your birthday",
          "At least 12 characters with letters, numbers, and symbols",
          "Your pet's name",
          "The word 'password123'",
        ],
        correctAnswer: 1,
        explanation:
          "Strong passwords combine length (12+ characters) with complexity (uppercase, lowercase, numbers, and symbols).",
      },
      {
        id: "q2",
        question: "What should you avoid when creating a password?",
        options: [
          "Using special characters",
          "Making it long",
          "Using personal information like your name or birthday",
          "Using a password manager",
        ],
        correctAnswer: 2,
        explanation:
          "Personal information is easy for attackers to guess or find through social media and public records.",
      },
      {
        id: "q3",
        question: "What is two-factor authentication (2FA)?",
        options: [
          "Using two passwords",
          "An extra security layer requiring a second verification method",
          "Having two email accounts",
          "Changing your password twice",
        ],
        correctAnswer: 1,
        explanation:
          "2FA adds an extra security layer by requiring something you know (password) and something you have (phone, security key).",
      },
      {
        id: "q4",
        question: "How often should you reuse the same password?",
        options: [
          "Always use the same password",
          "Reuse for important sites only",
          "Never reuse passwords",
          "Only twice",
        ],
        correctAnswer: 2,
        explanation:
          "Never reuse passwords. If one account is compromised, all accounts with that password become vulnerable.",
      },
    ],
  },
  {
    id: "3",
    title: "Social Media Safety",
    description: "Protect your privacy and stay safe on social platforms",
    category: "Privacy",
    difficulty: "beginner",
    points: 60,
    content: [
      {
        type: "text",
        content:
          "Social media platforms are great for staying connected, but they can also expose you to privacy risks, scams, and cyberbullying if not used carefully.",
      },
      {
        type: "text",
        content:
          "Privacy tips: Adjust privacy settings to control who sees your posts, be careful about sharing personal information like your location or phone number, think before posting, and remember that the internet is permanent.",
      },
      {
        type: "text",
        content:
          "Be aware of friend requests from strangers, suspicious links in messages, fake profiles impersonating people you know, and posts that seem too good to be true.",
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "What personal information should you avoid sharing publicly on social media?",
        options: [
          "Your favorite color",
          "Your home address and phone number",
          "Your favorite movie",
          "Your school's name (without location)",
        ],
        correctAnswer: 1,
        explanation:
          "Home addresses and phone numbers can be used by criminals for identity theft, stalking, or physical threats.",
      },
      {
        id: "q2",
        question: "What should you do if you receive a friend request from someone you don't know?",
        options: [
          "Accept it immediately",
          "Check their profile carefully and decline if suspicious",
          "Share your password with them",
          "Post about it publicly",
        ],
        correctAnswer: 1,
        explanation: "Fake profiles are common. Always verify who's behind a friend request before accepting.",
      },
      {
        id: "q3",
        question: "Why is it important to review your privacy settings?",
        options: [
          "It's not important",
          "To control who can see your posts and personal information",
          "To get more likes",
          "To make your profile look better",
        ],
        correctAnswer: 1,
        explanation:
          "Privacy settings help you control your digital footprint and protect sensitive information from strangers.",
      },
      {
        id: "q4",
        question: "What should you remember about anything you post online?",
        options: [
          "It disappears after 24 hours",
          "Only your friends can see it",
          "It can be permanent and hard to delete completely",
          "It's always private",
        ],
        correctAnswer: 2,
        explanation: "Even deleted posts can be screenshotted or archived. Always think twice before posting.",
      },
    ],
  },
  {
    id: "4",
    title: "Online Scams",
    description: "Recognize and avoid common online scams and fraud",
    category: "Scams",
    difficulty: "intermediate",
    points: 70,
    content: [
      {
        type: "text",
        content:
          "Online scams come in many forms: fake shopping sites, lottery scams, romance scams, tech support scams, and investment fraud. Scammers constantly evolve their tactics.",
      },
      {
        type: "text",
        content:
          "Red flags: Too-good-to-be-true offers, pressure to act immediately, requests for gift cards or wire transfers, poor grammar and spelling, and unsolicited contact.",
      },
      {
        type: "text",
        content:
          "Protection strategies: Research before buying, use secure payment methods, verify website authenticity (look for HTTPS and legitimate domain names), trust your instincts, and report scams to authorities.",
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "Which is a common red flag of an online scam?",
        options: [
          "Professional website design",
          "Pressure to act immediately or miss out",
          "Customer reviews",
          "Secure payment options",
        ],
        correctAnswer: 1,
        explanation: "Scammers create urgency to prevent you from thinking critically or researching their offer.",
      },
      {
        id: "q2",
        question: "What payment method is commonly requested by scammers?",
        options: ["Credit card through secure checkout", "PayPal", "Gift cards or wire transfers", "Cash on delivery"],
        correctAnswer: 2,
        explanation:
          "Gift cards and wire transfers are preferred by scammers because they're hard to trace and can't be reversed.",
      },
      {
        id: "q3",
        question: "What does HTTPS in a website URL indicate?",
        options: [
          "The site is definitely legitimate",
          "The connection is encrypted",
          "It's a government website",
          "The site has no viruses",
        ],
        correctAnswer: 1,
        explanation:
          "HTTPS means the connection is encrypted, but scam sites can also have HTTPS. Always verify legitimacy through other means.",
      },
      {
        id: "q4",
        question: "If something online seems too good to be true, you should:",
        options: [
          "Immediately buy it before it's gone",
          "Share it with friends",
          "Research carefully and be skeptical",
          "Give them your bank details",
        ],
        correctAnswer: 2,
        explanation:
          "If an offer seems too good to be true, it probably is. Always research and verify before committing.",
      },
      {
        id: "q5",
        question: "What should you do if you've been scammed?",
        options: [
          "Keep it secret",
          "Report it to authorities and your bank immediately",
          "Try to get revenge",
          "Delete all evidence",
        ],
        correctAnswer: 1,
        explanation:
          "Quick action can help minimize damage. Report to police, your bank, and relevant platforms immediately.",
      },
    ],
  },
  {
    id: "5",
    title: "Malware & Viruses",
    description: "Understand malware threats and how to protect your devices",
    category: "Malware",
    difficulty: "intermediate",
    points: 80,
    content: [
      {
        type: "text",
        content:
          "Malware (malicious software) includes viruses, trojans, ransomware, spyware, and adware. Each type has different goals, from stealing data to holding your files hostage.",
      },
      {
        type: "text",
        content:
          "Common infection methods: Email attachments, malicious downloads, infected websites, fake software updates, USB drives, and pirated software.",
      },
      {
        type: "text",
        content:
          "Prevention: Keep software updated, use antivirus software, avoid suspicious downloads, don't click unknown email attachments, use ad-blockers, and regularly backup your data.",
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "What is ransomware?",
        options: [
          "Free antivirus software",
          "Malware that encrypts your files and demands payment",
          "A type of firewall",
          "A legitimate software update",
        ],
        correctAnswer: 1,
        explanation: "Ransomware locks your files and demands payment (usually in cryptocurrency) to unlock them.",
      },
      {
        id: "q2",
        question: "What's the best way to protect against malware?",
        options: [
          "Never use the internet",
          "Click on all pop-ups",
          "Keep software updated and use antivirus software",
          "Download from any website",
        ],
        correctAnswer: 2,
        explanation:
          "Regular updates patch security vulnerabilities, and antivirus software detects and blocks malware.",
      },
      {
        id: "q3",
        question: "What should you do with email attachments from unknown senders?",
        options: [
          "Open them immediately",
          "Delete them without opening",
          "Forward to friends",
          "Download and scan later",
        ],
        correctAnswer: 1,
        explanation:
          "Email attachments are a common malware delivery method. Delete suspicious emails without opening attachments.",
      },
      {
        id: "q4",
        question: "Why is pirated software dangerous?",
        options: [
          "It's not dangerous",
          "It often contains malware and has no security updates",
          "It works better than legitimate software",
          "It's cheaper",
        ],
        correctAnswer: 1,
        explanation:
          "Pirated software is often bundled with malware and doesn't receive security patches, leaving you vulnerable.",
      },
    ],
  },
]
