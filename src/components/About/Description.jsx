import React from 'react';
import { motion } from 'framer-motion';

const Description = ({ title, description }) => {
    return (
        <motion.div
            className="about-card about-description-card glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
        >
            <div className="about-icon-badge">
                <i className="fas fa-user-astronaut"></i>
            </div>
            
            <div className="about-header">
                <span className="about-subtitle">The Story</span>
                <h3 className="about-title">{title}</h3>
            </div>
            
            <div className="about-text-container">
                {description?.split('\n').filter(p => p.trim()).map((paragraph, index) => (
                    <motion.p 
                        key={index} 
                        className="about-text" 
                        style={{ marginBottom: '1rem' }}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
                    >
                        {paragraph}
                    </motion.p>
                ))}
            </div>

        </motion.div>
    );
};

export default React.memo(Description);
