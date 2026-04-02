from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time


class NameGenerationRequest(BaseModel):
    englishName: str = Field(..., min_length=1, description="The English name to generate Chinese name from")
    gender: str = Field(..., pattern="^(male|female|other)$", description="Gender of the person")
    birthDate: str = Field(..., description="Birth date in YYYY-MM-DD format")
    birthTime: Optional[str] = Field(None, description="Birth time in HH:MM format (optional)")


class SuggestedCharacter(BaseModel):
    character: str = Field(..., description="A Chinese character")
    meaning: str = Field(..., description="Meaning of the character")


class NameGenerationResponse(BaseModel):
    chineseName: str = Field(..., description="The generated Chinese name")
    pinyin: str = Field(..., description="Pinyin pronunciation with tone marks")
    meaning: str = Field(..., description="English meaning of the full name")
    culturalExplanation: str = Field(..., description="Cultural significance explanation")
    suggestedCharacters: List[SuggestedCharacter] = Field(..., description="List of suggested characters with meanings")


class CheckoutSessionRequest(BaseModel):
    nameResult: NameGenerationResponse = Field(..., description="The generated name result")


class CheckoutSessionResponse(BaseModel):
    checkoutUrl: str = Field(..., description="Stripe checkout session URL")


class WebhookResponse(BaseModel):
    success: bool = Field(..., description="Whether the webhook was processed successfully")
    unlockCode: Optional[str] = Field(None, description="Unlock code/token if payment was successful")


class HealthResponse(BaseModel):
    status: str = Field(..., description="Health status")
    version: str = Field(..., description="API version")


class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
