# --- Stage 1: Base Node ---
FROM node:20-slim

# Set working dir
WORKDIR /usr/src/app

# Copy package.json și package-lock.json
COPY package*.json ./

# Install Node deps
RUN npm install

# Install Playwright browsers
RUN npx playwright install --with-deps

# --- Stage 2: Python environment ---
# Install Python, pip, tesseract, and system dependencies
RUN apt-get update -y && apt-get install -y \
    python3 python3-venv python3-pip \
    tesseract-ocr \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment for Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip inside venv
RUN pip install --upgrade pip

# Install Python packages in venv
RUN pip install --no-cache-dir pymupdf pytesseract

# --- Stage 3: Copy app ---
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "src/server.js"]
