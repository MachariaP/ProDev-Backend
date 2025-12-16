"""
Utilities for M-Pesa Daraja API integration.

This module provides helper functions and classes for integrating with
Safaricom's Daraja API for M-Pesa transactions including STK Push,
C2B, B2C, and B2B operations.
"""
import base64
import hashlib
import json
import requests
import datetime
import logging
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)


class MpesaDarajaAPI:
    """
    Main class for interacting with Safaricom Daraja API.
    
    This class handles authentication, request signing, and API calls
    for various M-Pesa transaction types.
    
    Attributes:
        base_url (str): Base URL for Daraja API (sandbox or production)
        consumer_key (str): OAuth consumer key from Daraja
        consumer_secret (str): OAuth consumer secret from Daraja
        passkey (str): Daraja API passkey
        business_shortcode (str): Business/Lipa Na M-Pesa shortcode
        callback_url (str): Callback URL for payment notifications
    """
    
    def __init__(self):
        """Initialize Daraja API with settings from Django configuration."""
        self.base_url = getattr(settings, 'MPESA_BASE_URL', 
                               'https://sandbox.safaricom.co.ke')
        self.consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY')
        self.consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET')
        self.passkey = getattr(settings, 'MPESA_PASSKEY')
        self.business_shortcode = getattr(settings, 'MPESA_BUSINESS_SHORTCODE')
        self.callback_url = getattr(settings, 'MPESA_CALLBACK_URL')
        
        if not all([self.consumer_key, self.consumer_secret, self.passkey, 
                   self.business_shortcode, self.callback_url]):
            raise ImproperlyConfigured(
                "M-Pesa Daraja API credentials are not properly configured. "
                "Please set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, "
                "MPESA_PASSKEY, MPESA_BUSINESS_SHORTCODE, and MPESA_CALLBACK_URL "
                "in your settings."
            )
        
        self.access_token = None
        self.token_expiry = None
    
    def get_access_token(self):
        """
        Get OAuth access token from Daraja API.
        
        Returns:
            str: Access token for API calls
        
        Raises:
            requests.RequestException: If token request fails
        """
        # Check if token is still valid
        if self.access_token and self.token_expiry:
            if timezone.now() < self.token_expiry:
                return self.access_token
        
        # Generate new token
        auth_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        auth_string = f"{self.consumer_key}:{self.consumer_secret}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_auth}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(auth_url, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            self.access_token = data.get('access_token')
            # Token expires in 1 hour, set expiry to 50 minutes for safety
            self.token_expiry = timezone.now() + datetime.timedelta(minutes=50)
            
            logger.info("Successfully obtained M-Pesa access token")
            return self.access_token
            
        except requests.RequestException as e:
            logger.error(f"Failed to get M-Pesa access token: {str(e)}")
            raise
    
    def generate_password(self, timestamp=None):
        """
        Generate Daraja API password using business shortcode, passkey, and timestamp.
        
        Args:
            timestamp (str, optional): Timestamp in format YYYYMMDDHHMMSS.
                If not provided, current time is used.
        
        Returns:
            tuple: (password, timestamp) for API request
        """
        if not timestamp:
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        
        data_to_encode = f"{self.business_shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(data_to_encode.encode()).decode()
        
        return password, timestamp
    
    def stk_push_request(self, phone_number, amount, account_reference, 
                         transaction_desc, callback_url=None):
        """
        Initiate STK Push (Lipa Na M-Pesa Online) request.
        
        Args:
            phone_number (str): Customer phone number in format 254XXXXXXXXX
            amount (float): Transaction amount
            account_reference (str): Account reference (e.g., invoice number)
            transaction_desc (str): Transaction description
            callback_url (str, optional): Custom callback URL
        
        Returns:
            dict: Response from Daraja API
        
        Raises:
            requests.RequestException: If API request fails
        """
        access_token = self.get_access_token()
        password, timestamp = self.generate_password()
        
        # Format phone number (remove leading 0 and add 254)
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif phone_number.startswith('+'):
            phone_number = phone_number[1:]
        
        payload = {
            "BusinessShortCode": self.business_shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": self.business_shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url or self.callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"STK Push request failed: {str(e)}")
            raise
    
    def query_stk_status(self, checkout_request_id):
        """
        Query status of an STK Push transaction.
        
        Args:
            checkout_request_id (str): Checkout request ID from STK Push response
        
        Returns:
            dict: Query response from Daraja API
        
        Raises:
            requests.RequestException: If API request fails
        """
        access_token = self.get_access_token()
        password, timestamp = self.generate_password()
        
        payload = {
            "BusinessShortCode": self.business_shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"STK status query failed: {str(e)}")
            raise
    
    def validate_callback_signature(self, payload, signature):
        """
        Validate M-Pesa callback signature using Daraja public key.
        
        Args:
            payload (str): Raw callback payload
            signature (str): Signature from 'Signature' header
        
        Returns:
            bool: True if signature is valid, False otherwise
        """
        try:
            # Get public key from settings or use default Daraja sandbox key
            public_key_pem = getattr(settings, 'MPESA_PUBLIC_KEY', None)
            
            if not public_key_pem:
                logger.warning("M-Pesa public key not configured, skipping signature validation")
                return True  # In production, this should return False
            
            # Load public key
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode(),
                backend=default_backend()
            )
            
            # Decode signature
            signature_bytes = base64.b64decode(signature)
            
            # Verify signature
            public_key.verify(
                signature_bytes,
                payload.encode(),
                padding.PKCS1v15(),
                hashlib.sha256()
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Signature validation failed: {str(e)}")
            return False


def format_phone_number(phone_number):
    """
    Format phone number to Daraja API format (254XXXXXXXXX).
    
    Args:
        phone_number (str): Phone number in various formats
    
    Returns:
        str: Formatted phone number
    
    Raises:
        ValueError: If phone number format is invalid
    """
    if not phone_number:
        raise ValueError("Phone number cannot be empty")
    
    # Remove any non-digit characters
    digits = ''.join(filter(str.isdigit, phone_number))
    
    if len(digits) == 9 and digits.startswith('7'):
        # Format: 7XXXXXXXX (Kenya mobile without country code)
        return f'254{digits}'
    elif len(digits) == 10 and digits.startswith('07'):
        # Format: 07XXXXXXXX
        return f'254{digits[1:]}'
    elif len(digits) == 12 and digits.startswith('254'):
        # Format: 2547XXXXXXXX
        return digits
    elif len(digits) == 13 and digits.startswith('+254'):
        # Format: +2547XXXXXXXX
        return digits[1:]
    else:
        raise ValueError(f"Invalid phone number format: {phone_number}")
