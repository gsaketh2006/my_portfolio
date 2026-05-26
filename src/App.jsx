import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { initialData } from './initialData';
import Admin from './Admin';
import About from './components/About/About';
import { supabase } from './lib/supabase';
import React from 'react';

// --- Boot Sequence Component ---
const bootLines = [
    "BIOS Check ................... [ OK ]",
    "Initializing core hardware ... [ OK ]",
    "Mounting root filesystem ..... [ OK ]",
    "Loading kernel modules ....... [ OK ]",
    "Starting AI inference engine . [ OK ]",
    "Booting Saketh OS v2.0 ....... [ OK ]"
];

const BootSequence = ({ onComplete }) => {
    const [lines, setLines] = useState([]);
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < bootLines.length) {
                setLines(prev => [...prev, bootLines[currentLine]]);
                currentLine++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setIsDone(true);
                    onComplete();
                }, 600);
            }
        }, 350);
        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="os-boot-container">
            {lines.map((line, idx) => (
                <div key={idx} className="os-boot-line">
                    <span className="os-boot-text">{line.split('[')[0]}</span>
                    {line.includes('[') && <span className="os-boot-ok">[{line.split('[')[1]}</span>}
                </div>
            ))}
            {!isDone && (
                <div className="os-boot-line">
                    <span className="os-cursor-blink">_</span>
                </div>
            )}
        </div>
    );
};

// --- Custom Hooks ---
const useMagnetic = (ref, strength = 0.5) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!ref.current) return;
            const { left, top, width, height } = ref.current.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            
            if (Math.abs(distanceX) < width && Math.abs(distanceY) < height) {
                x.set(distanceX * strength);
                y.set(distanceY * strength);
            } else {
                x.set(0);
                y.set(0);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [ref, strength, x, y]);

    return { x: springX, y: springY };
};

// --- Motion Components ---
const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
    const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };
        const handleHover = (e) => {
            const target = e.target;
            const isClickable = target.closest('a, button, .project-bar, .skill-card, .cert-card, .hero-social-square');
            setIsHovered(!!isClickable);
        };
        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHover);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHover);
        };
    }, [cursorX, cursorY]);

    return (
        <div className={isHovered ? 'cursor-hover' : ''}>
            <motion.div className="custom-cursor" style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }} />
            <motion.div className="custom-cursor-outline" style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }} />
        </div>
    );
};

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    return (
        <div className="scroll-progress-container">
            <motion.div className="scroll-progress-bar" style={{ scaleX, originX: 0 }} />
        </div>
    );
};

const MagneticButton = ({ children, className, ...props }) => {
    const ref = useRef(null);
    const { x, y } = useMagnetic(ref);
    return (
        <motion.div ref={ref} style={{ x, y }} className="magnetic-wrap">
            <motion.button className={className} {...props}>{children}</motion.button>
        </motion.div>
    );
};

const TiltCard = ({ children, className, ...props }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);
    const springX = useSpring(rotateX);
    const springY = useSpring(rotateY);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX: springX, rotateY: springY, perspective: 1000 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};


// --- Framer Motion Section Wrapper ---
const Section = ({ children, id }) => (
    <motion.section
        id={id}
        className="section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.section>
);

