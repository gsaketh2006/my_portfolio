import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { initialData } from './initialData';
import Admin from './Admin';
import About from './components/About/About';
import { supabase } from './lib/supabase';



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

const Magnetic = ({ children, strength = 0.35 }) => {
    const ref = useRef(null);
    const { x, y } = useMagnetic(ref, strength);
    return (
        <motion.div ref={ref} style={{ x, y, display: 'inline-block' }}>
            {children}
        </motion.div>
    );
};

// --- Motion Components ---
const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
    const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });
    const [isHovered, setIsHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsTouchDevice(isTouch);
        if (isTouch) return;

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

    if (isTouchDevice) return null;

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



const TiltCard = ({ children, className, maxRotate = 10, ...props }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [maxRotate, -maxRotate]);
    const rotateY = useTransform(x, [-100, 100], [-maxRotate, maxRotate]);
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
            {...props}
            style={{ 
                rotateX: springX, 
                rotateY: springY, 
                perspective: 1000,
                ...props.style 
            }}
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
        initial={{ opacity: 0, y: 50, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
// loading state removed (previously const [loading, setLoading] = useState(true);

    const chatInputRef = useRef(null);

    const fetchData = async () => {
        try {
// Loading handled by derived state
            
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
            // setLoading removed as loading state no longer used
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const sections = ['home','about','skills','projects','experience','certifications','contact'];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { threshold: 0.3 }
        );
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
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
                    <Section id="home"><Hero data={data.hero} focusChatInput={focusChatInput} chatInputRef={chatInputRef} /></Section>
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
const Navbar = ({ settings, scrolled, activeSection }) => {
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
        <motion.header 
            className={`navbar ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className="nav-container">
                <a href="#home" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setNavOpen(false); }}>
                    <span>{settings.siteName || 'Saketh'}</span>
                </a>

                <div className="nav-pill">
                    <nav className="nav-menu-desktop">
                        {settings.navLinks?.map(link => (
                            <a
                                key={link.section}
                                href={link.href}
                                className={`nav-link ${activeSection === link.section ? 'active' : ''}`}
                                style={activeSection === link.section ? { color: 'var(--accent-green)', position: 'relative' } : { position: 'relative' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {link.text.toLowerCase()}
                                {activeSection === link.section && (
                                    <motion.span 
                                        layoutId="navIndicator"
                                        className="nav-active-bar"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        style={{ 
                                            position: 'absolute', 
                                            bottom: '-4px', 
                                            left: 0, 
                                            right: 0, 
                                            height: '2px', 
                                            background: 'linear-gradient(90deg, var(--accent-green), var(--accent-green-light))', 
                                            borderRadius: '2px',
                                            boxShadow: '0 0 8px var(--accent-green-light)'
                                        }}
                                    />
                                )}
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
                        resume <i className="fas fa-download resume-icon ml-1" style={{ fontSize: '0.75rem' }}></i>
                    </a>
                    <button 
                        className="nav-hamburger" 
                        onClick={() => setNavOpen(!navOpen)}
                        aria-label="Toggle navigation"
                    >
                        <span className={`hamburger-line ${navOpen ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${navOpen ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${navOpen ? 'open' : ''}`}></span>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {navOpen && (
                    <motion.nav
                        className="nav-mobile-menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {settings.navLinks?.map(link => (
                            <a
                                key={link.section}
                                href={link.href}
                                className="nav-mobile-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setNavOpen(false);
                                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {link.text.toLowerCase()}
                            </a>
                        ))}
                        <a 
                            href="https://drive.google.com/file/d/1YQUJ2OwS45eI9zgYpe3Q8lAh2O066iLL/view?usp=sharing" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-mobile-link resume-mobile"
                        >
                            resume ↗
                        </a>
                    </motion.nav>
                )}
            </AnimatePresence>
        </motion.header>
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

// --- Text Scramble Animation helper for RoleCycler ---
const ScrambleText = ({ text }) => {
    const [displayedText, setDisplayedText] = useState(text);
    const currentRef = useRef(text);
    const chars = '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';

    useEffect(() => {
        let active = true;
        let frame = 0;
        const queue = [];
        
        const target = text;
        const current = currentRef.current;
        const length = Math.max(current.length, target.length);
        
        for (let i = 0; i < length; i++) {
            const from = current[i] || '';
            const to = target[i] || '';
            const start = Math.floor(Math.random() * 12);
            const end = start + Math.floor(Math.random() * 12) + 8;
            queue.push({ from, to, start, end, char: from });
        }
        
        const update = () => {
            let complete = true;
            let output = '';
            
            for (let i = 0; i < queue.length; i++) {
                let { from, to, start, end, char } = queue[i];
                if (frame >= end) {
                    output += to;
                } else if (frame >= start) {
                    complete = false;
                    if (Math.random() < 0.28) {
                        char = chars[Math.floor(Math.random() * chars.length)];
                        queue[i].char = char;
                    }
                    output += char;
                } else {
                    complete = false;
                    output += from;
                }
            }
            
            if (active) {
                setDisplayedText(output);
            }
            
            if (!complete && active) {
                frame++;
                requestAnimationFrame(update);
            } else if (complete && active) {
                currentRef.current = target;
            }
        };
        
        update();
        return () => {
            active = false;
        };
    }, [text]);

    return <span>{displayedText}</span>;
};

const RoleCycler = ({ roles }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % roles.length);
        }, 3600);
        return () => clearInterval(interval);
    }, [roles.length]);

    return (
        <motion.div 
            className="hero-role-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
        >
            <span className="role-bracket">&lt;&nbsp;</span>
            <span className="hero-role-mono">
                <ScrambleText text={roles[currentIndex]} />
            </span>
            <span className="role-bracket">&nbsp;/&gt;</span>
            <motion.span 
                key={currentIndex} 
                className="role-bg-highlight"
                initial={{ opacity: 0.5, scale: 0.9 }}
                animate={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            />
        </motion.div>
    );
};

const HERO_ROLES = ['AI & ML Engineer', 'Computer Vision Developer', 'Research Intern @ SRM AP', 'Python Developer', 'Problem Solver'];

const Hero = ({ data, focusChatInput, chatInputRef }) => {
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { id: 1, sender: 'saketh', text: "Hi! I'm Saketh. Ask me anything about my AI research, engineering skills, or projects!" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const chatEndRef = useRef(null);

    // Initial check for mobile viewport to minimize chat widget
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsMinimized(true);
        }
    }, []);

    const greetingText = "Hi, I'm";
    const nameString = "Saketh";
    const fullNameString = (data.typingTexts && data.typingTexts.length > 0) ? data.typingTexts[0] : "G.L.N.S.S. Saketh";
    
    // Separate greeting and name for two-line display
    const greetingChars = Array.from(greetingText);
    const nameChars = Array.from(nameString);
    const totalChars = greetingChars.length + 1 + nameChars.length; // +1 for space/newline

    const [typedIndex, setTypedIndex] = useState(0);

    useEffect(() => {
        setTypedIndex(0);
        const startTimeout = setTimeout(() => {
            setTypedIndex(1);
        }, 400);
        return () => clearTimeout(startTimeout);
    }, [totalChars]);

    useEffect(() => {
        if (typedIndex === 0 || typedIndex >= totalChars) return;

        const timer = setTimeout(() => {
            setTypedIndex(prev => prev + 1);
        }, 50 + Math.random() * 40);

        return () => clearTimeout(timer);
    }, [typedIndex, totalChars]);



    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const canvasRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const mouse = { x: null, y: null };
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

        const dotCount = isMobile ? 25 : 60;
        const dots = Array.from({ length: dotCount }).map(() => {
            const vx = (Math.random() - 0.5) * 0.8;
            const vy = (Math.random() - 0.5) * 0.8;
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx,
                vy,
                baseVx: vx,
                baseVy: vy,
                radius: 1.2 + Math.random() * 2,
                opacity: 0.15 + Math.random() * 0.2
            };
        });

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < dots.length; i++) {
                let dot = dots[i];
                
                // Mouse magnetic pull effect (velocity-based, returns to base velocity)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - dot.x;
                    const dy = mouse.y - dot.y;
                    const distToMouse = Math.hypot(dx, dy);
                    if (distToMouse < 160) {
                        const force = (160 - distToMouse) / 160;
                        dot.vx += (dx / distToMouse) * force * 0.08;
                        dot.vy += (dy / distToMouse) * force * 0.08;
                    }
                }
                
                // Return velocity back to base velocity slowly
                dot.vx += (dot.baseVx - dot.vx) * 0.03;
                dot.vy += (dot.baseVy - dot.vy) * 0.03;
                
                dot.x += dot.vx;
                dot.y += dot.vy;
                
                if (dot.x < 0 || dot.x > canvas.width) {
                    dot.vx *= -1;
                    dot.baseVx *= -1;
                }
                if (dot.y < 0 || dot.y > canvas.height) {
                    dot.vy *= -1;
                    dot.baseVy *= -1;
                }
                
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(29, 158, 117, ${dot.opacity})`;
                ctx.fill();

                // Connect cursor to nearby dots
                if (mouse.x !== null && mouse.y !== null) {
                    const dist = Math.hypot(dot.x - mouse.x, dot.y - mouse.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(29, 158, 117, ${(120 - dist) / 120 * 0.25})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                // Connect dot to other nearby dots
                for (let j = i + 1; j < dots.length; j++) {
                    let dot2 = dots[j];
                    const dist = Math.hypot(dot.x - dot2.x, dot.y - dot2.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(dot2.x, dot2.y);
                        ctx.strokeStyle = `rgba(29, 158, 117, ${(120 - dist) / 120 * 0.08})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (canvas.parentElement) {
                canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [isMobile]);

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
        <div className="container" style={{ paddingTop: '50px', position: 'relative' }}>
            <canvas ref={canvasRef} className="hero-particles" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
            
            {/* Ambient Background Glow Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="hero-bg-blob blob-teal"></div>
                <div className="hero-bg-blob blob-blue"></div>
                <div className="hero-bg-blob blob-emerald"></div>
            </div>

            <div className="hero-grid">
                
                {/* COLUMN 1: LEFT PANEL */}
                <div className="hero-left">
 
                     <motion.h1 
                         className="hero-title-name"
                         style={{ perspective: 1000 }}
                     >
                         {/* Line 1: Greeting */}
                         <div className="hero-greeting-line">
                             {greetingChars.slice(0, Math.min(typedIndex, greetingChars.length)).map((char, i) => (
                                 <motion.span 
                                     key={`g-${i}`}
                                     initial={{ opacity: 0, y: -8 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ duration: 0.12 }}
                                     className="hero-greeting-char"
                                 >
                                     {char}
                                 </motion.span>
                             ))}
                             {typedIndex >= greetingChars.length && (
                                 <motion.span
                                     className="hero-wave-emoji inline-block ml-2"
                                     animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                                     transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                     style={{ transformOrigin: '70% 70%', display: 'inline-block' }}
                                 >
                                     👋
                                 </motion.span>
                             )}
                         </div>
                         {/* Line 2: Name (shown after greeting is done) */}
                         <div className="hero-name-line">
                             {typedIndex > greetingChars.length && nameChars.slice(0, typedIndex - greetingChars.length - 1).map((char, i) => (
                                 <motion.span 
                                     key={`n-${i}`}
                                     initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                     animate={{ opacity: 1, scale: 1, y: 0 }}
                                     transition={{ duration: 0.14 }}
                                     whileHover={{ 
                                         scale: 1.12, 
                                         y: -4
                                     }} 
                                     style={{ 
                                         display: 'inline-block', 
                                         whiteSpace: 'pre',
                                         cursor: 'default',
                                     }}
                                 >
                                     {char}
                                 </motion.span>
                             ))}
                             <span className="terminal-cursor" style={{ WebkitTextFillColor: 'var(--accent-green-light)', color: 'var(--accent-green-light)' }}>▋</span>
                         </div>
 
                         {/* Full name subtitle line directly beneath the main name */}
                         <motion.div 
                             className="hero-fullname-subtitle"
                             initial={{ opacity: 0, y: 8 }}
                             animate={{ opacity: typedIndex >= totalChars ? 0.65 : 0, y: typedIndex >= totalChars ? 0 : 8 }}
                             transition={{ duration: 0.6, ease: "easeOut" }}
                         >
                             {fullNameString}
                         </motion.div>
                     </motion.h1>

                    <RoleCycler roles={HERO_ROLES} />

                    <motion.p 
                        className="hero-desc-p"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        style={{ whiteSpace: 'pre-wrap' }}
                    >
                        {data.description || "I build intelligent systems that see, learn, and solve real-world problems. Passionate about end-to-end ML pipelines, deep learning, and crafting elegant solutions."}
                    </motion.p>

                    <motion.div 
                        className="hero-ctas"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        {data.buttons?.map((btn, idx) => {
                            const isPrimary = btn.text.toLowerCase().includes('project');
                            const btnClassName = isPrimary ? 'btn-hero-primary' : 'btn-hero-secondary';
                            const hoverScale = isPrimary ? 1.03 : 1.05;
                            return (
                                <motion.button 
                                    key={idx}
                                    className={btnClassName}
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
                                    whileHover={{ scale: hoverScale, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <span>{btn.text}</span>
                                    {btn.icon && <i className={btn.icon} style={{ marginLeft: '6px' }}></i>}
                                </motion.button>
                            );
                        })}
                        {(!data.buttons || data.buttons.length === 0) && (
                            <>
                                <motion.button 
                                    className="btn-hero-primary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <span>view projects</span>
                                    <i className="fas fa-code" style={{ marginLeft: '6px' }}></i>
                                </motion.button>
                                <motion.button 
                                    className="btn-hero-secondary" 
                                    onClick={focusChatInput}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <span>chat with me</span>
                                    <i className="fas fa-comment" style={{ marginLeft: '6px' }}></i>
                                </motion.button>
                            </>
                        )}
                    </motion.div>

                    <motion.div 
                        className="hero-social-row"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                    >
                        {data.socialLinks?.map((s, idx) => {
                            let iconClass = 'fas fa-link';
                            if (s.label.toLowerCase() === 'github') iconClass = 'fab fa-github';
                            else if (s.label.toLowerCase() === 'linkedin') iconClass = 'fab fa-linkedin-in';
                            else if (s.label.toLowerCase() === 'email') iconClass = 'fas fa-envelope';
                            
                            return (
                                <Magnetic key={s.label} strength={0.4}>
                                    <motion.a 
                                        href={s.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hero-social-square"
                                        data-tooltip={s.label.toLowerCase()}
                                        aria-label={s.label}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.0 + idx * 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                                        whileHover={{ scale: 1.2, rotate: -8 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <i className={iconClass}></i>
                                    </motion.a>
                                </Magnetic>
                            );
                        })}
                    </motion.div>
                </div>

                {/* COLUMN 2: CENTER PANEL */}
                <div className="hero-center">
                    <motion.div 
                        className="hero-avatar-ring"
                        initial={{ opacity: 0, scale: 0.85, rotate: -10, y: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -12, 0] }}
                        transition={{ 
                            default: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
                        }}
                        whileHover={{ scale: 1.05, rotate: 3 }}
                    >
                        <div className="hero-avatar-inner" style={{ position: 'relative' }}>
                            {data.avatarImage ? (
                                <>
                                    <img src={data.avatarImage} alt="Saketh Profile" />
                                    <div className="avatar-vignette"></div>
                                </>
                            ) : (
                                <>
                                    <span>S</span>
                                    <div className="avatar-vignette"></div>
                                </>
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

                    {/* Floating Code Snippet Widget */}
                    <motion.div 
                        className="floating-code-widget"
                        initial={{ opacity: 0, y: 35, scale: 0.94, rotate: -3 }}
                        animate={{ 
                            opacity: 1, 
                            y: [35, 0, 8, 0], 
                            scale: [0.94, 1, 1, 1], 
                            rotate: [-3, -3, -1, -3] 
                        }}
                        transition={{ 
                            opacity: { duration: 0.8, ease: "easeOut", delay: 0.7 },
                            y: {
                                duration: 6,
                                times: [0, 0.15, 0.5, 1],
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1.5
                            },
                            rotate: {
                                duration: 6,
                                times: [0, 0.15, 0.5, 1],
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1.5
                            },
                            scale: { duration: 0.8, ease: "easeOut", delay: 0.7 }
                        }}
                        whileHover={{ scale: 1.05, rotate: 1 }}
                    >
                        <div className="widget-header">
                            <span className="dot dot-red"></span>
                            <span className="dot dot-yellow"></span>
                            <span className="dot dot-green"></span>
                            <span className="widget-title">developer.json</span>
                        </div>
                        <pre className="widget-code">
                            <code>
                                <span className="code-punctuation">{'{'}</span>
                                <br />
                                <span className="code-key">&nbsp;&nbsp;"name"</span>
                                <span className="code-punctuation">: </span>
                                <span className="code-value">"Saketh"</span>
                                <span className="code-punctuation">,</span>
                                <br />
                                <span className="code-key">&nbsp;&nbsp;"role"</span>
                                <span className="code-punctuation">: </span>
                                <span className="code-value">"ML Engineer"</span>
                                <span className="code-punctuation">,</span>
                                <br />
                                <span className="code-key">&nbsp;&nbsp;"focus"</span>
                                <span className="code-punctuation">: </span>
                                <span className="code-value">"AI & CV"</span>
                                <br />
                                <span className="code-punctuation">{'}'}</span>
                            </code>
                        </pre>
                    </motion.div>
                </div>

                {/* COLUMN 3: CHAT PANEL */}
                <motion.div 
                    className="hero-right"
                    initial={{ opacity: 0, x: 40, rotateY: 15 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, type: "spring", damping: 15 }}
                    style={{ perspective: 1000 }}
                >
                    <TiltCard 
                        className="chat-panel"
                        maxRotate={isMinimized ? 1 : 4}
                        animate={{ height: isMinimized ? '60px' : '380px' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="chat-scanlines"></div>
                        <div 
                            className="chat-header"
                            onClick={() => isMinimized && setIsMinimized(false)}
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                cursor: isMinimized ? 'pointer' : 'default'
                            }}
                        >
                            <div>
                                <div className="chat-header-title-wrap">
                                    <span className="chat-status-led"></span>
                                    <div className="chat-header-title">Know about Saketh</div>
                                </div>
                                <div className="chat-header-subtitle">AI-powered · answers instantly</div>
                            </div>
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMinimized(!isMinimized);
                                }}
                                className="chat-minimize-btn"
                                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                            >
                                <i className={isMinimized ? "fas fa-plus" : "fas fa-minus"}></i>
                            </button>
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
                                disabled={isMinimized}
                            />
                            <motion.button 
                                type="submit" 
                                className="chat-send-btn"
                                whileHover={{ scale: 1.1, x: 2 }}
                                whileTap={{ scale: 0.85, rotate: 15 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                disabled={isMinimized}
                            >
                                <i className="fas fa-paper-plane"></i>
                            </motion.button>
                        </form>
                    </TiltCard>
                </motion.div>

            </div>

            {/* Bottom Strip */}
            <motion.div 
                className="hero-bottom-strip"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
            >
                <div className="tech-tags-scroll-wrap" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                    <motion.div 
                        style={{ display: 'inline-block' }}
                        animate={{ x: ['0%', '-50%'] }} 
                        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
                    >
                        {[
                            ...[
                                { name: 'Python', icon: 'fab fa-python' },
                                { name: 'scikit-learn', icon: 'fas fa-brain' },
                                { name: 'Flask', icon: 'fas fa-pepper-hot' },
                                { name: 'Computer Vision', icon: 'fas fa-eye' },
                                { name: 'MySQL', icon: 'fas fa-database' }
                            ],
                            ...[
                                { name: 'Python', icon: 'fab fa-python' },
                                { name: 'scikit-learn', icon: 'fas fa-brain' },
                                { name: 'Flask', icon: 'fas fa-pepper-hot' },
                                { name: 'Computer Vision', icon: 'fas fa-eye' },
                                { name: 'MySQL', icon: 'fas fa-database' }
                            ]
                        ].map((tag, i) => (
                            <span 
                                key={`${tag.name}-${i}`} 
                                className="tech-tag-mono"
                                style={{ display: 'inline-block', marginRight: '16px' }}
                            >
                                <i className={tag.icon} style={{ marginRight: '6px' }}></i>
                                {tag.name}
                            </span>
                        ))}
                    </motion.div>
                </div>
                <motion.div 
                    className="scroll-hint-row"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span>Scroll to explore</span>
                    <i className="fas fa-chevron-down scroll-hint-arrow"></i>
                </motion.div>
            </motion.div>
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
            <motion.div 
                className="section-header-wrap"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <span className="section-label">02. skills</span>
                <h2 className="section-title">{settings.sectionTitles?.skills || 'Skills & Technologies'}</h2>
            </motion.div>
            
            <div className="skills-grid">
                {Object.entries(data).map(([cat, skills], i) => (
                    <motion.div
                        key={cat}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                    <TiltCard className="skill-card glass-card">
                        <div className="skill-card-header">
                            <motion.div 
                                className="skill-icon-wrap"
                                whileHover={{ rotate: [0, 360] }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                            >
                                <i className={`fas ${getIcon(cat)}`}></i>
                            </motion.div>
                            <h3>{cat}</h3>
                        </div>
                        <div className="skill-tags">
                            {Array.from(new Set(skills)).map((s, j) => (
                                <motion.span
                                    key={`${s}-${j}`}
                                    className="skill-tag"
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 15, delay: i * 0.08 + j * 0.03 }}
                                    whileHover={{ scale: 1.08, y: -2 }}
                                >
                                    {s}
                                </motion.span>
                            ))}
                        </div>
                    </TiltCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Projects (GitHub API + Supabase Overrides) ---
const Projects = ({ settings, customProjects = [] }) => {
    const [projects, setProjects] = useState([]);
// const [loading, setLoading] = useState(true); // Loading handled by bootComplete && dataLoaded
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
            <motion.div 
                className="section-header-wrap"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <span className="section-label">03. projects</span>
                <h2 className="section-title">{settings.sectionTitles?.projects || 'Featured Projects'}</h2>
            </motion.div>

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

            <div className="projects-list">
                    {filtered.map((p, i) => (
                        <motion.div
                            key={p.name}
                            className="project-bar"
                            onClick={() => window.open(p.url + '#readme', '_blank')}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30, y: 10 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ x: 6 }}
                        >
                            <div className="project-bar-body">
                                <div className="project-bar-top">
                                    <div className="project-bar-title-wrap">
                                        <h3>{p.name.replace(/-/g, ' ')}</h3>
                                        {p.language && (
                                            <motion.span 
                                                className="project-language"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <span className="lang-dot" style={{ background: langColors[p.language] || '#8b8b8b' }}></span>
                                                {p.language}
                                            </motion.span>
                                        )}
                                    </div>
                                    <div className="project-bar-actions">
                                        {p.homepage && (
                                            <motion.a
                                                href={p.homepage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="project-action-btn primary"
                                                onClick={(e) => e.stopPropagation()}
                                                whileHover={{ scale: 1.05, y: -1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <i className="fas fa-external-link-alt"></i> demo
                                            </motion.a>
                                        )}
                                        <motion.a
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="project-action-btn secondary"
                                            onClick={(e) => e.stopPropagation()}
                                            whileHover={{ scale: 1.05, y: -1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className="fab fa-github"></i> github
                                        </motion.a>
                                    </div>
                                </div>
                                <div className="project-bar-expandable" style={{ maxHeight: 'none', opacity: 1, marginTop: '12px' }}>
                                    {p.description && <p>{p.description}</p>}
                                    {p.topics && p.topics.length > 0 && (
                                        <div className="project-bar-topics">
                                            {p.topics.map(t => (
                                                <motion.span 
                                                    key={t} 
                                                    className="project-topic-tag"
                                                    whileHover={{ scale: 1.1, y: -1 }}
                                                >
                                                    {t}
                                                </motion.span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <motion.div 
                            style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <i className="fas fa-search" style={{ fontSize: '1.5rem', marginBottom: '12px' }}></i>
                            <p>No projects match your search.</p>
                        </motion.div>
                    )}
                </div>
        </div>
    );
};

// --- Experience ---
const Experience = ({ data, settings }) => {
    if (!data) return null;
    return (
        <div className="container">
            <motion.div 
                className="section-header-wrap"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <span className="section-label">04. experience</span>
                <h2 className="section-title">{settings.sectionTitles?.experience || 'Experience'}</h2>
            </motion.div>
            
            <div className="timeline" style={{ position: 'relative' }}>
                <motion.div
                    style={{ position: 'absolute', left: '20px', top: 0, width: '2px', background: 'var(--accent-green)', originY: 0 }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
                {data.map((exp, i) => (
                    <motion.div
                        key={i}
                        className="timeline-item"
                        initial={{ opacity: 0, x: -30, y: 15 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
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
            <motion.div 
                className="section-header-wrap"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <span className="section-label">05. certifications</span>
                <h2 className="section-title">{settings.sectionTitles?.certifications || 'Certifications'}</h2>
            </motion.div>

            <div className="certs-grid" style={{ perspective: 1000 }}>
                {data.map((cert, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
                        whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                    <TiltCard
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
                    </motion.div>
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
            <motion.div 
                className="section-header-wrap"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <span className="section-label">06. contact</span>
                <h2 className="section-title">{settings.sectionTitles?.contact || 'Get In Touch'}</h2>
            </motion.div>

            <div className="contact-wrap">
                <motion.div 
                    className="contact-intro"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h3>{data.heading || "Let's Work Together"}</h3>
                    <p>{data.description || "I'm always open to discussing new projects, creative ideas, or opportunities."}</p>
                </motion.div>
                <div className="contact-cards">
                    {[data.email, data.phone, data.location].filter(Boolean).map((item, idx) => (
                        <motion.div 
                            key={item.label} 
                            className="contact-card"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.i 
                                className={item.icon}
                                whileHover={{ scale: 1.2, rotate: 10 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            ></motion.i>
                            <h4>{item.label}</h4>
                            {item.link ? (
                                <a href={item.link}>{item.value}</a>
                            ) : (
                                <p>{item.value}</p>
                            )}
                        </motion.div>
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
    <motion.footer 
        className="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
    >
        <div className="footer-wave-divider">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
            </svg>
        </div>
        <div className="container">
            <div className="footer-content">
                <motion.div 
                    className="footer-brand"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="footer-logo">saketh_</div>
                    <p className="footer-tagline">Building intelligent systems that solve real-world problems.</p>
                    <div className="footer-cta-motion">
                        <motion.button 
                            className="btn" 
                            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            start a project
                        </motion.button>
                    </div>
                </motion.div>
                <motion.div 
                    className="footer-nav"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h4>quick links</h4>
                    <div className="footer-nav-links">
                        {settings.navLinks?.slice(0, 4).map(link => (
                            <a key={link.section} href={link.href} onClick={(e) => {
                                e.preventDefault();
                                document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                            }}>{link.text.toLowerCase()}</a>
                        ))}
                    </div>
                </motion.div>
                <motion.div 
                    className="footer-social"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h4>connect</h4>
                    <div className="footer-links">
                        {data?.socialLinks?.map((s, idx) => (
                            <motion.a 
                                key={s.platform} 
                                href={s.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={s.platform}
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.2 + idx * 0.08 }}
                                whileHover={{ scale: 1.15, rotate: -5, y: -3 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <i className={s.icon}></i>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
            </div>
            <motion.div 
                className="footer-bottom"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <p>{settings.footer?.text} · © {settings.footer?.year || new Date().getFullYear()}</p>
                <button className="admin-secret-link" onClick={onAdminClick}>admin</button>
            </motion.div>
        </div>
    </motion.footer>
);

// --- Back to Top ---
const BackToTop = ({ scrolled }) => (
    <AnimatePresence>
        {scrolled && (
            <motion.button
                className="back-to-top visible"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.15, y: -3, boxShadow: '0 6px 20px rgba(29,158,117,0.4)' }}
                whileTap={{ scale: 0.9 }}
            >
                <i className="fas fa-chevron-up"></i>
            </motion.button>
        )}
    </AnimatePresence>
);

export default App;
