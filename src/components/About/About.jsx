import React from 'react';
import { motion } from 'framer-motion';
import './About.css';
import Description from './Description';
import GithubContributionGrid from '../GithubContributionGrid';
import LeetCodeContributionGrid from '../LeetCodeContributionGrid';

const About = ({ data, settings }) => {
    if (!data) return null;

    return (
        <motion.section 
            className="about-section" 
            id="about"
            initial={{ opacity: 0, y: 50, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="container" id="about-container">
                <motion.div 
                    className="section-header-wrap"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="section-label">{"01. about"}</span>
                    <h2 className="section-title">{settings.sectionTitles?.about || "About Me"}</h2>
                </motion.div>

                <div className="about-grid-wrapper">
                    {/* Part 1: Description */}
                    <div className="about-main-content">
                        <Description 
                            title={data.title} 
                            description={data.description} 
                        />
                    </div>

                    {/* Part 3: GitHub Contributors Section & Activity Grids */}
                    <div className="about-activity-content">
                        {data.showGithubGrid && (
                            <GithubContributionGrid
                                username={settings.githubUsername}
                            />
                        )}

                        {data.showLeetcodeGrid && (
                            <LeetCodeContributionGrid
                                username={settings.leetcodeUsername}
                            />
                        )}
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default React.memo(About);
