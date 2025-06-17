from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os
import subprocess
from datetime import datetime
import os
import shutil
import subprocess


from app.database import get_db
from app.database.models import UserRole
from app.utils.auth import Authorization

backup_router = APIRouter()

@backup_router.get("/backup")
async def backup_database(
    db: AsyncSession = Depends(get_db),
    user = Depends(Authorization(allowed_roles=[UserRole.ADMIN]))
):
    """
    Create a database backup and return it as a file.
    Only accessible by admin users.
    """
    try:
        # Create backups directory if it doesn't exist
        backup_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backups")
        os.makedirs(backup_dir, exist_ok=True)

        # Generate backup filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        # Correct extension for custom format
        backup_file = os.path.join(backup_dir, f"backup_{timestamp}.dump")


        # Get database connection details from environment variables
        db_name = os.getenv("POSTGRES_DB", "postgres")
        db_user = os.getenv("POSTGRES_USER", "postgres")
        db_password = os.getenv("POSTGRES_PASSWORD", "postgres")
        db_host = os.getenv("POSTGRES_HOST", "localhost")
        db_port = os.getenv("POSTGRES_PORT", "5432")

        # Create backup using pg_dump
        command = [
            "pg_dump",
            f"--dbname=postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}",
            "-F", "c",  # Custom format
            "-f", backup_file
        ]

        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Backup failed: {stderr.decode()}"
            )
        
        # Validate backup file
        validate_command = ["pg_restore", "-l", backup_file]
        validate_proc = subprocess.run(
            validate_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        if validate_proc.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Backup file validation failed: {validate_proc.stderr.decode()}"
            )

        # Return the backup file
        return FileResponse(
            backup_file,
            media_type="application/octet-stream",
            filename=f"backup_{timestamp}.dump"
        )


    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Backup failed: {str(e)}"
        )
