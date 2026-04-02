"""
Stripe service for handling payments and checkout sessions.
"""
import os
import uuid
from typing import Optional


class StripeService:
    """Service for Stripe payment integration."""

    def __init__(self):
        self.secret_key = os.getenv("STRIPE_SECRET_KEY")
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        self.price_usd = 2.99

    def _get_stripe_client(self):
        """Get Stripe client."""
        import stripe
        stripe.api_key = self.secret_key
        return stripe

    def create_checkout_session(self, name_result: dict) -> str:
        """
        Create a Stripe checkout session for the premium unlock.

        Args:
            name_result: The generated name data to include in metadata

        Returns:
            The checkout session URL

        Raises:
            Exception: If session creation fails
        """
        stripe = self._get_stripe_client()

        # Generate a unique session ID
        session_id = str(uuid.uuid4())

        try:
            # Create checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": "Chinese Name Premium Unlock",
                                "description": f"Unlock your personalized Chinese name: {name_result.get('chineseName', 'N/A')}",
                                "metadata": {
                                    "chineseName": name_result.get("chineseName", ""),
                                    "pinyin": name_result.get("pinyin", ""),
                                },
                            },
                            "unit_amount": int(self.price_usd * 100),  # $2.99 in cents
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=f"{self.frontend_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{self.frontend_url}/cancel",
                metadata={
                    "session_id": session_id,
                    "chinese_name": name_result.get("chineseName", ""),
                    "english_name": name_result.get("englishName", ""),
                },
                expires_at=int((datetime.now().timestamp() + 1800)),  # 30 minutes expiry
            )

            return session.url

        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")

    def verify_webhook_signature(self, payload: bytes, signature: str) -> dict:
        """
        Verify and parse a Stripe webhook payload.

        Args:
            payload: Raw request body
            signature: Stripe signature header

        Returns:
            Parsed webhook event

        Raises:
            Exception: If signature verification fails
        """
        stripe = self._get_stripe_client()

        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            return event
        except stripe.error.SignatureVerificationError as e:
            raise Exception(f"Webhook signature verification failed: {str(e)}")

    def process_payment_success(self, event: dict) -> str:
        """
        Process a successful payment event.

        Args:
            event: The Stripe event dictionary

        Returns:
            An unlock code/token for the premium content
        """
        # Generate a unique unlock code
        unlock_code = str(uuid.uuid4())

        # In a real implementation, you would:
        # 1. Store the unlock code in a database
        # 2. Associate it with the user's name result
        # 3. Potentially send confirmation email

        return unlock_code


from datetime import datetime

# Singleton instance
stripe_service = StripeService()
