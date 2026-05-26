export const initialData = {
    settings: {
        siteName: "Saketh",
        siteTitle: "Saketh — AI & ML Engineer",
        logoText: "Saketh",
        navLinks: [
            { text: "Home", href: "#home", section: "home" },
            { text: "About", href: "#about", section: "about" },
            { text: "Skills", href: "#skills", section: "skills" },
            { text: "Projects", href: "#projects", section: "projects" },
            { text: "Experience", href: "#experience", section: "experience" },
            { text: "Certifications", href: "#certifications", section: "certifications" },
            { text: "Contact", href: "#contact", section: "contact" }
        ],
        sectionTitles: {
            about: "About Me",
            skills: "Skills & Technologies",
            projects: "Featured Projects",
            experience: "Experience",
            certifications: "Certifications",
            contact: "Get In Touch"
        },
        footer: {
            text: "Designed & Built by Saketh",
            year: 2025
        },
        githubUsername: "gsaketh2006",
        leetcodeUsername: "saketh_g",
        scrollIndicatorText: "Scroll to explore"
    },
    hero: {
        greeting: "Hi, I'm",
        typingTexts: [
            "G.L.N.S.S. Saketh",
            "AI & ML Engineer",
            "CV Enthusiast",
            "Problem Solver"
        ],
        role: "AI & ML Engineer · Computer Vision Enthusiast",
        description: "I build intelligent systems that see, learn, and solve real-world problems. Passionate about end-to-end ML pipelines, deep learning, and crafting elegant solutions.",
        badgeText: "Available for opportunities",
        buttons: [
            { text: "Let's Connect", href: "#contact", icon: "fas fa-arrow-right", type: "primary" },
            { text: "View Projects", href: "#projects", icon: "fas fa-code", type: "outline" }
        ],
        socialLinks: [
            { url: "https://github.com/gsaketh2006", icon: "fab fa-github", label: "GitHub" },
            { url: "https://www.linkedin.com/in/guggilam-leela-naga-sai-sri-saketh-326853289/", icon: "fab fa-linkedin-in", label: "LinkedIn" },
            { url: "mailto:guggilamsaketh@gmail.com", icon: "fas fa-envelope", label: "Email" }
        ],
        resumeUrl: "",
        avatarImage: ""
    },
    about: {
        title: "About Me",
        description: "I'm a passionate B.Tech CSE (AI & ML) student at SRM University–AP and a Computer Vision enthusiast. I enjoy solving real-world problems using machine learning, deep learning, and end-to-end model deployment. Learning | Building | Experimenting",
        currentRoleTitle: "Summer Research Intern",
        currentRoleOrg: "SRM University-AP",
        showGithubGrid: true,
        showLeetcodeGrid: true
    },
    skills: {
        "Programming Languages": ["C", "C++", "Python"],
        "Web Technologies": ["HTML5", "CSS", "Java Script", "PHP"],
        "Database & Cloud": ["MySQL", "Vercel", "Infinity free"],
        "Tools & Analytics": ["Power BI", "GitHub"],
        "Libraries & Frameworks": ["numpy", "pandas", "scikit-learn"],
        "Operating Systems": ["Windows", "Linux", "MacOS"]
    },
    experience: [
        {
            date: "June 2025 - Present",
            title: "Summer Research Intern",
            company: "SRM University-AP",
            description: "Conducted a faculty-guided research internship focused on building a machine learning–based screening system for early prediction of Autism Spectrum Disorder (ASD) in adults using questionnaire and demographic data. Developed an end-to-end ML pipeline and deployed the final model as a web application.",
            achievements: [
                "Built and evaluated multiple ML models with cross-validation and hyperparameter tuning; achieved 95% accuracy using a Random Forest classifier.",
                "Handled class imbalance using SMOTE and improved interpretability through feature importance analysis.",
                "Deployed the solution as a Flask-based web app for real-time screening predictions."
            ],
            icon: "fa-code",
            color: "#4E85BF"
        }
    ],
    certifications: [
        {
            title: "AWS Certified Cloud Practitioner",
            organization: "Amazon Web Services",
            image: "https://d1.awsstatic.com/training-and-certification/Certification%20Badges/AWS-Certified_Cloud_Practitioner_512x512.bc006f14f986fa4f3ca6b5c8933bfef0a177b9bc.png",
            issueDate: "2024-01-15",
            credentialId: "AWS-CCP-12345",
            credentialUrl: "https://www.credly.com/badges/example",
            color: "#4E85BF"
        },
        {
            title: "Google Cloud Professional Cloud Architect",
            organization: "Google Cloud",
            image: "https://www.gstatic.com/cloud/images/product/png_96/cloud_512_96.png",
            issueDate: "2023-11-20",
            credentialId: "GCP-PCA-67890",
            credentialUrl: "https://www.credly.com/badges/example",
            color: "#4E85BF"
        },
        {
            title: "Microsoft Azure Fundamentals",
            organization: "Microsoft",
            image: "https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg",
            issueDate: "2023-09-10",
            credentialId: "MS-AZ-900-11111",
            credentialUrl: "https://www.credly.com/badges/example",
            color: "#4E85BF"
        }
    ],
    projects: [
        {
            name: "Portfolio Project",
            description: "A professional portfolio website built with React and Supabase.",
            url: "https://github.com/gsaketh2006/Saketh_Portfolio",
            language: "React",
            image_url: ""
        }
    ],
    contact: {
        title: "Get In Touch",
        heading: "Let's Work Together",
        description: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.",
        email: { label: "Email", value: "guggilamsaketh@gmail.com", icon: "fas fa-envelope", link: "mailto:guggilamsaketh@gmail.com" },
        phone: { label: "Phone", value: "+1 (234) 567-890", icon: "fas fa-phone", link: "tel:+1234567890" },
        location: { label: "Location", value: "Andhra Pradesh, India", icon: "fas fa-map-marker-alt", link: null },
        socialLinks: [
            { platform: "GitHub", url: "https://github.com", icon: "fab fa-github", ariaLabel: "GitHub" },
            { platform: "LinkedIn", url: "https://www.linkedin.com/in/guggilam-leela-naga-sai-sri-saketh-326853289/", icon: "fab fa-linkedin", ariaLabel: "LinkedIn" },
            { platform: "Twitter", url: "https://twitter.com", icon: "fab fa-twitter", ariaLabel: "Twitter" },
            { platform: "Dribbble", url: "https://dribbble.com", icon: "fab fa-dribbble", ariaLabel: "Dribbble" }
        ]
    }
};
