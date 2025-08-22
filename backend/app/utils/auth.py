from datetime import datetime, timedelta
from typing import Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import UserInDB, TokenData
from app.db.mongo import users_collection
import os
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

# Load secrets from environment variables
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-key-change-in-production")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", "fallback-refresh-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

# Set up password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify the password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash the password"""
    return pwd_context.hash(password)

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Get a user by email from the database"""
    user_dict = await users_collection.find_one({"email": email})
    if user_dict:
        # Convert ObjectId to string for serialization
        user_dict["id"] = str(user_dict.pop("_id"))
        return UserInDB(**user_dict)
    return None

async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    """Get a user by ID from the database"""
    try:
        user_dict = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user_dict:
            user_dict["id"] = str(user_dict.pop("_id"))
            return UserInDB(**user_dict)
    except Exception:
        pass
    return None

async def authenticate_user(email: str, password: str) -> Union[UserInDB, bool]:
    """Authenticate a user by email and password"""
    user = await get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    """Verify and decode a JWT token"""
    try:
        secret = SECRET_KEY if token_type == "access" else REFRESH_SECRET_KEY
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        
        # Check token type
        if payload.get("type") != token_type:
            return None
            
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        
        if email is None or user_id is None:
            return None
            
        return TokenData(email=email, user_id=user_id)
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserInDB:
    """Get the current user from a JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    token_data = verify_token(token, "access")
    
    if token_data is None:
        raise credentials_exception
        
    user = await get_user_by_id(token_data.user_id)
    if user is None:
        raise credentials_exception
        
    return user

async def refresh_access_token(refresh_token: str) -> Optional[str]:
    """Create a new access token from a refresh token"""
    token_data = verify_token(refresh_token, "refresh")
    
    if token_data is None:
        return None
        
    user = await get_user_by_id(token_data.user_id)
    if user is None:
        return None
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}, 
        expires_delta=access_token_expires
    )
    
    return access_token
