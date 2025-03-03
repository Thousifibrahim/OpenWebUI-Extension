"""
CRUD operations for database models
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from app.models.database import User, APIKey, Galaxy, Conversation, Message, Template, Usage
from app.core.security import get_password_hash, verify_password
import logging

logger = logging.getLogger(__name__)


class UserCRUD:
    """CRUD operations for User model"""
    
    @staticmethod
    def create(db: Session, email: str, password: str, full_name: str = None) -> User:
        """Create a new user"""
        hashed_password = get_password_hash(password)
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"User created: {email}")
        return user
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user"""
        user = UserCRUD.get_by_email(db, email)
        if user and verify_password(password, user.hashed_password):
            return user
        return None
    
    @staticmethod
    def update_preferences(db: Session, user_id: int, preferences: Dict[str, Any]) -> Optional[User]:
        """Update user preferences"""
        user = UserCRUD.get_by_id(db, user_id)
        if user:
            user.preferences.update(preferences)
            db.commit()
            db.refresh(user)
        return user


class APIKeyCRUD:
    """CRUD operations for APIKey model"""
    
    @staticmethod
    def create(db: Session, user_id: int, provider_name: str, encrypted_key: str, key_name: str = None) -> APIKey:
        """Create a new API key"""
        api_key = APIKey(
            user_id=user_id,
            provider_name=provider_name,
            encrypted_key=encrypted_key,
            key_name=key_name or f"{provider_name.title()} Key"
        )
        db.add(api_key)
        db.commit()
        db.refresh(api_key)
        return api_key
    
    @staticmethod
    def get_by_user_and_provider(db: Session, user_id: int, provider_name: str) -> List[APIKey]:
        """Get API keys by user and provider"""
        return db.query(APIKey).filter(
            and_(APIKey.user_id == user_id, APIKey.provider_name == provider_name, APIKey.is_active == True)
        ).all()
    
    @staticmethod
    def get_active_keys(db: Session, user_id: int) -> List[APIKey]:
        """Get all active API keys for user"""
        return db.query(APIKey).filter(
            and_(APIKey.user_id == user_id, APIKey.is_active == True)
        ).all()
    
    @staticmethod
    def deactivate(db: Session, key_id: int, user_id: int) -> bool:
        """Deactivate an API key"""
        api_key = db.query(APIKey).filter(
            and_(APIKey.id == key_id, APIKey.user_id == user_id)
        ).first()
        if api_key:
            api_key.is_active = False
            db.commit()
            return True
        return False


class GalaxyCRUD:
    """CRUD operations for Galaxy model"""
    
    @staticmethod
    def create(db: Session, user_id: int, name: str, description: str = None, **kwargs) -> Galaxy:
        """Create a new galaxy"""
        galaxy = Galaxy(
            user_id=user_id,
            name=name,
            description=description,
            **kwargs
        )
        db.add(galaxy)
        db.commit()
        db.refresh(galaxy)
        return galaxy
    
    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[Galaxy]:
        """Get all galaxies for user"""
        return db.query(Galaxy).filter(Galaxy.user_id == user_id).order_by(Galaxy.order_index).all()
    
    @staticmethod
    def get_by_id(db: Session, galaxy_id: int, user_id: int) -> Optional[Galaxy]:
        """Get galaxy by ID and user"""
        return db.query(Galaxy).filter(
            and_(Galaxy.id == galaxy_id, Galaxy.user_id == user_id)
        ).first()
    
    @staticmethod
    def update(db: Session, galaxy_id: int, user_id: int, **updates) -> Optional[Galaxy]:
        """Update galaxy"""
        galaxy = GalaxyCRUD.get_by_id(db, galaxy_id, user_id)
        if galaxy:
            for key, value in updates.items():
                setattr(galaxy, key, value)
            db.commit()
            db.refresh(galaxy)
        return galaxy
    
    @staticmethod
    def delete(db: Session, galaxy_id: int, user_id: int) -> bool:
        """Delete galaxy (only if custom)"""
        galaxy = GalaxyCRUD.get_by_id(db, galaxy_id, user_id)
        if galaxy and galaxy.is_custom:
            db.delete(galaxy)
            db.commit()
            return True
        return False


