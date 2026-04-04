"""
Stripe service for handling payments and checkout sessions.
"""
import os
import uuid
from datetime import datetime
from typing import Dict


class StripeService:
    """Service for Stripe payment integration."""

    PLAN_DEFINITIONS = {
        "keepsake": {
            "name": "Keepsake Card",
            "description": "One premium calligraphy card with a refined classical style",
            "amount_usd": 2.99,
        },
        "signature": {
            "name": "Signature Collection",
            "description": "Three artistic styles with a more premium presentation and export quality",
            "amount_usd": 6.99,
        },
    }

    def __init__(self):
        self.secret_key = os.getenv("STRIPE_SECRET_KEY")
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        self.mock_sessions: Dict[str, dict] = {}

    def _get_stripe_client(self):
        """Get Stripe client."""
        import stripe
        stripe.api_key = self.secret_key
        return stripe

    def _is_mock_mode(self) -> bool:
        return not self.secret_key or "your_stripe" in self.secret_key.lower()

    def _get_plan(self, plan_id: str) -> dict:
        plan = self.PLAN_DEFINITIONS.get(plan_id)
        if not plan:
            raise ValueError(f"Unsupported plan: {plan_id}")
        return plan

    def create_checkout_session(self, name_result: dict, plan_id: str) -> str:
        """
        Create a Stripe checkout session for the premium unlock.

        Args:
            name_result: The generated name data to include in metadata
            plan_id: The selected pricing plan

        Returns:
            The checkout session URL

        Raises:
            Exception: If session creation fails
        """
        plan = self._get_plan(plan_id)

        # Generate a unique session ID
        session_id = str(uuid.uuid4())

        if self._is_mock_mode():
            self.mock_sessions[session_id] = {
                "sessionId": session_id,
                "planId": plan_id,
                "planName": plan["name"],
                "amountUsd": plan["amount_usd"],
                "paymentStatus": "paid",
                "isMock": True,
                "nameResult": {
                    "chineseName": name_result.get("chineseName", ""),
                    "pinyin": name_result.get("pinyin", ""),
                    "meaning": name_result.get("meaning", ""),
                },
            }
            return (
                f"{self.frontend_url}/success"
                f"?session_id={session_id}"
            )

        stripe = self._get_stripe_client()

        try:
            # Create checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": plan["name"],
                                "description": (
                                    f"{plan['description']}: "
                                    f"{name_result.get('chineseName', 'N/A')}"
                                ),
                                "metadata": {
                                    "chineseName": name_result.get("chineseName", ""),
                                    "pinyin": name_result.get("pinyin", ""),
                                    "meaning": name_result.get("meaning", ""),
                                    "planId": plan_id,
                                },
                            },
                            "unit_amount": int(plan["amount_usd"] * 100),
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=f"{self.frontend_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{self.frontend_url}/cancel?plan={plan_id}",
                metadata={
                    "session_id": session_id,
                    "chinese_name": name_result.get("chineseName", ""),
                    "pinyin": name_result.get("pinyin", ""),
                    "meaning": name_result.get("meaning", ""),
                    "plan_id": plan_id,
                },
                expires_at=int(datetime.now().timestamp() + 1800),
            )

            return session.url

        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")

    def get_checkout_session(self, session_id: str) -> dict:
        """Retrieve checkout session details for the success page."""
        if session_id in self.mock_sessions:
            return self.mock_sessions[session_id]

        stripe = self._get_stripe_client()
        session = stripe.checkout.Session.retrieve(session_id)
        plan_id = session.metadata.get("plan_id", "keepsake")
        plan = self._get_plan(plan_id)

        return {
            "sessionId": session.id,
            "planId": plan_id,
            "planName": plan["name"],
            "amountUsd": plan["amount_usd"],
            "paymentStatus": session.payment_status,
            "isMock": False,
            "nameResult": {
                "chineseName": session.metadata.get("chinese_name", ""),
                "pinyin": session.metadata.get("pinyin", ""),
                "meaning": session.metadata.get("meaning", ""),
            },
        }

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

# Singleton instance
stripe_service = StripeService()
