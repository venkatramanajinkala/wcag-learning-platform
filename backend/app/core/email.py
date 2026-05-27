import smtplib
from email.message import EmailMessage

from app.core.config import get_settings


def send_email(to_email: str, subject: str, body_text: str) -> None:
    settings = get_settings()

    # Dev-friendly: if SMTP isn't configured, just log the email.
    if not settings.smtp_host or not settings.smtp_from:
        print("EMAIL_DISABLED")
        print("TO:", to_email)
        print("SUBJECT:", subject)
        print(body_text)
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from
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
