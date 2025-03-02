"""
Database initialization and default data setup
"""
from sqlalchemy.orm import Session
from app.core.database import get_db_session, init_database
from app.core.crud import UserCRUD, GalaxyCRUD, TemplateCRUD
from app.core.config import DEFAULT_GALAXIES
from app.models.database import User, Galaxy, Template
import logging

logger = logging.getLogger(__name__)


def create_default_galaxies(user_id: int) -> bool:
    """Create default galaxies for a new user"""
    
    try:
        with get_db_session() as db:
            for galaxy_config in DEFAULT_GALAXIES:
                # Create galaxy
                galaxy = GalaxyCRUD.create(
                    db=db,
                    user_id=user_id,
                    name=galaxy_config["name"],
                    description=galaxy_config["description"],
                    icon=galaxy_config["icon"],
                    color=galaxy_config["color"],
                    is_default=True,
                    is_custom=False,
                    settings={
                        "preferred_models": galaxy_config["recommended_models"],
                        "auto_title": True,
                        "save_history": True,
                        "context_length": 10
                    }
                )
                
                # Create templates for this galaxy
                for template_config in galaxy_config.get("templates", []):
                    TemplateCRUD.create(
                        db=db,
                        galaxy_id=galaxy.id,
                        name=template_config["name"],
                        prompt_template=template_config["prompt"],
                        tags=template_config["tags"],
                        description=f"Default template for {galaxy.name}",
                        is_public=False,
                        category="default"
                    )
        
        logger.info(f"Created default galaxies for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating default galaxies: {e}")
        return False


def setup_database():
    """Initialize database and create tables"""
    
    logger.info("Initializing database...")
    
    success = init_database()
    if success:
        logger.info("Database initialized successfully")
    else:
        logger.error("Database initialization failed")
        return False
    
    return True


def create_admin_user(email: str, password: str, full_name: str = "Admin User") -> bool:
    """Create an admin user for initial setup"""
    
    try:
        with get_db_session() as db:
            # Check if user already exists
            existing_user = UserCRUD.get_by_email(db, email)
            if existing_user:
                logger.warning(f"Admin user {email} already exists")
                return True
            
            # Create admin user
            admin_user = UserCRUD.create(
                db=db,
                email=email,
                password=password,
                full_name=full_name
            )
            
            # Create default galaxies for admin
            create_default_galaxies(admin_user.id)
            
            logger.info(f"Admin user created: {email}")
            return True
            
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        return False


def reset_database():
    """Reset database (DROP ALL TABLES) - USE WITH CAUTION!"""
    
    from app.core.database import drop_tables
    
    logger.warning("RESETTING DATABASE - ALL DATA WILL BE LOST!")
    drop_tables()
    setup_database()
    logger.info("Database reset complete")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "init":
            setup_database()
        elif command == "reset":
            reset_database()
        elif command == "admin" and len(sys.argv) >= 4:
            email = sys.argv[2]
            password = sys.argv[3]
            full_name = sys.argv[4] if len(sys.argv) > 4 else "Admin User"
            
            setup_database()
            create_admin_user(email, password, full_name)
        else:
            print("Usage:")
            print("  python init_db.py init                    # Initialize database")
            print("  python init_db.py reset                   # Reset database (DANGER!)")
            print("  python init_db.py admin <email> <password> [name]  # Create admin user")
    else:
        setup_database()