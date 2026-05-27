import smtplib
from email.message import EmailMessage

import requests

from app.core.config import get_settings


def send_email(to_email: str, subject: str, body_text: str) -> None:
    settings = get_settings()
    provider = settings.email_provider.lower().strip()

    if provider == "resend":
        send_resend_email(to_email, subject, body_text)
        return

    if provider == "smtp":
        send_smtp_email(to_email, subject, body_text)
        return

    raise RuntimeError(f"Unsupported EMAIL_PROVIDER: {settings.email_provider}")


def send_resend_email(to_email: str, subject: str, body_text: str) -> None:
    settings = get_settings()
    if not settings.resend_api_key or not settings.sender_email:
        raise RuntimeError("Resend email is not configured. Set RESEND_API_KEY and EMAIL_FROM.")

    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {settings.resend_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "from": settings.sender_email,
            "to": [to_email],
            "subject": subject,
            "text": body_text,
        },
        timeout=15,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Resend email failed with status {response.status_code}: {response.text}")


def send_smtp_email(to_email: str, subject: str, body_text: str) -> None:
    settings = get_settings()

    # Dev-friendly: if SMTP isn't configured, just log the email.
    if not settings.smtp_host or not settings.sender_email:
        print("EMAIL_DISABLED")
        print("TO:", to_email)
        print("SUBJECT:", subject)
        print(body_text)
        return

    message = EmailMessage()
    message["From"] = settings.sender_email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body_text)

    if settings.smtp_use_ssl:
        server: smtplib.SMTP = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=10)
    else:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10)

    try:
        if settings.smtp_use_tls and not settings.smtp_use_ssl:
            server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(message)
    finally:
        try:
            server.quit()
        except Exception:
            pass
