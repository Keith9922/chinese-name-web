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
    pronunciationMapping: str = Field(..., description="How the Chinese name maps to the English pronunciation or impression")
    elementAnalysis: str = Field(..., description="How the birth date or seasonal element profile influenced the name")
    suggestedCharacters: List[SuggestedCharacter] = Field(..., description="List of suggested characters with meanings")


class CheckoutNameResult(BaseModel):
    chineseName: str = Field(..., description="The generated Chinese name")
    pinyin: str = Field(..., description="Pinyin pronunciation with tone marks")
    meaning: str = Field(..., description="English meaning of the full name")


class CheckoutSessionRequest(BaseModel):
    nameResult: CheckoutNameResult = Field(..., description="The generated name result")
    planId: str = Field(..., description="Selected pricing plan ID")


class CheckoutSessionResponse(BaseModel):
    checkoutUrl: str = Field(..., description="Stripe checkout session URL")


class CheckoutSessionStatusResponse(BaseModel):
    sessionId: str = Field(..., description="Checkout session ID")
    planId: str = Field(..., description="Selected pricing plan ID")
    planName: str = Field(..., description="Display name of the selected plan")
    amountUsd: float = Field(..., description="Paid amount in USD")
    paymentStatus: str = Field(..., description="Payment status")
    isMock: bool = Field(False, description="Whether this session was created in mock mode")
    nameResult: CheckoutNameResult = Field(..., description="Name result included in checkout metadata")


class WebhookResponse(BaseModel):
    success: bool = Field(..., description="Whether the webhook was processed successfully")
    unlockCode: Optional[str] = Field(None, description="Unlock code/token if payment was successful")


class HealthResponse(BaseModel):
    status: str = Field(..., description="Health status")
    version: str = Field(..., description="API version")


class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
