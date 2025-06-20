import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const CONFIG_DIR = path.join(process.cwd(), 'data', 'config');
const VAPI_CONFIG_FILE = path.join(CONFIG_DIR, 'vapi.json');

// Helper to ensure directory exists
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Simple encryption for API keys using modern crypto methods
function encryptApiKey(apiKey: string): string {
  const algorithm = 'aes-256-cbc';
  const secretKey = 'vapi-secret-key-32-characters-long!'; // Must be 32 characters
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Prepend IV to encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

function decryptApiKey(encryptedKey: string): string {
  try {
    const algorithm = 'aes-256-cbc';
    const secretKey = 'vapi-secret-key-32-characters-long!'; // Must be 32 characters
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    
    // Extract IV and encrypted data
    const [ivHex, encrypted] = encryptedKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, voiceId } = await req.json();

    if (!apiKey || !voiceId) {
      return NextResponse.json({ 
        message: 'API key and voice ID are required' 
      }, { status: 400 });
    }

    // Validate API key format (VAPI keys can start with different prefixes)
    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json({ 
        message: 'Invalid API key format - key too short' 
      }, { status: 400 });
    }

    await ensureDir(CONFIG_DIR);

    // Test the API key before saving
    const testResponse = await fetch('https://api.vapi.ai/assistant', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!testResponse.ok) {
      return NextResponse.json({ 
        message: 'Invalid API key - unable to connect to VAPI' 
      }, { status: 400 });
    }

    // Save encrypted configuration
    const config = {
      apiKey: encryptApiKey(apiKey),
      voiceId: voiceId,
      configuredAt: new Date().toISOString()
    };

    await fs.writeFile(VAPI_CONFIG_FILE, JSON.stringify(config, null, 2));

    return NextResponse.json({ 
      message: 'VAPI configuration saved successfully',
      configured: true 
    });

  } catch (error: any) {
    console.error('VAPI config save error:', error);
    return NextResponse.json({ 
      message: 'Failed to save configuration' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureDir(CONFIG_DIR);
    
    const configExists = await fs.access(VAPI_CONFIG_FILE).then(() => true).catch(() => false);
    
    if (!configExists) {
      return NextResponse.json({ configured: false });
    }

    const configData = await fs.readFile(VAPI_CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);

    return NextResponse.json({ 
      configured: true,
      voiceId: config.voiceId,
      configuredAt: config.configuredAt
    });

  } catch (error) {
    return NextResponse.json({ configured: false });
  }
}

// Helper function to get decrypted API key (for internal use)
export async function getVapiApiKey(): Promise<string | null> {
  try {
    const configData = await fs.readFile(VAPI_CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    return decryptApiKey(config.apiKey);
  } catch {
    return null;
  }
}

// Helper function to get voice ID
export async function getVapiVoiceId(): Promise<string | null> {
  try {
    const configData = await fs.readFile(VAPI_CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    return config.voiceId;
  } catch {
    return null;
  }
}