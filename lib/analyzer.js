const SKILLS = {
  Python: ['python', 'py'], Java: ['java'], C: ['c language'], 'C++': ['c++', 'cpp'],
  JavaScript: ['javascript', 'java script', 'js'], TypeScript: ['typescript', 'ts'],
  HTML: ['html', 'html5'], CSS: ['css', 'css3'], React: ['react', 'reactjs', 'react.js'],
  'Node.js': ['node.js', 'nodejs', 'node js'], 'Express.js': ['express.js', 'expressjs', 'express'],
  Flask: ['flask'], FastAPI: ['fastapi', 'fast api'], Django: ['django'],
  'REST API': ['rest api', 'restful api', 'api development'], 'Machine Learning': ['machine learning', 'ml'],
  'Artificial Intelligence': ['artificial intelligence', 'ai'], NLP: ['nlp', 'natural language processing'],
  'Data Science': ['data science', 'data scientist'], Pandas: ['pandas'], NumPy: ['numpy'],
  'Scikit-learn': ['scikit-learn', 'scikit learn', 'sklearn'], TensorFlow: ['tensorflow'], PyTorch: ['pytorch'],
  SQL: ['sql', 'structured query language'], MySQL: ['mysql', 'my sql'], PostgreSQL: ['postgresql', 'postgres'],
  MongoDB: ['mongodb', 'mongo db'], Git: ['git', 'version control'], GitHub: ['github', 'git hub'],
  Docker: ['docker', 'dockerfile', 'containers'], Kubernetes: ['kubernetes', 'k8s'], AWS: ['aws', 'amazon web services'],
  Azure: ['azure', 'microsoft azure'], 'Google Cloud': ['google cloud', 'gcp'],
  Communication: ['communication', 'presentation'], Teamwork: ['teamwork', 'collaboration'],
  Leadership: ['leadership', 'team lead'], 'Problem Solving': ['problem solving', 'debugging']
};
const CATEGORIES = {
  React: 'Frameworks', 'Node.js': 'Frameworks', 'Express.js': 'Frameworks', Flask: 'Frameworks', FastAPI: 'Frameworks', Django: 'Frameworks', TensorFlow: 'Frameworks', PyTorch: 'Frameworks',
  SQL: 'Databases', MySQL: 'Databases', PostgreSQL: 'Databases', MongoDB: 'Databases',
  Git: 'Tools', GitHub: 'Tools', Docker: 'Tools', Kubernetes: 'Tools', AWS: 'Cloud', Azure: 'Cloud', 'Google Cloud': 'Cloud',
  Communication: 'Soft Skills', Teamwork: 'Soft Skills', Leadership: 'Soft Skills', 'Problem Solving': 'Soft Skills'
};
function normalise(text = '') { return text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ').replace(/\s+/g, ' ').trim(); }
function contains(text, alias) { return new RegExp(`(^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\ /g, '\\s+')}($|[^a-z0-9])`, 'i').test(text); }
function extractSkills(text) { const n = normalise(text); return Object.entries(SKILLS).filter(([, aliases]) => aliases.some(a => contains(n, a))).map(([name]) => name).sort(); }
function years(text) { const found = [...normalise(text).matchAll(/(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)/g)].map(m => Number(m[1])); return Math.max(0, ...found); }
function categories(skills) { return skills.reduce((all, skill) => { const cat = CATEGORIES[skill] || 'Technical Skills'; (all[cat] ||= []).push(skill); return all; }, {}); }
function recommendation(skill) { return `Learn ${skill} fundamentals and add clear evidence of hands-on use in a project or experience bullet.`; }
export function analyseResume(resumeText, jobText) {
  const resumeSkills = extractSkills(resumeText); const jobSkills = extractSkills(jobText);
  const matchedSkills = jobSkills.filter(s => resumeSkills.includes(s));
  const missingSkills = jobSkills.filter(s => !resumeSkills.includes(s)).map(name => ({ name, priority: ['Technical Skills', 'Frameworks', 'Cloud', 'Databases', 'Tools'].includes(CATEGORIES[name] || 'Technical Skills') ? 'Medium Priority' : 'Low Priority', recommendation: recommendation(name) }));
  const skillScore = jobSkills.length ? Math.round((matchedSkills.length / jobSkills.length) * 10000) / 100 : 0;
  const requiredYears = years(jobText); const resumeYears = years(resumeText);
  const experienceScore = requiredYears ? Math.min(100, Math.round((resumeYears / requiredYears) * 100)) : (resumeYears ? 70 : 45);
  const educationScore = /bachelor|b\.tech|bca|master|mca|mba|degree/i.test(resumeText) ? 90 : 55;
  const projectScore = /project/i.test(resumeText) ? Math.max(55, skillScore) : 45;
  const certificationScore = /certif|certificate/i.test(resumeText) ? 90 : (/certif|certificate/i.test(jobText) ? 35 : 70);
  const scoreBreakdown = { 'Skills Match': skillScore, 'Experience Match': experienceScore, 'Education Match': educationScore, 'Projects Match': projectScore, Certifications: certificationScore };
  const score = Math.round((skillScore * .4 + experienceScore * .2 + educationScore * .15 + projectScore * .15 + certificationScore * .1) * 100) / 100;
  const recommendations = missingSkills.slice(0, 5).map(item => item.recommendation);
  if (score < 70) recommendations.unshift('Add role-specific keywords from the job description to the summary, skills, and project bullets.');
  if (experienceScore < 65) recommendations.push('Rewrite experience bullets with measurable results, tools used, and outcomes.');
  return { score, score_breakdown: scoreBreakdown, resume_skills: resumeSkills, job_skills: jobSkills, matched_skills: matchedSkills, missing_skills: missingSkills, job_categories: categories(jobSkills), resume_categories: categories(resumeSkills), recommendations: [...new Set(recommendations.length ? recommendations : ['Resume is well aligned; keep achievements quantified and tailored to the target role.'])], strengths: matchedSkills.length ? [`Strong alignment on ${matchedSkills.slice(0, 4).join(', ')}.`] : ['Resume includes relevant baseline information for screening.'], weaknesses: missingSkills.length ? [`Missing requirements: ${missingSkills.slice(0, 4).map(s => s.name).join(', ')}.`] : ['No major tracked skill gaps were detected.'], ats_compatibility_score: Math.round((skillScore * .45 + experienceScore * .35 + educationScore * .2) * 100) / 100, keyword_optimization_score: skillScore, required_skills_count: jobSkills.length, matched_skills_count: matchedSkills.length, missing_skills_count: missingSkills.length };
}