class ConversationCRUD:
    """CRUD operations for Conversation model"""
    
    @staticmethod
    def create(db: Session, user_id: int, galaxy_id: int, title: str) -> Conversation:
        """Create a new conversation"""
        conversation = Conversation(
            user_id=user_id,
            galaxy_id=galaxy_id,
            title=title
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation
    
    @staticmethod
    def get_by_user(db: Session, user_id: int, limit: int = 50, offset: int = 0) -> List[Conversation]:
        """Get conversations for user with pagination"""
        return db.query(Conversation).filter(
            and_(Conversation.user_id == user_id, Conversation.is_archived == False)
        ).order_by(desc(Conversation.updated_at)).offset(offset).limit(limit).all()
    
    @staticmethod
    def get_by_galaxy(db: Session, user_id: int, galaxy_id: int, limit: int = 50) -> List[Conversation]:
        """Get conversations by galaxy"""
        return db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.galaxy_id == galaxy_id,
                Conversation.is_archived == False
            )
        ).order_by(desc(Conversation.updated_at)).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, conversation_id: int, user_id: int) -> Optional[Conversation]:
        """Get conversation by ID"""
        return db.query(Conversation).filter(
            and_(Conversation.id == conversation_id, Conversation.user_id == user_id)
        ).first()
    
    @staticmethod
    def search(db: Session, user_id: int, query: str, limit: int = 20) -> List[Conversation]:
        """Search conversations by title or summary"""
        return db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                or_(
                    Conversation.title.contains(query),
                    Conversation.summary.contains(query)
                )
            )
        ).order_by(desc(Conversation.updated_at)).limit(limit).all()


class MessageCRUD:
    """CRUD operations for Message model"""
    
    @staticmethod
    def create(db: Session, conversation_id: int, role: str, content: str, **kwargs) -> Message:
        """Create a new message"""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            **kwargs
        )
        db.add(message)
        
        # Update conversation stats
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conversation:
            conversation.total_messages += 1
            if kwargs.get('total_tokens'):
                conversation.total_tokens += kwargs['total_tokens']
            if kwargs.get('cost'):
                conversation.total_cost += kwargs['cost']
        
        db.commit()
        db.refresh(message)
        return message
    
    @staticmethod
    def get_by_conversation(db: Session, conversation_id: int, limit: int = 100) -> List[Message]:
        """Get messages for conversation"""
        return db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).limit(limit).all()
    
    @staticmethod
    def get_latest_messages(db: Session, conversation_id: int, limit: int = 10) -> List[Message]:
        """Get latest messages for context"""
        return db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(desc(Message.created_at)).limit(limit).all()


class TemplateCRUD:
    """CRUD operations for Template model"""
    
    @staticmethod
    def create(db: Session, galaxy_id: int, name: str, prompt_template: str, **kwargs) -> Template:
        """Create a new template"""
        template = Template(
            galaxy_id=galaxy_id,
            name=name,
            prompt_template=prompt_template,
            **kwargs
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        return template
    
    @staticmethod
    def get_by_galaxy(db: Session, galaxy_id: int) -> List[Template]:
        """Get templates for galaxy"""
        return db.query(Template).filter(Template.galaxy_id == galaxy_id).all()
    
    @staticmethod
    def get_public_templates(db: Session, limit: int = 50) -> List[Template]:
        """Get public templates"""
        return db.query(Template).filter(Template.is_public == True).limit(limit).all()
    
    @staticmethod
    def increment_usage(db: Session, template_id: int) -> None:
        """Increment template usage count"""
        template = db.query(Template).filter(Template.id == template_id).first()
        if template:
            template.usage_count += 1
            db.commit()