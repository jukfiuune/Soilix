import os


def env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


bind = f"0.0.0.0:{env_int('PORT', 5001)}"
workers = env_int("GUNICORN_WORKERS", max(2, os.cpu_count() or 1))
threads = env_int("GUNICORN_THREADS", 4)
worker_class = os.getenv("GUNICORN_WORKER_CLASS", "gthread")
timeout = env_int("GUNICORN_TIMEOUT", 60)
graceful_timeout = env_int("GUNICORN_GRACEFUL_TIMEOUT", 30)
keepalive = env_int("GUNICORN_KEEPALIVE", 5)
max_requests = env_int("GUNICORN_MAX_REQUESTS", 1000)
max_requests_jitter = env_int("GUNICORN_MAX_REQUESTS_JITTER", 100)
worker_tmp_dir = "/dev/shm"
accesslog = "-"
errorlog = "-"
capture_output = True
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")
preload_app = os.getenv("GUNICORN_PRELOAD", "0") == "1"
reload = os.getenv("GUNICORN_RELOAD", "1" if os.getenv("FLASK_ENV") == "development" else "0") == "1"
