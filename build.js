import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
        let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
            const envPath = path.join(__dirname, '.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf-8');
                const env = parseEnv(envContent);
                supabaseUrl = supabaseUrl || env.VITE_SUPABASE_URL || '';
                supabaseKey = supabaseKey || env.VITE_SUPABASE_ANON_KEY || '';
            }
        }
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration!');
            console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
            console.error('Or create a .env file with these values');
            process.exit(1);
        }
        
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
