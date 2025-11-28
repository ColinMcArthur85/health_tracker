import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, 'prisma', 'dev.db');
const BACKUP_DIR = path.join(ROOT, 'prisma', 'backups');

export async function GET() {
  try {
    const backups = await listBackups();
    return NextResponse.json({ backups });
  } catch (error) {
    console.error('Backup list error:', error);
    return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const filename = await createBackup();
    const backups = await listBackups();
    return NextResponse.json({ success: true, filename, backups });
  } catch (error) {
    console.error('Backup create error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const filename = body?.filename as string | undefined;
    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 });
    }

    await restoreBackup(filename);
    const backups = await listBackups();
    return NextResponse.json({ success: true, restored: filename, backups });
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}

async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

async function listBackups() {
  await ensureBackupDir();
  const files = await fs.readdir(BACKUP_DIR);
  const dbFiles = files.filter((f) => f.startsWith('backup-') && f.endsWith('.db'));

  const withMeta = await Promise.all(
    dbFiles.map(async (file) => {
      const fullPath = path.join(BACKUP_DIR, file);
      const stat = await fs.stat(fullPath);
      return {
        filename: file,
        createdAt: stat.mtime.toISOString(),
        size: stat.size,
      };
    })
  );

  return withMeta.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function createBackup() {
  await ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, filename);
  await fs.copyFile(DB_PATH, backupPath);
  return filename;
}

async function restoreBackup(filename: string) {
  await ensureBackupDir();
  if (filename.includes('/') || filename.includes('..')) {
    throw new Error('Invalid filename');
  }

  const backupPath = path.join(BACKUP_DIR, filename);
  const exists = await fileExists(backupPath);
  if (!exists) throw new Error('Backup not found');

  // Safety: create a pre-restore backup of current DB
  if (await fileExists(DB_PATH)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.copyFile(DB_PATH, path.join(BACKUP_DIR, `pre-restore-${timestamp}.db`));
  }

  await fs.copyFile(backupPath, DB_PATH);
}

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
