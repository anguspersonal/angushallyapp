#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

/**
 * Check if a port is in use and optionally kill the process
 * @param {number} port - The port to check
 * @param {boolean} interactive - Whether to prompt user for action (default: true)
 * @returns {boolean} - True if port is available, false if user aborted
 */
function checkPort(port, interactive = true) {
  try {
    // Check if port is in use
    const result = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
    
    if (result.trim()) {
      console.log(`\n❌ Port ${port} is already in use:`);
      console.log(result);
      
      if (!interactive) {
        console.log(`\n💡 To kill the process manually, run: kill-port ${port}`);
        process.exit(1);
      }
      
      // Parse the output to get PID and command
      const lines = result.trim().split('\n');
      if (lines.length > 1) {
        const processInfo = lines[1].split(/\s+/);
        const pid = processInfo[1];
        const command = processInfo[0];
        
        console.log(`\n🔍 Process using port ${port}:`);
        console.log(`   PID: ${pid}`);
        console.log(`   Command: ${command}`);
        
        // Prompt user for action
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        return new Promise((resolve) => {
          rl.question(`\n❓ Kill this process and continue? (y/n): `, (answer) => {
            rl.close();
            
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
              try {
                console.log(`\n🔄 Killing process ${pid}...`);
                execSync(`kill ${pid}`, { stdio: 'inherit' });
                console.log(`✅ Process killed successfully.`);
                resolve(true);
              } catch (error) {
                console.error(`❌ Failed to kill process: ${error.message}`);
                console.log(`💡 You may need to kill it manually: kill ${pid}`);
                resolve(false);
              }
            } else {
              console.log(`\n⏹️  Aborting startup.`);
              resolve(false);
            }
          });
        });
      }
    }
    
    // Port is available
    return Promise.resolve(true);
    
  } catch (error) {
    // Port is not in use (lsof returns non-zero exit code)
    return Promise.resolve(true);
  }
}

/**
 * Check multiple ports
 * @param {number[]} ports - Array of ports to check
 * @param {boolean} interactive - Whether to prompt user for action
 * @returns {Promise<boolean>} - True if all ports are available, false if user aborted
 */
async function checkPorts(ports, interactive = true) {
  for (const port of ports) {
    const available = await checkPort(port, interactive);
    if (!available) {
      return false;
    }
  }
  return true;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node check-port.js <port1> [port2] [port3] ...');
    console.log('Example: node check-port.js 5000 3000 3001');
    process.exit(1);
  }
  
  const ports = args.map(arg => parseInt(arg)).filter(port => !isNaN(port));
  
  if (ports.length === 0) {
    console.error('❌ No valid port numbers provided');
    process.exit(1);
  }
  
  checkPorts(ports).then(success => {
    if (success) {
      console.log(`\n✅ All ports (${ports.join(', ')}) are available.`);
      process.exit(0);
    } else {
      console.log(`\n⏹️  Startup aborted by user.`);
      process.exit(1);
    }
  });
}

module.exports = { checkPort, checkPorts }; 