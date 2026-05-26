import { supabase } from './lib/supabase';
import { initialData } from './initialData';

export const seedSupabase = async () => {
    console.log('Starting Supabase Seeding...');
    
    try {
        // 1. Seed Portfolio Data (Profile)
        const { error: profileError } = await supabase
            .from('portfolio_data')
            .upsert({
                id: '00000000-0000-0000-0000-000000000000',
                settings: initialData.settings,
                hero: initialData.hero,
                about: initialData.about,
                contact: initialData.contact
            });
        
        if (profileError) throw profileError;
        console.log('✅ Portfolio data seeded.');

        // 2. Seed Experience
        const { error: expError } = await supabase
            .from('experience')
            .insert(initialData.experience.map((exp, i) => ({ ...exp, order_index: i })));
        
        if (expError) console.warn('Experience seeding skipped (might already exist)');
        else console.log('✅ Experience seeded.');

        // 3. Seed Certifications
        if (initialData.certifications?.length > 0) {
            const { error: certError } = await supabase
                .from('certifications')
                .insert(initialData.certifications.map((cert, i) => ({ 
                    title: cert.title || '',
                    organization: cert.organization || '',
                    image_url: cert.image || '',
                    issue_date: cert.issueDate || '',
                    credential_id: cert.credentialId || '',
                    credential_url: cert.credentialUrl || '',
                    color: cert.color || '#FF6A3D',
                    order_index: i 
                })));
            
            if (certError) console.warn('Certifications seeding issue:', certError);
            else console.log('✅ Certifications seeded.');
        } else {
            console.log('✅ No Certifications to seed.');
        }

        // 4. Seed Projects
        if (initialData.projects?.length > 0) {
            const { error: projError } = await supabase
                .from('projects')
                .insert(initialData.projects.map((p, i) => ({ 
                    name: p.name || '',
                    description: p.description || '',
                    url: p.url || '',
                    language: p.language || '',
                    image_url: p.image_url || '',
                    is_visible: p.is_visible !== false,
                    source: p.source || 'manual',
                    github_id: p.github_id || null,
                    order_index: i 
                })));
            if (projError) console.warn('Projects seeding issue:', projError);
            else console.log('✅ Projects seeded.');
        }

        // 5. Seed Skills
        const flatSkills = [];
        Object.entries(initialData.skills).forEach(([category, skills], catIdx) => {
            skills.forEach((skill, skillIdx) => {
                flatSkills.push({
                    category,
                    skill_name: skill,
                    order_index: (catIdx * 100) + skillIdx
                });
            });
        });
        
        if (flatSkills.length > 0) {
            const { error: skillsError } = await supabase
                .from('skills')
                .insert(flatSkills);
            if (skillsError) console.warn('Skills seeding skipped (might already exist)');
            else console.log('✅ Skills seeded.');
        }

        console.log('🚀 Seeding completed successfully!');
        alert('Database seeded successfully! You can now remove the seed call.');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        alert('Seeding failed. Check console.');
    }
};
