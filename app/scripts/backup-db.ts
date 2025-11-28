import * as fs from 'fs';
import * as path from 'path';

const BACKUP_DIR = path.join(__dirname, '../prisma/backups');
const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const MAX_BACKUPS = 30;

async function backupDatabase() {
  try {
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.db`);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);

    // Clean up old backups
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // Remove old backups beyond MAX_BACKUPS
    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS);
      toDelete.forEach(backup => {
        fs.unlinkSync(backup.path);
        console.log(`🗑️  Removed old backup: ${backup.name}`);
      });
    }

    console.log(`📊 Total backups: ${Math.min(backups.length, MAX_BACKUPS)}`);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Check if running in auto mode (for cron jobs)
const isAuto = process.argv.includes('--auto');

if (isAuto) {
  console.log('🤖 Running automated backup...');
}

backupDatabase()
  .then(() => {
    console.log('✨ Backup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Backup error:', error);
    process.exit(1);
  });
