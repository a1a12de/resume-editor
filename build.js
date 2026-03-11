import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const configPath = path.join(__dirname, 'js', 'config.js');

function parseEnv(content) {
    const lines = content.split('\n');
    const env = {};
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                env[key.trim()] = valueParts.join('=').trim();
            }
        }
    }
    return env;
}

function buildConfig() {
    try {
        if (!fs.existsSync(envPath)) {
            console.error('.env file not found! Please copy .env.example to .env and fill in your values.');
            process.exit(1);
        }
        
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const env = parseEnv(envContent);
        
        const supabaseUrl = env.VITE_SUPABASE_URL || '';
        const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
        
        const configContent = `// 此文件由 build.js 自动生成，请勿手动修改
const CONFIG = {
    SUPABASE_URL: '${supabaseUrl}',
    SUPABASE_ANON_KEY: '${supabaseKey}'
};

// 防止配置被修改
Object.freeze(CONFIG);
`;
        
        const jsDir = path.join(__dirname, 'js');
        if (!fs.existsSync(jsDir)) {
            fs.mkdirSync(jsDir, { recursive: true });
        }
        
        fs.writeFileSync(configPath, configContent, 'utf-8');
        console.log('Config file generated successfully: js/config.js');
        
    } catch (error) {
        console.error('Error building config:', error);
        process.exit(1);
    }
}

buildConfig();
