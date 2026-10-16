import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('frontend/.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = envFile.split('\n').reduce((acc, line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) acc[key.trim()] = rest.join('=').trim();
    return acc;
}, {});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data } = await supabase.from('projects').select('project_id_pm, created_at, id');
    console.log("Raw Data:");
    console.table(data);
}

test();

