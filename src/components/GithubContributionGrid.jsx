import React from 'react';
import { motion } from 'framer-motion';

const GithubContributionGrid = ({ username, theme = 'dark' }) => {
    if (!username) return null;

    // The ghchart.rshah.org API allows color customization via query params
    // For a dark theme, we'll use a nice green/lavender combo if possible, 
    // or just let it use the default which usually looks okay on dark.
    // However, the user asked for consistency with the UI.
    const chartUrl = `https://ghchart.rshah.org/0EA5E9/${username}`;

    return (
        <motion.div
            className="github-contribution-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="github-grid-link glass-card"
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px hsl(var(--primary) / 0.15)' }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="grid-header">
                    <i className="fab fa-github"></i>
                    <span>GitHub Contributions</span>
                </div>
                <div className="grid-image-container">
                    <img
                        src={chartUrl}
                        alt={`${username}'s GitHub contribution grid`}
                        className="github-grid-img"
                        loading="lazy"
                    />
                </div>
                <div className="grid-footer">
                    <span>Click to view profile</span>
                </div>
            </motion.a>
        </motion.div>
    );
};

export default GithubContributionGrid;