const App = () => {
    const [data, setData] = useState(initialData);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(window.location.pathname.includes('/admin'));
    const [passwordInput, setPasswordInput] = useState('');
    const [loading, setLoading] = useState(true);

    const chatInputRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch main portfolio data (profile)
            const { data: profileData, error: profileError } = await supabase
                .from('portfolio_data')
                .select('*')
                .single();

            if (profileError) throw profileError;

            // 2. Fetch experience
            const { data: expData, error: expError } = await supabase
                .from('experience')
                .select('*')
                .order('order_index', { ascending: true });

            if (expError) throw expError;

            // 3. Fetch certifications
            const { data: certData, error: certError } = await supabase
                .from('certifications')
                .select('*')
                .order('order_index', { ascending: true });

            if (certError) throw certError;

            // Map snake_case from DB to camelCase for frontend
            const mappedCertData = (certData || []).map(cert => ({
                ...cert,
                image: cert.image_url,
                issueDate: cert.issue_date,
                credentialId: cert.credential_id,
                credentialUrl: cert.credential_url
            }));

            // 4. Fetch skills
            const { data: skillsData, error: skillsError } = await supabase
                .from('skills')
                .select('*')
                .order('order_index', { ascending: true });

            if (skillsError) throw skillsError;

            // 5. Fetch custom projects
            const { data: projData, error: projError } = await supabase
                .from('projects')
                .select('*')
                .order('order_index', { ascending: true });

            if (projError) throw projError;

            // Reconstruct the skills object from the flat table
            const skillsMap = {};
            skillsData.forEach(s => {
                if (!skillsMap[s.category]) skillsMap[s.category] = [];
                skillsMap[s.category].push(s.skill_name);
            });

            // Update main state
            setData(prev => ({
                settings: profileData?.settings || prev.settings,
                hero: profileData?.hero || prev.hero,
                about: profileData?.about || prev.about,
                contact: profileData?.contact || prev.contact,
                experience: expData?.length > 0 ? expData : prev.experience,
                certifications: mappedCertData?.length > 0 ? mappedCertData : prev.certifications,
                projects: projData?.length > 0 ? projData : prev.projects,
                skills: Object.keys(skillsMap).length > 0 ? skillsMap : prev.skills
            }));

        } catch (error) {
            console.error('Supabase Sync Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Preloader timer is now handled by BootSequence
    const handleBootComplete = () => {
        setLoading(false);
    };

    useEffect(() => {
        let lastScroll = 0;
        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScroll < 50) return; // Throttle to ~20fps
            lastScroll = now;

            setScrolled(window.scrollY > 50);
            const sections = ['home', 'about', 'skills', 'projects', 'experience', 'certifications', 'contact'];
            let current = 'home';
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && window.scrollY >= el.offsetTop - 200) {
                    current = id;
                }
            }
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === 'Port@26') {
            setIsAdmin(true);
            setIsLoggingIn(false);
            setPasswordInput('');
            window.scrollTo(0, 0);
        } else {
            alert('Incorrect password');
        }
    };

    const focusChatInput = () => {
        if (chatInputRef.current) {
            chatInputRef.current.focus();
            chatInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (isAdmin) {
        return <Admin data={data} onSave={setData} onExit={() => setIsAdmin(false)} />;
    }

    return (
        <>
            <CustomCursor />
            <ScrollProgress />
            
            <AnimatePresence>
                {loading && (
                    <motion.div
                        className="preloader"
                        exit={{ 
                            opacity: 0,
                            transition: { duration: 0.8, ease: "easeInOut" } 
                        }}
                    >
                        <BootSequence onComplete={handleBootComplete} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="portfolio-app">
                {data?.settings?.navLinks && <SideNav navLinks={data.settings.navLinks} activeSection={activeSection} />}

                <AnimatePresence>
                    {isLoggingIn && (
                        <motion.div
                            className="admin-login-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="admin-login-modal glass-card"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                            >
                                <h3>Admin Access</h3>
                                <form onSubmit={handlePasswordSubmit}>
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        autoFocus
                                        value={passwordInput}
                                        onChange={e => setPasswordInput(e.target.value)}
                                    />
                                    <div className="modal-actions">
                                        <button type="submit" className="btn btn-primary" style={{ padding: '10px', background: 'var(--accent-green)', borderRadius: '6px', color: '#fff', border: 'none', cursor: 'pointer' }}>Login</button>
                                        <button type="button" className="btn btn-outline" style={{ padding: '10px', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => setIsLoggingIn(false)}>Cancel</button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Navbar
                    settings={data.settings}
                    scrolled={scrolled}
                    activeSection={activeSection}
                />
                
                <main>
                    <Section id="home"><Hero data={data.hero} focusChatInput={focusChatInput} chatInputRef={chatInputRef} loading={loading} /></Section>
                    <About data={data.about} settings={data.settings} />
                    <Section id="skills"><Skills data={data.skills} settings={data.settings} /></Section>
                    <Section id="projects"><Projects settings={data.settings} customProjects={data.projects} /></Section>
                    <Section id="experience"><Experience data={data.experience} settings={data.settings} /></Section>
                    <Section id="certifications"><Certifications data={data.certifications} settings={data.settings} /></Section>
                    <Section id="contact"><Contact data={data.contact} settings={data.settings} /></Section>
                </main>
                
                <Footer settings={data.settings} data={data.contact} onAdminClick={() => setIsLoggingIn(true)} />
                <BackToTop scrolled={scrolled} />
            </div>
        </>
    );
};

// --- Side Navigation Dots ---
const SideNav = ({ navLinks, activeSection }) => {
    if (!navLinks) return null;
    return (
        <nav className="side-nav">
            {navLinks.map((link) => (
                <a
                    key={link.section}
                    href={link.href}
                    className={`side-nav-dot ${activeSection === link.section ? 'active' : ''}`}
                    aria-label={`Go to ${link.text}`}
                    onClick={(e) => {
                        e.preventDefault();
                        document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <span className="dot-label">{link.text.toLowerCase()}</span>
                    <div className="dot-circle"></div>
                </a>
            ))}
        </nav>
    );
};

// --- Navbar ---
const Navbar = ({ settings, scrolled }) => {
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    useEffect(() => {
        document.body.style.overflow = navOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [navOpen]);

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <a href="#home" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setNavOpen(false); }}>
                    <span></span>
                </a>

                <div className="nav-pill">
                    <nav className="nav-menu-desktop">
                        {settings.navLinks?.map(link => (
                            <a
                                key={link.section}
                                href={link.href}
                                className="nav-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {link.text.toLowerCase()}
                            </a>
                        ))}
                    </nav>
                </div>

                <div className="nav-actions">
                    <a 
                        href="https://drive.google.com/file/d/1YQUJ2OwS45eI9zgYpe3Q8lAh2O066iLL/view?usp=sharing" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resume-btn-pill"
                    >
                        resume ↗
                    </a>
                </div>
            </div>
        </header>
    );
};

// --- Fallback Chat Responses for Claude ---
const getFallbackChatResponse = (message) => {
    const msg = message.toLowerCase().trim();
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('greetings')) {
        return "Hi there! I'm Saketh. I'm an AI & ML Engineering student at SRM University-AP. Feel free to ask me anything about my projects, skills, or experience!";
    }
    if (msg.includes('skill') || msg.includes('languages') || msg.includes('code') || msg.includes('technologies') || msg.includes('python')) {
        return "I specialize in Python, C, C++, and JavaScript. For ML and data science, I work heavily with scikit-learn, numpy, and pandas. I'm also familiar with SQL databases, Flask, and web technologies!";
    }
    if (msg.includes('project') || msg.includes('build') || msg.includes('developed') || msg.includes('portfolio')) {
        return "My key project is an ASD (Autism Spectrum Disorder) Screening System which achieved 95% model accuracy using a Random Forest classifier. I handled severe class imbalances with SMOTE and deployed it as a real-time Flask web application. I've also built this React portfolio synced with Supabase!";
    }
    if (msg.includes('experience') || msg.includes('intern') || msg.includes('work') || msg.includes('research')) {
        return "I'm currently working as a Summer Research Intern at SRM University-AP (starting June 2025). During this internship, I built a high-accuracy machine learning pipeline for adult ASD screening and deployed it. I'm currently looking for more ML and Computer Vision internships or research roles!";
    }
    if (msg.includes('certification') || msg.includes('aws') || msg.includes('azure') || msg.includes('gcp') || msg.includes('cloud')) {
        return "I hold three major certifications: AWS Certified Cloud Practitioner, Google Cloud Professional Architect, and Microsoft Azure Fundamentals. I love working with cloud infrastructure to deploy robust machine learning systems!";
    }
    if (msg.includes('education') || msg.includes('university') || msg.includes('college') || msg.includes('srm') || msg.includes('study')) {
        return "I am pursuing my B.Tech in CSE with a specialization in AI & ML at SRM University-AP in Andhra Pradesh, India. I am highly passionate about Computer Vision, deep learning, and practical problem solving.";
    }
    if (msg.includes('contact') || msg.includes('email') || msg.includes('linkedin') || msg.includes('reach') || msg.includes('mail') || msg.includes('github')) {
        return "You can reach me at guggilamsaketh@gmail.com, or check out my LinkedIn at guggilam-leela-naga-sai-sri-saketh-326853289. My GitHub username is gsaketh2006. Let's collaborate!";
    }
    if (msg.includes('asd') || msg.includes('autism') || msg.includes('screening') || msg.includes('random forest')) {
        return "The ASD Screening System is a faculty-guided research project. Using questionnaire and demographic data, I achieved 95% accuracy using Random Forest, balancing classes with SMOTE, and deployed it as a responsive Flask app.";
    }
    if (msg.includes('status') || msg.includes('open') || msg.includes('job') || msg.includes('hire') || msg.includes('available')) {
        return "I am currently active and open to work! I'm looking for internships and full-time roles in ML, Computer Vision, or research. I can work remotely or in Andhra Pradesh, India.";
    }
    
    return "That's an interesting question! As an AI & ML Engineer focused on Computer Vision, I spend most of my time learning new techniques, training models, and deploying end-to-end systems. You can email me at guggilamsaketh@gmail.com to chat more in detail!";
};

const Hero = ({ data, focusChatInput, chatInputRef, loading }) => {
    const [nameText, setNameText] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { id: 1, sender: 'saketh', text: "Hi! I'm Saketh. Ask me anything about my AI research, engineering skills, or projects!" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const greetingText = data.greeting || "Hi, I'm";
    const nameString = (data.typingTexts && data.typingTexts.length > 0) ? data.typingTexts[0] : "Saketh";
    const fullGreeting = `${greetingText} ${nameString}`;
    
    const roleText = data.role || "AI & ML Engineer · CV Enthusiast";
    
    const nameWords = fullGreeting.split(' ');
    const roleWords = roleText.split(' ');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const wordVariants = {
        hidden: { y: 40, opacity: 0, rotateX: -45, filter: "blur(10px)" },
        visible: {
            y: 0,
            opacity: 1,
            rotateX: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 10,
                stiffness: 100
            }
        }
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, isTyping]);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        const query = chatInput.trim();
        if (!query) return;

        // Add visitor message
        const visitorMsg = { id: Date.now(), sender: 'visitor', text: query };
        const updatedHistory = [...chatHistory, visitorMsg].slice(-10); // Keep last 10 messages
        setChatHistory(updatedHistory);
        setChatInput('');
        setIsTyping(true);

        try {
            const apiKey = import.meta.env.VITE_GROQ_API_KEY;
            
            if (!apiKey) {
                // If API Key not set, fallback to simulated responder immediately
                setTimeout(() => {
                    const fallbackReply = getFallbackChatResponse(query);
                    setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'saketh', text: fallbackReply }].slice(-10));
                    setIsTyping(false);
                }, 1000);
                return;
            }

            // Standard OpenAI Messages format for Groq
            const apiMessages = updatedHistory.map(msg => ({
                role: msg.sender === 'visitor' ? 'user' : 'assistant',
                content: msg.text
            }));

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.2,
                    messages: [
                        {
                            role: 'system',
                            content: `You are Saketh, an AI & ML engineering student at SRM University-AP, Andhra Pradesh, India. Answer any question about yourself in first person, naturally and conversationally. Keep answers short (2-4 sentences max). You MUST ONLY answer questions by analyzing the following resume present in the database. DO NOT give random results or hallucinate. If you are asked something not in the resume, clearly state you don't have that information.

Here is your exact resume text to use as your knowledge base:

Guggilam Leela Naga Sai Sri Saketh
Phone: +91 9490000736 | Email: guggilamsaketh@gmail.com | Location: Guntur, AP, India

EDUCATION
SRM University, AP (Aug 2023 – Present)
B.Tech in Computer Science & Engineering (AI & ML) | CGPA : 8.77 (Till Semester 5)

EXPERIENCE
SRM University, AP — Summer Research Intern (Remote, Jun 2025 – Aug 2025)
• Developed a machine learning-based Autism Spectrum Disorder (ASD) prediction system using questionnaire and demographic data, achieving 95% accuracy and high ROC-AUC with Explainable AI (SHAP) for model interpretability.
• Implemented and deployed an end-to-end solution as a Flask web application for real-time predictions, including data preprocessing, class imbalance handling (SMOTE), and model optimization using Scikit-learn.
Tech Stack: Python, Scikit-learn, Pandas, NumPy, SHAP, SMOTE, Flask, HTML, CSS

PROJECTS
Electricity Theft Detection Using Machine Learning
• Detect abnormal electricity consumption patterns to identify potential power theft and reduce revenue losses.
• Developed an ML pipeline using statistical feature engineering and WGAN-GP for class imbalance; implemented XGBoost and LightGBM models achieving 95% accuracy and 0.97 ROC-AUC, and deployed using Flask.
• Tech Stack: Python, NumPy, Pandas, Scikit-learn, XGBoost, LightGBM, WGAN-GP, Flask, Render

Real Time UnderWater Video Enhancement with Adaptive Environment
• Underwater videos suffer from low visibility, color distortion, and varying environmental conditions, making reliable visual analysis difficult.
• Developed an adaptive real-time enhancement pipeline that detects underwater environments and applies dynamic techniques with temporal consistency and quality evaluation.
• Tech Stack: Python, OpenCV, NumPy, Image Processing techniques, Computer Vision

Last-Mile Delivery Optimization using MARL
• Traditional last-mile delivery systems struggle to efficiently handle dynamic traffic congestion, weather disruptions, and real-time order cancellations, leading to delayed deliveries and poor route optimization.
• Developed a real-time delivery optimization simulator using Multi-Agent Reinforcement Learning (MARL) with a DQN-based centralized agent for intelligent driver dispatching, dynamic rerouting, and adaptive decision-making under uncertain conditions.
• Tech Stack: Python, FastAPI, NumPy, Reinforcement Learning (DQN, Q-Learning), React, Vite, Leaflet, OSRM API, Pydantic

SKILLS
Programming Languages: Python, C, C++
CS Fundamentals: Data Structures & Algorithms, Object Oriented Programming, Operating Systems, Computer Networks
Artificial Intelligence: Machine Learning, Deep Learning
Libraries & Frameworks: NumPy, Pandas, Matplotlib, scikit-learn, TensorFlow, Flask
Data Visualization: Power BI
Version Control: Git, GitHub
Soft Skills: Problem Solving, Analytical Thinking, Communication, Team Collaboration, Time Management, Adaptability`
                        },
                        ...apiMessages
                    ]
                })
            });

            if (!response.ok) {
                throw new Error("API network failure");
            }

            const resData = await response.json();
            const reply = resData.choices[0].message.content;
            
            setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'saketh', text: reply }].slice(-10));
        } catch (err) {
            console.warn("Groq API CORS/network block, using interactive context fallback...", err);
            
            // Fallback securely and elegantly
            setTimeout(() => {
                try {
                    const fallbackReply = getFallbackChatResponse(query);
                    setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'saketh', text: fallbackReply }].slice(-10));
                } catch {
                    setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'saketh', text: "Sorry, something went wrong. Let's try again!" }]);
                }
                setIsTyping(false);
            }, 800);
            return;
        }
        setIsTyping(false);
    };

    if (!data) return null;
    return (
        <div className="container" style={{ paddingTop: '50px' }}>
            <div className="hero-grid">
                
                {/* COLUMN 1: LEFT PANEL */}
                <div className="hero-left">
                    <div className="hero-label-row">
                        <span className="hero-line"></span>
                        <span className="hero-label">hello, world</span>
                    </div>

                    <motion.h1 
                        className="hero-title-name"
                        variants={containerVariants}
                        initial="hidden"
                        animate={loading ? "hidden" : "visible"}
                        style={{ perspective: 1000 }}
                    >
                        {nameWords.map((word, i) => {
                            const isName = i === nameWords.length - 1;
                            return (
                                <motion.span 
                                    key={i} 
                                    variants={wordVariants} 
                                    whileHover={{ 
                                        scale: 1.1, 
                                        color: 'var(--accent-green-light)',
                                        y: -5
                                    }} 
                                    style={{ 
                                        display: 'inline-block', 
                                        marginRight: '0.25em', 
                                        cursor: 'default',
                                        color: isName ? 'var(--accent-green)' : 'inherit',
                                        transition: 'color 0.3s ease'
                                    }}
                                >
                                    {word}
                                </motion.span>
                            );
                        })}
                    </motion.h1>

                    <motion.div 
                        className="hero-role-mono"
                        variants={containerVariants}
                        initial="hidden"
                        animate={loading ? "hidden" : "visible"}
                        style={{ perspective: 1000 }}
                    >
                        {roleWords.map((word, i) => (
                            <motion.span 
                                key={i} 
                                variants={wordVariants} 
                                style={{ display: 'inline-block', marginRight: '0.25em' }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </motion.div>

                    <motion.p 
                        className="hero-desc-p"
                        initial={{ opacity: 0, y: 15 }}
                        animate={loading ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        style={{ whiteSpace: 'pre-wrap' }}
                    >
                        {data.description || "I build intelligent systems that see, learn, and solve real-world problems. Passionate about end-to-end ML pipelines, deep learning, and crafting elegant solutions."}
                    </motion.p>

                    <div className="hero-ctas">
                        {data.buttons?.map((btn, idx) => (
                            <motion.button 
                                key={idx}
                                className={btn.type === 'primary' ? 'btn-hero-primary' : 'btn-hero-secondary'}
                                onClick={(e) => {
                                    if (btn.href === '#chat') {
                                        focusChatInput();
                                    } else if (btn.href?.startsWith('#')) {
                                        e.preventDefault();
                                        document.querySelector(btn.href)?.scrollIntoView({ behavior: 'smooth' });
                                    } else if (btn.href) {
                                        window.open(btn.href, '_blank');
                                    }
                                }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span>{btn.text}</span>
                                {btn.icon && <i className={btn.icon} style={{ marginLeft: '6px' }}></i>}
                            </motion.button>
                        ))}
                        {(!data.buttons || data.buttons.length === 0) && (
                            <>
                                <motion.button 
                                    className="btn-hero-primary" 
                                    onClick={focusChatInput}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span>chat with me</span>
                                    <i className="fas fa-comment" style={{ marginLeft: '6px' }}></i>
                                </motion.button>
                                <motion.button 
                                    className="btn-hero-secondary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span>view projects</span>
                                </motion.button>
                            </>
                        )}
                    </div>

                    <div className="hero-social-row">
                        {data.socialLinks?.map(s => {
                            let iconClass = 'fas fa-link';
                            if (s.label.toLowerCase() === 'github') iconClass = 'fab fa-github';
                            else if (s.label.toLowerCase() === 'linkedin') iconClass = 'fab fa-linkedin-in';
                            else if (s.label.toLowerCase() === 'email') iconClass = 'fas fa-envelope';
                            
                            return (
                                <a 
                                    key={s.label} 
                                    href={s.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="hero-social-square"
                                    aria-label={s.label}
                                >
                                    <i className={iconClass}></i>
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* COLUMN 2: CENTER PANEL */}
                <div className="hero-center">
                    <motion.div 
                        className="hero-avatar-ring"
                        initial={{ opacity: 0, scale: 0.85, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        whileHover={{ scale: 1.05, rotate: 3 }}
                    >
                        <div className="hero-avatar-inner">
                            {data.avatarImage ? (
                                <img src={data.avatarImage} alt="Saketh Profile" />
                            ) : (
                                <span>S</span>
                            )}
                        </div>
                    </motion.div>

                    <motion.div 
                        className="status-pill"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        <span className="status-dot"></span>
                        <span>open to work</span>
                    </motion.div>
                </div>

                {/* COLUMN 3: CHAT PANEL */}
                <div className="hero-right">
                    <div className="chat-panel">
                        
                        <div className="chat-header">
                            <div className="chat-header-title">chat with saketh</div>
                            <div className="chat-header-subtitle">AI-powered · answers instantly</div>
                        </div>

                        <div className="chat-messages">
                            {chatHistory.map(msg => (
                                <motion.div 
                                    key={msg.id} 
                                    className={`chat-bubble ${msg.sender}`}
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                >
                                    {msg.text}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="chat-typing-bubble">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            )}
                            <div ref={chatEndRef}></div>
                        </div>

                        <form onSubmit={handleChatSubmit} className="chat-input-row">
                            <input 
                                type="text" 
                                placeholder="Ask me something..."
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                className="chat-input-field"
                                ref={chatInputRef}
                            />
                            <button type="submit" className="chat-send-btn">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>

                    </div>
                </div>

            </div>

            {/* Bottom Strip */}
            <div className="hero-bottom-strip">
                <div className="tech-tags-row">
                    <span className="tech-tag-mono">Python</span>
                    <span className="tech-tag-mono">scikit-learn</span>
                    <span className="tech-tag-mono">Flask</span>
                    <span className="tech-tag-mono">Computer Vision</span>
                    <span className="tech-tag-mono">MySQL</span>
                </div>
                <div className="scroll-hint-row">
                    <span>Scroll to explore</span>
                    <i className="fas fa-chevron-down scroll-hint-arrow"></i>
                </div>
            </div>
        </div>
    );
};

// --- Skills Section ---
const Skills = ({ data, settings }) => {
    if (!data) return null;
    const iconMap = {
        'programming languages': 'fa-code',
        'web technologies': 'fa-globe',
        'database & cloud': 'fa-database',
        'tools & analytics': 'fa-wrench',
        'libraries & frameworks': 'fa-layer-group',
        'operating systems': 'fa-desktop',
        'machine learning': 'fa-brain',
        'ai & ml': 'fa-robot',
    };

    const getIcon = (category) => {
        const lower = category.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lower.includes(key) || key.includes(lower)) return icon;
        }
        return 'fa-cubes';
    };

    return (
        <div className="container">
            <div className="section-header-wrap">
                <span className="section-label">02. skills</span>
                <h2 className="section-title">{settings.sectionTitles?.skills || 'Skills & Technologies'}</h2>
            </div>
            
            <div className="skills-grid">
                {Object.entries(data).map(([cat, skills], i) => (
                    <TiltCard key={cat} className="skill-card glass-card">
                        <div className="skill-card-header">
                            <div className="skill-icon-wrap"><i className={`fas ${getIcon(cat)}`}></i></div>
                            <h3>{cat}</h3>
                        </div>
                        <div className="skill-tags">
                            {Array.from(new Set(skills)).map((s, j) => (
                                <motion.span
                                    key={`${s}-${j}`}
                                    className="skill-tag"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: i * 0.05 + j * 0.02 }}
                                >
                                    {s}
                                </motion.span>
                            ))}
                        </div>
                    </TiltCard>
                ))}
            </div>
        </div>
    );
};

// --- Projects (GitHub API + Supabase Overrides) ---
const Projects = ({ settings, customProjects = [] }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const res = await fetch(`https://api.github.com/users/${settings.githubUsername || 'gsaketh2006'}/repos?sort=updated&per_page=100`);
                const repos = await res.json();
                
                const githubProjects = repos.filter(r => !r.fork).map(r => ({
                    name: r.name,
                    description: r.description,
                    url: r.html_url,
                    homepage: r.homepage,
                    stars: r.stargazers_count,
                    language: r.language,
                    topics: r.topics || [],
                    isGitHub: true
                }));

                const filteredCustom = customProjects
                    .filter(p => p.source === 'manual')
                    .filter(p => p.is_visible !== false)
                    .map(p => ({ ...p, isGitHub: false, topics: p.topics || [] }));

                const filteredGithub = githubProjects.filter(repo => {
                    const override = customProjects.find(p => p.name === repo.name && p.source === 'github');
                    return !override || override.is_visible !== false;
                }).map(p => ({ ...p, isGitHub: true }));

                const merged = [...filteredCustom, ...filteredGithub];
                setProjects(merged);
            } catch (e) { 
                console.error(e);
                setProjects(customProjects.filter(p => p.is_visible !== false).map(p => ({ ...p, isGitHub: false, topics: p.topics || [] })));
            }
            setLoading(false);
        };
        fetchRepos();
    }, [settings.githubUsername, customProjects]);

    const langColors = {
        Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
        CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d', C: '#555555', PHP: '#4F5D95',
        'Jupyter Notebook': '#DA5B0B', Shell: '#89e051',
    };

    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.language && p.language.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container">
            <div className="section-header-wrap">
                <span className="section-label">03. projects</span>
                <h2 className="section-title">{settings.sectionTitles?.projects || 'Featured Projects'}</h2>
            </div>

            <div className="projects-search-bar">
                <i className="fas fa-search"></i>
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
                <span className="projects-count">{filtered.length} items</span>
            </div>

            {loading ? (
                <div className="projects-list">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="project-bar glass-card" style={{ height: '80px', opacity: 0.3 }} />
                    ))}
                </div>
            ) : (
                <div className="projects-list">
                    {filtered.map((p, i) => (
                        <motion.div
                            key={p.name}
                            className="project-bar"
                            onClick={() => window.open(p.url + '#readme', '_blank')}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                        >
                            <div className="project-bar-body">
                                <div className="project-bar-top">
                                    <div className="project-bar-title-wrap">
                                        <h3>{p.name.replace(/-/g, ' ')}</h3>
                                        {p.language && (
                                            <span className="project-language">
                                                <span className="lang-dot" style={{ background: langColors[p.language] || '#8b8b8b' }}></span>
                                                {p.language}
                                            </span>
                                        )}
                                    </div>
                                    <div className="project-bar-actions">
                                        {p.homepage && (
                                            <a
                                                href={p.homepage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="project-action-btn primary"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <i className="fas fa-external-link-alt"></i> demo
                                            </a>
                                        )}
                                        <a
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="project-action-btn secondary"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <i className="fab fa-github"></i> github
                                        </a>
                                    </div>
                                </div>
                                <div className="project-bar-expandable" style={{ maxHeight: 'none', opacity: 1, marginTop: '12px' }}>
                                    {p.description && <p>{p.description}</p>}
                                    {p.topics && p.topics.length > 0 && (
                                        <div className="project-bar-topics">
                                            {p.topics.map(t => <span key={t} className="project-topic-tag">{t}</span>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            <i className="fas fa-search" style={{ fontSize: '1.5rem', marginBottom: '12px' }}></i>
                            <p>No projects match your search.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Experience ---
const Experience = ({ data, settings }) => {
    if (!data) return null;
    return (
        <div className="container">
            <div className="section-header-wrap">
                <span className="section-label">04. experience</span>
                <h2 className="section-title">{settings.sectionTitles?.experience || 'Experience'}</h2>
            </div>
            
            <div className="timeline">
                {data.map((exp, i) => (
                    <motion.div
                        key={i}
                        className="timeline-item"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <div className="timeline-marker"><i className={`fas ${exp.icon || 'fa-briefcase'}`}></i></div>
                        <div className="timeline-content">
                            <span className="timeline-date">{exp.date}</span>
                            <h3>{exp.title}</h3>
                            <h4>{exp.company}</h4>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                            {exp.achievements && (
                                <ul className="timeline-achievements">
                                    {exp.achievements.map((a, j) => <li key={j}>{a}</li>)}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Certifications ---
const Certifications = ({ data, settings }) => {
    if (!data) return null;
    return (
        <div className="container">
            <div className="section-header-wrap">
                <span className="section-label">05. certifications</span>
                <h2 className="section-title">{settings.sectionTitles?.certifications || 'Certifications'}</h2>
            </div>

            <div className="certs-grid">
                {data.map((cert, i) => (
                    <TiltCard
                        key={i}
                        className="cert-card"
                        onClick={() => window.open(cert.credentialUrl, '_blank')}
                    >
                        <div className="cert-card-image" style={{ borderBottom: `2px solid ${cert.color || 'var(--accent-green)'}` }}>
                            <CertImage src={cert.image} alt={cert.title} color={cert.color} />
                        </div>
                        <div className="cert-card-body">
                            <h3>{cert.title}</h3>
                            <span className="cert-card-org">{cert.organization}</span>
                            {cert.issueDate && <span className="cert-card-date"><i className="fas fa-calendar-alt"></i> {cert.issueDate}</span>}
                            <a href={cert.credentialUrl} target="_blank" className="cert-card-link" onClick={e => e.stopPropagation()} rel="noopener noreferrer">view credential <i className="fas fa-external-link-alt"></i></a>
                        </div>
                    </TiltCard>
                ))}
            </div>
        </div>
    );
};

const CertImage = ({ src, alt, color }) => {
    const [error, setError] = useState(false);
    
    useEffect(() => {
        setError(false);
    }, [src]);

    if (error || !src) {
        return (
            <div className="cert-image-fallback" style={{ background: `linear-gradient(135deg, ${color || 'var(--accent-green)'}, transparent)` }}>
                <i className="fas fa-certificate"></i>
                <span style={{ fontSize: '0.75rem', marginTop: '6px', opacity: 0.8 }}>{alt}</span>
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            loading="lazy" 
            onError={() => setError(true)} 
        />
    );
};

// --- Contact ---
const Contact = ({ data, settings }) => {
    if (!data) return null;
    return (
        <div className="container">
            <div className="section-header-wrap">
                <span className="section-label">06. contact</span>
                <h2 className="section-title">{settings.sectionTitles?.contact || 'Get In Touch'}</h2>
            </div>

            <div className="contact-wrap">
                <div className="contact-intro">
                    <h3>{data.heading || "Let's Work Together"}</h3>
                    <p>{data.description || "I'm always open to discussing new projects, creative ideas, or opportunities."}</p>
                </div>
                <div className="contact-cards">
                    {[data.email, data.phone, data.location].filter(Boolean).map(item => (
                        <div key={item.label} className="contact-card">
                            <i className={item.icon}></i>
                            <h4>{item.label}</h4>
                            {item.link ? (
                                <a href={item.link}>{item.value}</a>
                            ) : (
                                <p>{item.value}</p>
                            )}
                        </div>
                    ))}
                </div>
                {data.socialLinks?.length > 0 && (
                    <div className="contact-socials">
                        {data.socialLinks.map(s => (
                            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.ariaLabel || s.platform}>
                                <i className={s.icon}></i>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Footer ---
const Footer = ({ settings, data, onAdminClick }) => (
    <footer className="footer">
        <div className="container">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="footer-logo">saketh_</div>
                    <p className="footer-tagline">Building intelligent systems that solve real-world problems.</p>
                    <div className="footer-cta-motion">
                        <button className="btn" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}>
                            start a project
                        </button>
                    </div>
                </div>
                <div className="footer-nav">
                    <h4>quick links</h4>
                    <div className="footer-nav-links">
                        {settings.navLinks?.slice(0, 4).map(link => (
                            <a key={link.section} href={link.href} onClick={(e) => {
                                e.preventDefault();
                                document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                            }}>{link.text.toLowerCase()}</a>
                        ))}
                    </div>
                </div>
                <div className="footer-social">
                    <h4>connect</h4>
                    <div className="footer-links">
                        {data?.socialLinks?.map(s => (
                            <a 
                                key={s.platform} 
                                href={s.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={s.platform}
                            >
                                <i className={s.icon}></i>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>{settings.footer?.text} · © {settings.footer?.year || new Date().getFullYear()}</p>
                <button className="admin-secret-link" onClick={onAdminClick}>admin</button>
            </div>
        </div>
    </footer>
);

// --- Back to Top ---
const BackToTop = ({ scrolled }) => (
    <button
        className={`back-to-top ${scrolled ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
    >
        <i className="fas fa-chevron-up"></i>
    </button>
);

export default App;
