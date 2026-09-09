FROM python:3.12-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    fonts-liberation \
    fonts-noto-cjk \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY tools/cutpost/requirements.txt /app/tools/cutpost/requirements.txt
RUN pip install --no-cache-dir -r /app/tools/cutpost/requirements.txt

COPY tools/cutpost /app/tools/cutpost
COPY services/xhs-worker /app/services/xhs-worker

ENV PYTHONUNBUFFERED=1
ENV PORT=8787
ENV XHS_CHROME_HEADLESS=1
ENV XHS_CHROME_NO_SANDBOX=1
EXPOSE 8787

CMD ["python", "/app/services/xhs-worker/app.py"]
