#!/usr/bin/env node

/**
 * Security Validation Script
 * Checks for any remaining security vulnerabilities in the codebase
 */

const fs = require('fs');
const path = require('path');

// Security patterns to check for
const SECURITY_PATTERNS = [
  {
    pattern: /AIza[0-9A-Za-z\-_]{35}/g,
    name: 'Google API Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /sk-[a-zA-Z0-9]{48}/g,
    name: 'OpenAI API Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /GEMINI_API_KEY\s*=\s*["']?AIza/g,
    name: 'Hardcoded Gemini API Key',
    severity: 'CRITICAL'
  },
  {
    pattern: /geminiService\./g,
    name: 'Direct Gemini Service Usage',
    severity: 'HIGH'
  },
  {
    pattern: /import.*gemini-service/g,
    name: 'Gemini Service Import',
    severity: 'MEDIUM'
  }
];

// Files/directories to exclude from scanning
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.env.example',
  '.env.production.example',
  '.env.render.example',
  'SECURITY_REFACTORING_COMPLETE.md',
  'security-check.js',
  'test-integration.js'
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    SECURITY_PATTERNS.forEach(({ pattern, name, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: filePath,
            pattern: name,
            severity,
            match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
            line: content.substring(0, content.indexOf(match)).split('\n').length
          });
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.warn(`Could not scan file ${filePath}: ${error.message}`);
    return [];
  }
}

function scanDirectory(dirPath) {
  let issues = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      
      if (shouldExcludeFile(itemPath)) {
        continue;
      }
      
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        issues = issues.concat(scanDirectory(itemPath));
      } else if (stats.isFile()) {
        // Only scan text files
        const ext = path.extname(item).toLowerCase();
        const textExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.env', '.md', '.txt', '.yml', '.yaml', '.html', '.css', '.scss'];
        
        if (textExtensions.includes(ext) || !ext) {
          issues = issues.concat(scanFile(itemPath));
        }
      }
    }
  } catch (error) {
    console.warn(`Could not scan directory ${dirPath}: ${error.message}`);
  }
  
  return issues;
}

function runSecurityCheck() {
  console.log('🔒 Running Security Validation Check...\n');
  
  const projectRoot = process.cwd();
  const issues = scanDirectory(projectRoot);
  
  if (issues.length === 0) {
    console.log('✅ SECURITY CHECK PASSED');
    console.log('   No security vulnerabilities detected');
    console.log('   All API keys are properly secured');
    console.log('   Direct service imports have been removed\n');
    return true;
  }
  
  console.log('⚠️  SECURITY ISSUES DETECTED:\n');
  
  // Group issues by severity
  const critical = issues.filter(i => i.severity === 'CRITICAL');
  const high = issues.filter(i => i.severity === 'HIGH');
  const medium = issues.filter(i => i.severity === 'MEDIUM');
  
  [
    { level: 'CRITICAL', issues: critical, icon: '🚨' },
    { level: 'HIGH', issues: high, icon: '⚠️' },
    { level: 'MEDIUM', issues: medium, icon: '📝' }
  ].forEach(({ level, issues, icon }) => {
    if (issues.length > 0) {
      console.log(`${icon} ${level} (${issues.length} issues):`);
      issues.forEach(issue => {
        console.log(`   ${issue.file}:${issue.line}`);
        console.log(`   Pattern: ${issue.pattern}`);
        console.log(`   Match: ${issue.match}`);
        console.log('');
      });
    }
  });
  
  console.log(`Total issues found: ${issues.length}`);
  
  return false;
}

// Run the check
const isPassed = runSecurityCheck();
process.exit(isPassed ? 0 : 1);
