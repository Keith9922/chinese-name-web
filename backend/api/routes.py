"""
API routes for the Chinese Name Generator backend.
"""
from fastapi import APIRouter, HTTPException, Request, Header
from typing import Optional

from models.schemas import (
    NameGenerationRequest,
    NameGenerationResponse,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    WebhookResponse,
    HealthResponse,
    ErrorResponse,
)

from services.name_generator import name_generator_service
from services.stripe_service import stripe_service


router = APIRouter()


@router.post("/api/generate-name", response_model=NameGenerationResponse)
async def generate_name(request: NameGenerationRequest):
    """
    Generate a Chinese name based on English name, gender, and birth date.

    - **englishName**: The English name to generate Chinese name from
    - **gender**: Gender (male/female/other)
    - **birthDate**: Birth date in YYYY-MM-DD format
    - **birthTime**: Optional birth time in HH:MM format
    """
    try:
        result = name_generator_service.generate_name(
            english_name=request.englishName,
            gender=request.gender,
            birth_date=request.birthDate,
            birth_time=request.birthTime,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(request: CheckoutSessionRequest):
    """
    Create a Stripe checkout session for premium unlock.

    - **nameResult**: The generated name data
    """
    try:
        checkout_url = stripe_service.create_checkout_session(
            name_result=request.nameResult.model_dump()
        )
        return CheckoutSessionResponse(checkoutUrl=checkout_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/webhook", response_model=WebhookResponse)
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None)
):
    """
    Handle Stripe webhook events.

    On payment success, returns an unlock code/token.
    """
    try:
        body = await request.body()

        if not stripe_signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")

        event = stripe_service.verify_webhook_signature(body, stripe_signature)

        if event["type"] == "checkout.session.completed":
            unlock_code = stripe_service.process_payment_success(event)
            return WebhookResponse(success=True, unlockCode=unlock_code)

        return WebhookResponse(success=True, unlockCode=None)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    """
    return HealthResponse(status="healthy", version="1.0.0")
