import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_DIR = path.join(process.cwd(), 'data', 'config');
const VAPI_CONFIG_FILE = path.join(CONFIG_DIR, 'vapi.json');

export async function GET() {
  try {
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