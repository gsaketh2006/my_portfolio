import React from 'react';
import GithubContributionGrid from './GithubContributionGrid';
import LeetCodeContributionGrid from './LeetCodeContributionGrid';

const AdminAboutPanel = ({ data, settings, onUpdate, onDeepUpdate }) => {
    return (
        <div className="admin-section">
            <h3><i className="fas fa-user"></i> About Section Management</h3>

            <div className="form-group">
                <label>About Description</label>
                <textarea
                    value={data.description}
                    onChange={e => onUpdate('about', 'description', e.target.value)}
                    rows="5"
                    placeholder="Describe yourself..."
                />
            </div>

            <div className="admin-integration-box glass-card" style={{ marginTop: '20px', padding: '20px' }}>
                <h4><i className="fab fa-github"></i> GitHub Integration</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label>GitHub Username</label>
                        <input
                            type="text"
                            value={settings.githubUsername}
                            onChange={e => onUpdate('settings', 'githubUsername', e.target.value)}
                            placeholder="username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Show GitHub Grid</label>
                        <div className="toggle-wrapper" onClick={() => onUpdate('about', 'showGithubGrid', !data.showGithubGrid)}>
                            <div className={`admin-toggle ${data.showGithubGrid ? 'active' : ''}`}>
                                <div className="toggle-handle"></div>
                            </div>
                            <span>{data.showGithubGrid ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                </div>

                {data.showGithubGrid && (
                    <div className="live-preview-box" style={{ marginTop: '20px' }}>
                        <label>GitHub Preview</label>
                        <div className="preview-container dark-preview">
                            <GithubContributionGrid username={settings.githubUsername} />
                        </div>
                    </div>
                )}
            </div>

            <div className="admin-integration-box glass-card" style={{ marginTop: '20px', padding: '20px' }}>
                <h4><i className="fas fa-code"></i> LeetCode Submissions Integration</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label>LeetCode Username</label>
                        <input
                            type="text"
                            value={settings.leetcodeUsername}
                            onChange={e => onUpdate('settings', 'leetcodeUsername', e.target.value)}
                            placeholder="username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Show LeetCode Grid</label>
                        <div className="toggle-wrapper" onClick={() => onUpdate('about', 'showLeetcodeGrid', !data.showLeetcodeGrid)}>
                            <div className={`admin-toggle ${data.showLeetcodeGrid ? 'active' : ''}`}>
                                <div className="toggle-handle"></div>
                            </div>
                            <span>{data.showLeetcodeGrid ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                </div>

                {data.showLeetcodeGrid && (
                    <div className="live-preview-box" style={{ marginTop: '20px' }}>
                        <label>LeetCode Submissions Preview</label>
                        <div className="preview-container dark-preview">
                            <LeetCodeContributionGrid username={settings.leetcodeUsername} />
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminAboutPanel;
