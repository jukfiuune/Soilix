FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

COPY . .

ENV PORT=5000

CMD ["gunicorn", "--config", "gunicorn.conf.py", "run:app"]
