import React from 'react';
import { motion } from 'framer-motion';

const LeetCodeContributionGrid = ({ username }) => {
    if (!username) return null;

    // Standard LeetCode stats image for a clean modular look
    const statsUrl = `https://leetcode-stats-api.herokuapp.com/${username}`;
    // Using a placeholder for the "grid" feel if the API is slow, 
    // but typically we use a 3rd party visualizer or just the stats card.
    // For this build, we'll use a stylized card that mimics the GitHub grid's layout.
    
    return (
        <motion.div
            className="leetcode-contribution-grid"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <motion.a
                href={`https://leetcode.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="leetcode-grid-link glass-card"
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px hsl(var(--primary) / 0.15)' }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="grid-header">
                    <i className="fas fa-code"></i>
                    <span>LeetCode Activity</span>
                </div>
                <div className="grid-image-container leetcode-stats-placeholder">
                    {/* Note: In a real production app, you might use a custom SVG fetcher here */}
                    <img 
                        src={`https://leetcard.jacoblin.cool/${username}?theme=dark&font=Inter&ext=activity`} 
                        alt={`${username}'s LeetCode Status`}
                        className="leetcode-grid-img"
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

export default LeetCodeContributionGrid;
