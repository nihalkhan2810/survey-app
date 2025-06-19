#!/usr/bin/env node

/**
 * Deployment Testing Script
 * Run this on your server to diagnose production issues
 */

const http = require('http');
const https = require('https');

const SERVER_IP = '3.133.91.18';
const TEST_URLS = [
  { url: `http://${SERVER_IP}`, name: 'Homepage' },
  { url: `http://${SERVER_IP}/api/health`, name: 'Health Check' },
  { url: `http://${SERVER_IP}/auth/signin`, name: 'Sign In Page' },
  { url: `http://localhost:3000`, name: 'Local App' },
  { url: `http://localhost:3000/api/health`, name: 'Local Health' },
];

function makeRequest(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https:') ? https : http;
    
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 500), // First 500 chars
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
        success: false
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timed out',
        success: false
      });
    });
  });
}

async function testDeployment() {
  console.log('🔍 Testing deployment...\n');
  
  for (const test of TEST_URLS) {
    console.log(`Testing ${test.name}: ${test.url}`);
    
    const result = await makeRequest(test.url);
    
    if (result.success) {
      console.log(`✅ ${test.name}: ${result.status}`);
      
      // If it's the health endpoint, show details
      if (test.url.includes('/api/health')) {
        try {
          const healthData = JSON.parse(result.body);
          console.log('   Database:', healthData.database?.databaseType || 'Unknown');
          console.log('   Environment:', healthData.environment?.NODE_ENV || 'Unknown');
          console.log('   NextAuth URL:', healthData.nextauth?.url || 'Not set');
        } catch (e) {
          console.log('   Response:', result.body.substring(0, 100) + '...');
        }
      }
    } else {
      console.log(`❌ ${test.name}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    console.log('');
  }
  
  // Test specific endpoints that might be problematic
  console.log('🔧 Testing specific endpoints...\n');
  
  // Test if PM2 is running the app
  console.log('PM2 Status:');
  try {
    const { execSync } = require('child_process');
    const pm2Status = execSync('pm2 list', { encoding: 'utf8' });
    console.log(pm2Status);
  } catch (error) {
    console.log('❌ PM2 not available or error:', error.message);
  }
  
  console.log('\nNginx Status:');
  try {
    const { execSync } = require('child_process');
    const nginxStatus = execSync('sudo systemctl status nginx --no-pager -l', { encoding: 'utf8' });
    console.log(nginxStatus.substring(0, 500));
  } catch (error) {
    console.log('❌ Nginx status check failed:', error.message);
  }
  
  console.log('\n🏁 Deployment test complete!');
  
  console.log('\n📋 Debugging Steps:');
  console.log('1. Check if http://localhost:3000 works locally');
  console.log('2. Check if http://3.133.91.18 works externally');
  console.log('3. Verify environment variables are set correctly');
  console.log('4. Check PM2 logs: pm2 logs');
  console.log('5. Check Nginx logs: sudo tail -f /var/log/nginx/error.log');
  console.log('6. Check application logs for errors');
}

// Run the test
testDeployment().catch(console.error); 