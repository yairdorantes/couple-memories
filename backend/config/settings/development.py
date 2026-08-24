from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

DEV_CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]

CORS_ALLOWED_ORIGINS = list(dict.fromkeys([*CORS_ALLOWED_ORIGINS, *DEV_CORS_ALLOWED_ORIGINS]))
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:517[3-5]$",
    r"^http://127\.0\.0\.1:517[3-5]$",
    r"^http://192\.168\.\d{1,3}\.\d{1,3}:517[3-5]$",
    r"^http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}:517[3-5]$",
    r"^http://172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:517[3-5]$",
]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
