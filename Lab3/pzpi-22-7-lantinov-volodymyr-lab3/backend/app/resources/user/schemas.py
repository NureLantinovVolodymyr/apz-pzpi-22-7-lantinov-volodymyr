from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional, List

class PremiumServiceResponseSchema(BaseModel):
    name: str
    description: str
    price: float

class RentalResponseSchema(BaseModel):
    id: int
    warehouse_name: str
    warehouse_location: str
    start_date: date
    end_date: date
    total_price: float
    status: str
    services: List[PremiumServiceResponseSchema] = []
    code: str | None = None


class LockResponseSchema(BaseModel):
    id: int
    warehouse_id: int
    access_key: str

class UserUpdateSchema(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    
class UserResponseSchema(BaseModel):
    id: Optional[int]
    username: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    role: Optional[str]
    is_blocked: Optional[bool]