const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public', 'brand', 'integrations');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const downloads = [
  { name: 'Jira', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jira/jira-original.svg' },
  { name: 'GitLab CI', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/gitlab/gitlab-original.svg' },
  { name: 'Bitbucket', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bitbucket/bitbucket-original.svg' },
  { name: 'Jenkins', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jenkins/jenkins-original.svg' },
  { name: 'Slack', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/slack/slack-original.svg' },
  { name: 'Playwright', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/playwright/playwright-original.svg' },
  { name: 'Cypress', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cypressio/cypressio-original.svg' },
  { name: 'GitHub Actions', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg' },
  { name: 'Azure DevOps', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg' },
];

downloads.forEach(d => {
  const dest = path.join(dir, d.name.replace(/ /g, '_').toLowerCase() + '.svg');
  https.get(d.url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync(dest, data);
      console.log('Saved', d.name);
    });
  }).on('error', (e) => console.error(e));
});
