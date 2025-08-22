wfrom fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
from app.models.user import UserCreate, UserLogin, UserResponse, Token, UserInDB
from app.utils.auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token,
    create_refresh_token,
    refresh_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.db.mongo import users_collection
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

router = APIRouter(tags=["authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """Register a new user and return authentication tokens"""
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user object with hashed password
    user_dict = user_data.dict()
    password = user_dict.pop("password")
    hashed_password = get_password_hash(password)
    
    user_in_db = {
        "email": user_dict["email"],
        "name": user_dict["name"],
        "password_hash": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    try:
        # Insert user into database
        result = await users_collection.insert_one(user_in_db)
        user_id = str(result.inserted_id)
        
        # Create access and refresh tokens for the new user
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_dict["email"], "user_id": user_id}, 
            expires_delta=access_token_expires
        )
        
        refresh_token = create_refresh_token(
            data={"sub": user_dict["email"], "user_id": user_id}
        )
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

@router.post("/login", response_model=Token)
async def login_for_access_token(user_credentials: UserLogin):
    """Login and get access token"""
    
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}, 
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/refresh", response_model=dict)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    
    new_access_token = await refresh_access_token(refresh_token)
    if not new_access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    """Get current authenticated user"""
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "created_at": current_user.created_at
    }
    return UserResponse(**user_data)

@router.post("/logout")
async def logout(current_user: UserInDB = Depends(get_current_user)):
    """Logout user (client should remove tokens)"""
    return {"message": "Successfully logged out"}
