#!/bin/bash
# Script de backup automatique
BACKUP_DIR="/var/backup"
LOG_FILE="/var/log/backup.log"

echo "Starting backup process..." >> $LOG_FILE
if [ -d "$BACKUP_DIR" ]; then
    tar -czf /tmp/backup.tar.gz $BACKUP_DIR
    echo "Backup completed at $(date)" >> $LOG_FILE
else
    echo "Backup directory not found!" >> $LOG_FILE
fi