# ============================================================
# 🎨 Storybook Generator API (FastAPI + OpenRouter)
# ============================================================
# 🔧 Standard Library
# ============================================================
import os
import re
import io
import sys
import json
import uuid
import time
import base64
import random
import hashlib
import tempfile
import textwrap
import logging
from datetime import datetime
from pathlib import Path
from io import BytesIO
from botocore.config import Config
from typing import List, Dict, Tuple, Optional
from fastapi import Request
from PIL import Image, ImageOps
from rembg import remove, new_session
from contextvars import ContextVar
request_id_ctx = ContextVar("request_id", default="unknown")


# ============================================================
# 🌱 Environment
# ============================================================
from dotenv import load_dotenv

load_dotenv()
sys.stdout.reconfigure(encoding="utf-8")

# ============================================================
# 🚀 FastAPI & Pydantic
# ============================================================
from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query
)
from pydantic import BaseModel, Field


#=============================================================
#Runpod S3 CONFIG
#============================================================

# =========================================================
# S3 (LoRA storage)
# =========================================================
import boto3
from botocore.config import Config

S3_BUCKET = os.getenv("S3_BUCKET")
S3_ENDPOINT = os.getenv("S3_ENDPOINT")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY")

LORA_BASE_PATH = os.getenv("LORA_BASE_PATH", "/runpod-volume/models/loras")
RUNPOD_API_KEY = os.getenv("RUNPOD_AUTH_BEARER")
RUNPOD_TRAINING_ENDPOINT_ID = os.getenv("RUNPOD_TRAINING_ENDPOINT_ID")
S3_BUCKET = os.getenv("S3_BUCKET")

if not all([RUNPOD_API_KEY, RUNPOD_TRAINING_ENDPOINT_ID, S3_BUCKET]):
    raise RuntimeError("Missing required environment variables")

RUNPOD_TRAIN_URL = f"https://api.runpod.ai/v2/{RUNPOD_TRAINING_ENDPOINT_ID}/run"
s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name="us-ks-2",
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "path"}
    ),
)

def resolve_user_lora(user_id: str) -> str:
    """
    Ensure user_id.safetensors exists locally.
    Downloads from S3 if missing.
    Returns ComfyUI relative path.
    """
    filename = f"{user_id}.safetensors"
    local_dir = os.path.join(LORA_BASE_PATH, user_id)
    local_path = os.path.join(local_dir, filename)

    if os.path.isfile(local_path):
        return f"{user_id}/{filename}"

    os.makedirs(local_dir, exist_ok=True)

    s3_key = f"models/loras/{user_id}/{filename}"

    try:
        s3.download_file(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Filename=local_path
        )
    except Exception:
        raise RuntimeError(f"LoRA not found: s3://{S3_BUCKET}/{s3_key}")

    return f"{user_id}/{filename}"

def should_apply_lora(prompt: str, trigger_word: str) -> bool:
    if not prompt or not trigger_word:
        return False

    trigger_word = trigger_word.lower()
    prompt_l = prompt.lower()

    return (
        f"<{trigger_word}>" in prompt_l
        or f"@{trigger_word}[" in prompt_l
    )

# ============================================================
# 🧠 Database (MongoDB)
# ============================================================
from pymongo import MongoClient
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)

db = mongo_client["storybook"]
styles_collection = db["user_writing_styles"]

# ============================================================
# 🧠 Prompt Registry (MongoDB-backed)
# ============================================================

from functools import lru_cache
from jinja2 import Template

prompts_collection = db["prompts"]

@lru_cache(maxsize=256)
def get_prompt(key: str) -> str:
    doc = prompts_collection.find_one(
        {"key": key, "active": True},
        sort=[("version", -1)]
    )
    if not doc:
        raise RuntimeError(f"Prompt not found: {key}")
    return doc["content"]

def render_prompt(key: str, **kwargs) -> str:
    template = Template(get_prompt(key))
    return template.render(**kwargs)


GIST_PROMPT = "gist_prompt"
GIST_IMAGE_SYSTEM = "gist_image_system_prompt"
STORY_SYSTEM = "story_system_prompt"
HTML_FORMATTER = "html_formatter_system"
IMAGE_PROMPT_SYSTEM = "image_prompt_system"
FLUX_BACKGROUND_USER = "flux_background_user_prompt"
TITLE_GENERATOR = "title_generator_prompt"
TAGLINE_GENERATOR = "tagline_generator_prompt"
BACK_BLURB_SYSTEM = "back_blurb_system"
BACK_VISUAL_SYSTEM = "back_visual_system"
COVER_VISUAL_SYSTEM = "cover_visual_system"

# ============================================================
styles_collection.create_index(
    "generated_at",
    expireAfterSeconds=60 * 60 * 24 * 90  # 90 days
)
# ============================================================
SESSION_UPLOADS = {}
SESSION_TTL_SECONDS = 60 * 60  # 60 minutes

def cleanup_expired_sessions():
    now = time.time()
    expired = [
        uid for uid, data in SESSION_UPLOADS.items()
        if now - data["created_at"] > SESSION_TTL_SECONDS
    ]

    for uid in expired:
        for p in SESSION_UPLOADS[uid]["files"]:
            try:
                os.unlink(p)
            except:
                pass
        del SESSION_UPLOADS[uid]
        logger.warning(f"[TTL] Cleared expired upload session user_id={uid}")

import threading

def ttl_worker():
    while True:
        try:
            cleanup_expired_sessions()
        except Exception as e:
            logger.error(f"[TTL_WORKER] error={e}")
        time.sleep(300)  # every 5 minutes

threading.Thread(target=ttl_worker, daemon=True).start()

# ============================================================
# 🤖 LLM Client
# ============================================================
from openai import OpenAI

# ============================================================
# 📄 Document Processing
# ============================================================
import pdfplumber
from docx import Document

# ============================================================
# 🌐 Networking
# ============================================================
import requests

# ============================================================
# 🖼 Image Processing
# ============================================================
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ============================================================
# 🧾 Logging
# ============================================================
from logging.handlers import RotatingFileHandler

# ============================================================
# 📦 Utilities
# ============================================================
import qrcode

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_API_URL = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY missing")

client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_API_KEY,
    default_headers={
        "HTTP-Referer": "https://your-site.com",
        "X-Title": "Storybook Generator API"
    }
)

def call_llm(
    *,
    model: str,
    messages: list,
    temperature: float,
    timeout: int,
    purpose: str
):
    start = time.time()
    try:
        logger.info(
    f"[LLM_START] req={request_id_ctx.get()} purpose={purpose} model={model}"
    )


        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            timeout=timeout,
        )

        logger.info(
            f"[LLM_OK] purpose={purpose} model={model} "
            f"duration_s={round(time.time() - start, 2)}"
        )

        return resp

    except Exception as e:
        logger.error(
            f"[LLM_FAIL] purpose={purpose} model={model} "
            f"duration_s={round(time.time() - start, 2)} error={e}"
        )
        raise


# ============================================================
# 🔧 GLOBAL RUNTIME CONFIG (SINGLE SOURCE OF TRUTH)
# ============================================================

RUNPOD_HIDREAM_URL = os.getenv("RUNPOD_HIDREAM_URL")
RUNPOD_HIDREAM_STATUS = os.getenv("RUNPOD_HIDREAM_STATUS")
RUNPOD_AUTH_BEARER = os.getenv("RUNPOD_AUTH_BEARER")
RUNPOD_FLUX_URL = os.getenv("RUNPOD_FLUX_URL")
DEFAULT_TIMEOUT = int(os.getenv("IMAGE_GEN_TIMEOUT_S", "1600"))
POLL_INTERVAL = float(os.getenv("IMAGE_GEN_POLL_INTERVAL_S", "3.0"))
JOB_TIMEOUT = int(os.getenv("JOB_TIMEOUT_S", "600"))

NEGATIVE_PROMPT_TEXT = (
    "multiple legs, deformed fingers, blurry, low quality, low resolution, "
    "deformed eyes, distorted face, deformed mouth, extra limbs, fused fingers, "
    "mutated hands, missing fingers, disfigured, mutated, bad anatomy, bad proportions, "
    "poorly drawn, bad hands, bad face, watermark, signature, text, logo, nsfw, nude, "
    "sexual, worst quality, ugly, jpeg artifacts, pixelated, censored, error, duplicate, "
    "out of frame, cropped, cloned face, grainy, overexposed, underexposed, "
    "blurry, lowres, inconsistent face, inconsistent facial expressions, long neck, "
    "cartoon, overlapping bodies, fused people, duplicate heads, malformed body, "
    "overlapping bodies, crowd, close overlap,distorted legs,nude,cartoon, anime, drawing, painting, artistic, abstract, concept art, "
    "cel-shaded, flat lighting, sketch, unrealistic, inconsistent tone"
)


# ============================================================
# ----------------------------
# GLOBAL LOGGING SETUP
# ----------------------------
LOG_FILE = "app.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        RotatingFileHandler(LOG_FILE, maxBytes=5_000_000, backupCount=5),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("storybook_api")


# ============================================================
# 🧠 QUESTIONNAIRE LLM FALLBACK (ONLY)
# ============================================================

QUESTIONNAIRE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "xiaomi/mimo-v2-flash:free",
]

def call_questionnaire_llm(
    messages,
    temperature=0.7,
    timeout=60,
):
    last_error = None
    primary_model = QUESTIONNAIRE_MODELS[0]

    for idx, model in enumerate(QUESTIONNAIRE_MODELS):
        try:
            # 🔍 Attempt log
            logger.info(f" Questionnaire LLM attempt [{idx+1}/{len(QUESTIONNAIRE_MODELS)}]: {model}")

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                timeout=timeout,
            )

            # 🔄 Shift detection log
            if idx > 0:
                logger.warning(
                    f"🔁 Questionnaire LLM SHIFTED | "
                    f"from={primary_model} → to={model}"
                )

            logger.info(f"[OK] Questionnaire LLM success: {model}")
            return response.choices[0].message.content.strip()

        except Exception as e:
            last_error = str(e)

            # ❌ Failure log
            logger.error(
                f"❌ Questionnaire LLM failed | "
                f"model={model} | "
                f"error={e}"
            )

            # Small backoff
            time.sleep(0.8)

    # ❌ Total failure
    logger.critical(
        "🚨 Questionnaire LLM DOWN | "
        f"all_models_failed | last_error={last_error}"
    )

    raise HTTPException(
        status_code=503,
        detail="Questionnaire service temporarily unavailable"
    )


# ============================================================
# 🧠 Setup (Production Safe)
# ============================================================


SECOND_QUESTION = (
    "What happened? List the key incidents in order, and also mention every important person."
)

app = FastAPI(
    title="Storybook Generator API",
    version="1.0",
    description="An API to guide users through a story creation questionnaire and generate cinematic story gists."
)
@app.middleware("http")
async def request_logger(request: Request, call_next):
    request_id = uuid.uuid4().hex[:12]
    request_id_ctx.set(request_id)
    start_time = time.time()

    logger.info(
        f"[REQ_START] id={request_id} "
        f"method={request.method} path={request.url.path}"
    )

    try:
        response = await call_next(request)
    except Exception as e:
        logger.exception(f"[REQ_ERROR] id={request_id} error={e}")
        raise

    duration = round((time.time() - start_time) * 1000, 2)

    logger.info(
        f"[REQ_END] id={request_id} "
        f"status={response.status_code} "
        f"duration_ms={duration}"
    )

    response.headers["X-Request-ID"] = request_id
    return response
@app.middleware("http")
async def ttl_cleanup_middleware(request: Request, call_next):
    cleanup_expired_sessions()
    return await call_next(request)


# ============================================================
# 📘 Models
# ============================================================

class QA(BaseModel):
    question: str
    answer: str

class Conversation(BaseModel):
    conversation: List[QA]

class AnswerInput(BaseModel):
    conversation: List[QA]
    answer: str

class GistInput(BaseModel):
    user_id: Optional[str] = None
    conversation: List[QA]
    genre: str = "Family"

class StartResponse(BaseModel):
    chat: List[Tuple[str, str]]
    conversation: List[QA]

class NextResponse(BaseModel):
    chat: List[Tuple[str, str]]
    conversation: List[QA]

class GistResponse(BaseModel):
    user_id: Optional[str] = None
    genres: List[str]
    gist: str


# ============================================================
# 🧩 Core Logic
# ============================================================

def generate_next_question(conversation):
    logger.info("LLM generating next question")

    if len(conversation) == 0:
        return "Why write this book?"

    context = "\n".join(
        [f"Q{i+1}: {c.question}\nA{i+1}: {c.answer}" for i, c in enumerate(conversation)]
    )

    messages = [
        {
            "role": "system",
            "content": (
                "Ask one simple story-development question (6–12 words). "
                "Keep it conversational, short, and creative."
            ),
        },
        {"role": "user", "content": f"Conversation so far:\n{context}\nNext question:"},
    ]

    # 🔥 Fallback ONLY here
    return call_questionnaire_llm(
        messages=messages,
        temperature=0.7,
    )


def generate_gist(conversation, genre="Family",user_id: str | None = None, model="meta-llama/llama-3.3-70b-instruct:free"):
    logger.info("Calling LLM for story gist")

    """Generate cinematic story gist from questionnaire."""

    context = "\n".join(
        [f"Q{i+1}: {c.question}\nA{i+1}: {c.answer}" for i, c in enumerate(conversation)]
    )
    
    user_style_text = ""
    style_example = ""
    user_genre_map = {}
    static_genre_map = {}
    if user_id:
        user_genre_map = load_genre_style_map(user_id)
        static_genre_map = load_static_genre_style_map(user_id)

    genres = parse_genres(genre)
    styles = []
    examples = []

    for g in genres:
    # 1️⃣ User-specific genre (highest priority)
        if g in user_genre_map:
            styles.append(user_genre_map[g]["writing_style"])
            examples.append(user_genre_map[g]["example"])

    # 2️⃣ Static narrative genre (Ma’am’s books)
        elif g in static_genre_map:
            styles.append(static_genre_map[g]["writing_style"])
            examples.append(static_genre_map[g]["example"])

    # 3️⃣ Hard fallback (system)
        else:
            fallback = genre_writing_style(g)
            if fallback:
                styles.append(fallback)


    if not styles:
        styles = [genre_writing_style(g) for g in genres if genre_writing_style(g)]

    user_style_text = " ".join(styles)


    if examples:
        style_example = max(examples, key=len)

    gist_prompt = render_prompt(
    GIST_PROMPT,
    user_style_text=user_style_text or "Gentle, cinematic children's storytelling.",
    style_example=style_example or "",
    genre=genre
)

    messages = [
        {"role": "system", "content": gist_prompt},
        {"role": "user", "content": f"Questionnaire responses:\n{context}"},
    ]

    try:
        response = call_llm(
        model=model,
        messages=messages,
        temperature=0.6,
        timeout=60,
        purpose="gist_generation"
)
        logger.info(
        f"[ARTIFACT] req={request_id_ctx.get()} type=gist ttl=24h"
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gist generation failed: {str(e)}")
# hidream_preview_api_base64.py
# -------------------------------------------------
# HiDream / RunPod CONFIG (Gist Images)
# -------------------------------------------------
HEADERS = {
    "Authorization": f"Bearer {RUNPOD_AUTH_BEARER}",
    "Content-Type": "application/json",
}

NEGATIVE_PROMPT_GIST = (
    "blurry, anime, cartoon, illustration, painterly, oil painting, "
    "watercolor, sketch, surreal, abstract, text, watermark"
)


def generate_image_prompt_from_gist(gist: str) -> str:
    response = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct:free",
        messages=[
            {"role": "system", "content": get_prompt(GIST_IMAGE_SYSTEM)},
            {"role": "user", "content": gist},
        ],
        temperature=0.3,
        timeout=60,
    )

    prompt = response.choices[0].message.content.strip()
    if len(prompt) < 50:
        raise RuntimeError("Invalid image prompt from gist")

    return prompt

def get_gist_dimensions(orientation: str):
    o = (orientation or "landscape").lower()
    if o == "portrait":
        return 768, 1024
    if o == "square":
        return 1024, 1024
    return 1024, 768

def build_hidream_workflow(prompt: str, width: int, height: int, seed: int):
    return {
        "input": {
            "workflow": {
                "54": {"class_type": "QuadrupleCLIPLoader", "inputs": {
                    "clip_name1": "clip_l_hidream.safetensors",
                    "clip_name2": "clip_g_hidream.safetensors",
                    "clip_name3": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                    "clip_name4": "llama_3.1_8b_instruct_fp8_scaled.safetensors",
                }},
                "55": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
                "69": {"class_type": "UNETLoader", "inputs": {
                    "unet_name": "hidream_i1_full_fp16.safetensors",
                    "weight_dtype": "default",
                }},
                "70": {"class_type": "ModelSamplingSD3", "inputs": {"shift": 3.0, "model": ["69", 0]}},
                "16": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["54", 0]}},
                "40": {"class_type": "CLIPTextEncode", "inputs": {"text": NEGATIVE_PROMPT_GIST, "clip": ["54", 0]}},
                "53": {"class_type": "EmptySD3LatentImage", "inputs": {
                    "width": width, "height": height, "batch_size": 1}},
                "3": {"class_type": "KSampler", "inputs": {
                    "seed": seed, "steps": 30, "cfg": 5,
                    "sampler_name": "euler", "scheduler": "simple",
                    "denoise": 1,
                    "model": ["70", 0],
                    "positive": ["16", 0],
                    "negative": ["40", 0],
                    "latent_image": ["53", 0],
                }},
                "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["55", 0]}},
                "9": {"class_type": "SaveImage", "inputs": {
                    "filename_prefix": f"gist_{uuid.uuid4().hex[:6]}",
                    "images": ["8", 0],
                }},
            }
        }
    }

def build_lora_hidream_workflow(
    *,
    prompt: str,
    negative_prompt: str,
    width: int,
    height: int,
    seed: int,
    lora_name: str,
    lora_strength: float
):
    return {
        "input": {
            "workflow": {
                "54": {
                    "class_type": "QuadrupleCLIPLoader",
                    "inputs": {
                        "clip_name1": "clip_l_hidream.safetensors",
                        "clip_name2": "clip_g_hidream.safetensors",
                        "clip_name3": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                        "clip_name4": "llama_3.1_8b_instruct_fp8_scaled.safetensors",
                    },
                },
                "55": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
                "69": {"class_type": "UNETLoader", "inputs": {
                    "unet_name": "hidream_i1_full_fp16.safetensors",
                    "weight_dtype": "default",
                }},
                "71": {"class_type": "LoraLoaderModelOnly", "inputs": {
                    "lora_name": lora_name,
                    "strength_model": lora_strength,
                    "model": ["69", 0],
                }},
                "16": {"class_type": "CLIPTextEncode", "inputs": {
                    "text": prompt,
                    "clip": ["54", 0],
                }},
                "40": {"class_type": "CLIPTextEncode", "inputs": {
                    "text": negative_prompt,
                    "clip": ["54", 0],
                }},
                "53": {"class_type": "EmptySD3LatentImage", "inputs": {
                    "width": width,
                    "height": height,
                    "batch_size": 1,
                }},
                "3": {"class_type": "KSampler", "inputs": {
                    "seed": seed,
                    "steps": 30,
                    "cfg": 5,
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "denoise": 1,
                    "model": ["71", 0],
                    "positive": ["16", 0],
                    "negative": ["40", 0],
                    "latent_image": ["53", 0],
                }},
                "8": {"class_type": "VAEDecode", "inputs": {
                    "samples": ["3", 0],
                    "vae": ["55", 0],
                }},
                "9": {"class_type": "SaveImage", "inputs": {
                    "filename_prefix": f"lora_{uuid.uuid4().hex[:6]}",
                    "images": ["8", 0],
                }},
            }
        }
    }


def extract_base64_image(resp: dict) -> str:
    images = resp.get("output", {}).get("images", [])
    if not images:
        raise RuntimeError("No images returned")
    return images[0]["data"]


def generate_gist_image(prompt: str, width: int, height: int, seed: int) -> str:
    payload = build_hidream_workflow(prompt, width, height, seed)

    # 1️⃣ Start job
    r = requests.post(
        RUNPOD_HIDREAM_URL,
        headers=HEADERS,
        json=payload,
        timeout=30
    )

    if r.status_code not in (200, 201):
        raise RuntimeError(f"RunPod start failed: {r.text}")

    job = r.json()
    job_id = job.get("id")
    logger.info(
    f"[IMG_JOB_START] req={request_id_ctx.get()} job_id={job_id}"
    )

    if not job_id:
        raise RuntimeError("RunPod did not return job id")

    # 2️⃣ Poll status
    deadline = time.time() + 300
    while time.time() < deadline:
        status = requests.get(
            RUNPOD_HIDREAM_STATUS.format(job_id),
            headers=HEADERS,
            timeout=30
        )
        logger.debug(
        f"[IMG_JOB_POLL] req={request_id_ctx.get()} job_id={job_id} status={str}"
        )

        if status.status_code != 200:
            raise RuntimeError("RunPod status check failed")

        data = status.json()
        state = data.get("status", "").upper()

        if state == "COMPLETED":
            images = data.get("output", {}).get("images", [])
            if not images:
                raise RuntimeError("RunPod completed but returned no images")
            return images[0]["data"]

        if state == "FAILED":
            raise RuntimeError("RunPod job failed")

        time.sleep(2)

    raise RuntimeError("RunPod image generation timed out")


def generate_preview_images_from_gist(gist: str) -> Dict:
    prompt = generate_image_prompt_from_gist(gist)
    seed = random.randint(1, 1_000_000_000)

    images = {}
    for o in ("landscape", "portrait", "square"):
        w, h = get_gist_dimensions(o)
        try:
           images[o] = {
            "width": w,
            "height": h,
            "base64": generate_gist_image(prompt, w, h, seed),
        }
        except Exception as e:
            images[o] = {
            "width": w,
            "height": h,
            "error": str(e),
        }

    return images
# ============================================================
# writing_style_story_generator_api.py

def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value

RUNPOD_AUTH_BEARER = require_env("RUNPOD_AUTH_BEARER")
RUNPOD_HIDREAM_URL = require_env("RUNPOD_HIDREAM_URL")
RUNPOD_HIDREAM_STATUS = require_env("RUNPOD_HIDREAM_STATUS")
RUNPOD_FLUX_URL = require_env("RUNPOD_FLUX_URL")
RUNPOD_FACESWAP_URL = require_env("RUNPOD_FACESWAP_URL")
RUNPOD_BANANA_ENDPOINT = require_env("RUNPOD_BANANA_ENDPOINT")
MONGO_URI = require_env("MONGO_URI")
S3_BUCKET = require_env("S3_BUCKET")
S3_ENDPOINT = require_env("S3_ENDPOINT")
S3_ACCESS_KEY = require_env("S3_ACCESS_KEY")
S3_SECRET_KEY = require_env("S3_SECRET_KEY")

RUNPOD_ENDPOINT_ID = require_env("RUNPOD_CAPTION_ENDPOINT_ID")
RUNPOD_API_KEY = require_env("RUNPOD_AUTH_BEARER")

RUNPOD_URL = f"https://api.runpod.ai/v2/{RUNPOD_ENDPOINT_ID}/runsync"
# =========================================================
# IMAGE HELPERS
# =========================================================
TARGET_SIZE = 512
PAD_COLOR = (0, 0, 0)

def pad_to_square(img: Image.Image):
    w, h = img.size
    size = max(w, h)
    canvas = Image.new("RGB", (size, size), PAD_COLOR)
    canvas.paste(img, ((size - w) // 2, (size - h) // 2))
    return canvas

def process_image(image_bytes: bytes) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    img = ImageOps.exif_transpose(img)
    fg = remove(img, session=rembg_session)
    bg = Image.new("RGBA", fg.size, PAD_COLOR + (255,))
    composed = Image.alpha_composite(bg, fg).convert("RGB")
    final = pad_to_square(composed).resize((TARGET_SIZE, TARGET_SIZE), Image.LANCZOS)
    buf = io.BytesIO()
    final.save(buf, format="PNG")
    return buf.getvalue()

def encode_image_from_s3(key: str) -> str:
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    img = Image.open(io.BytesIO(obj["Body"].read())).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode()

# =========================================================
# LOGGING
# =========================================================
BASE_LOG_DIR = "logs"
os.makedirs(BASE_LOG_DIR, exist_ok=True)

# =========================================================
# TEXT EXTRACTION HELPERS
# =========================================================
def extract_text_from_pdf(path: Path) -> str:
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_text_from_docx(path: Path) -> str:
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text_from_txt(path: Path) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name="us-ks-2",
    config=Config(s3={"addressing_style": "path"})
)

rembg_session = new_session("u2net")
# =========================================================
# BOOK TYPE CLASSIFIER
# =========================================================
def classify_book_type(text: str) -> str:
    logger.info(...)
    prompt = (
        "Classify this book into ONE category:\n"
        "- narrative_story\n"
        "- coloring_or_activity_book\n"
        "- poetry_or_rhymes\n"
        "- instructional\n\n"
        f"TEXT:\n{text[:2000]}"
    )

    response = client.chat.completions.create(
        model="xiaomi/mimo-v2-flash:free",
        messages=[
            {"role": "system", "content": "You are a book classification engine."},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        max_tokens=10,
    )

    book_type = response.choices[0].message.content.strip().lower()
    logger.info(f" Classified as {book_type}")
    return book_type

# =========================================================
# METADATA PROMPT BUILDER
# =========================================================
def build_prompt(books_text: Dict[str, str]) -> str:
    prompt = "Extract metadata from each book. Return JSON ONLY.\n\n"

    for book_id, text in books_text.items():
        prompt += f"{book_id}:\n\"\"\"{text}\"\"\"\n\n"

    prompt += (
        "{\n"
        "  \"book_id\": {\n"
        "    \"title\": \"\",\n"
        "    \"writing_style\": \"\",\n"
        "    \"genre\": \"\",\n"
        "    \"example\": \"\"\n"
        "  }\n"
        "}"
    )

    return prompt
# =========================================================

def load_genre_style_map(user_id: str) -> dict:
    doc = styles_collection.find_one({"user_id": user_id})
    if not doc:
        return {}

    genre_map = {}

    for book in doc.get("books", []):
        genre = normalize_genre(book.get("genre", ""))
        example = book.get("example", "").strip()
        style = book.get("writing_style", "").strip()

        if not genre or not example:
            continue

        if genre not in genre_map or len(example) > len(genre_map[genre]["example"]):
            genre_map[genre] = {
                "writing_style": style,
                "example": example
            }

    return genre_map
# =========================================================
# STATIC GENRE STYLE MAP (NARRATIVE BOOKS ONLY)
# =========================================================

ALLOWED_BOOK_TYPES_FOR_STATIC_STYLE = {
    "narrative_story",
    "memoir",
    "poetry",
    "keepsake book",
    "fiction",
    "travel narrative",
}

def map_to_core_genre(raw_genre: str) -> str:
    g = (raw_genre or "").lower()

    if any(x in g for x in ["memoir", "keepsake", "family", "personal", "poetry"]):
        return "family"

    if any(x in g for x in ["fantasy", "magic"]):
        return "fantasy"

    if any(x in g for x in ["travel", "journey", "adventure"]):
        return "adventure"

    if "fiction" in g:
        return "fiction"

    return "unknown"


def build_static_genre_style_map(books: list[dict]) -> dict:
    genre_map: dict[str, dict] = {}

    for book in books:
        book_type = (book.get("book_type") or "").lower()
        if book_type not in ALLOWED_BOOK_TYPES_FOR_STATIC_STYLE:
            continue

        core_genre = map_to_core_genre(book.get("genre", ""))
        if core_genre == "unknown":
            continue

        entry = genre_map.setdefault(
            core_genre,
            {"styles": [], "examples": []}
        )

        style = (book.get("writing_style") or "").strip()
        example = (book.get("example") or "").strip()

        if style:
            entry["styles"].append(style)
        if example:
            entry["examples"].append(example)

    final = {}
    for genre, data in genre_map.items():
        if not data["examples"]:
            continue

        final[genre] = {
            "writing_style": " ".join(set(data["styles"])),
            "example": max(data["examples"], key=len),
        }

    return final


def load_static_genre_style_map(user_id: str) -> dict:
    doc = styles_collection.find_one({"user_id": user_id})
    if not doc:
        return {}

    return build_static_genre_style_map(doc.get("books", []))

def save_writing_style(
    *,
    user_id: str,
    genre: str,
    story_text: str
):
    if not user_id or not story_text:
        return

    try:
        prompt = (
            "Analyze the writing style of the following story.\n\n"
            "Return JSON ONLY with:\n"
            "{\n"
            '  "writing_style": "...",\n'
            '  "example": "..."\n'
            "}\n\n"
            "STORY:\n"
            f"{story_text[:6000]}"
        )

        resp = client.chat.completions.create(
            model="xiaomi/mimo-v2-flash:free",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            timeout=60,
        )

        parsed = extract_json_from_text(
            resp.choices[0].message.content.strip()
        )

        if not parsed:
            return

        styles_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "generated_at": datetime.utcnow()
                },
                "$push": {
                    "books": {
                        "genre": normalize_genre(genre),
                        "writing_style": parsed.get("writing_style", ""),
                        "example": parsed.get("example", ""),
                        "source": "generated_story"
                    }
                }
            },
            upsert=True
        )

        logger.info(
            f"[STYLE_SAVED] user={user_id} genre={genre}"
        )

    except Exception as e:
        logger.warning(f"[STYLE_SAVE_FAIL] {e}")


# ============================================================
# story_generator_api.py
# FastAPI Story Page + Prompt Generator
# Single-call API: generates exactly N pages and one cinematic image prompt per page
# -----------------------------
# Config / Client
# -----------------------------
BASE_URL = os.getenv("OPENROUTER_BASE_URL")
STORY_MODEL = os.getenv("STORY_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
PROMPT_MODEL = os.getenv("PROMPT_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
# -----------------------------
# Pydantic models
# -----------------------------
class StoryRequest(BaseModel):
    gist: str = Field(..., description="Story gist text")
    num_characters: int = Field(..., description="Number of characters (kept for compatibility)")
    character_details: str = Field(..., description="Character details, one per line, format: Name: description")
    genre: str = Field("Family", description="Genre name")
    num_pages: int = Field(5, description="Exact number of pages to generate")
    orientation: str = "Portrait"
    user_id: Optional[str] = None


class PageOutput(BaseModel):
    page: int
    text: str
    prompt: str
    html: str 

class StoryResponse(BaseModel):
    pages: List[PageOutput]
    ready_for_images: bool
    message: Optional[str]

# -----------------------------
# Helpers (extracted + improved from your functions)
# -----------------------------
def regen_story_text(story_text: str) -> str:
    if not story_text:
        return story_text

    try:
        resp = call_llm(
            model=STORY_MODEL,
            messages=[
                {"role": "system", "content": get_prompt("regen_story_system")},
                {"role": "user", "content": render_prompt(
                    "regen_story_user_prompt",
                    story_text=story_text
                )}
            ],
            temperature=0.6,
            timeout=60,
            purpose="regen_story"
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"[REGEN_STORY_FAIL] {e}")
        return story_text

def regen_image_prompt(
    new_story_text: str,
    old_prompt: str,
    character_map: dict
) -> str:
    if not old_prompt:
        return old_prompt

    try:
        resp = call_llm(
            model=PROMPT_MODEL,
            messages=[
                {"role": "system", "content": get_prompt("regen_prompt_system")},
                {"role": "user", "content": render_prompt(
                    "regen_prompt_user_prompt",
                    new_story_text=new_story_text,
                    old_prompt=old_prompt
                )}
            ],
            temperature=0.7,
            timeout=60,
            purpose="regen_prompt"
        )

        raw = resp.choices[0].message.content.strip()
        return inject_character_descriptions(raw, character_map)

    except Exception as e:
        logger.error(f"[REGEN_PROMPT_FAIL] {e}")
        return old_prompt


def regen_image(prompt: str, page_num: int, orientation: str) -> Optional[str]:
    try:
        img = generate_image_from_prompt(
            prompt,
            NEGATIVE_PROMPT_TEXT,
            page_num=page_num,
            orientation=orientation
        )

        if not img:
            return None

        buf = BytesIO()
        img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()

    except Exception as e:
        logger.error(f"[REGEN_IMAGE_FAIL] page={page_num} error={e}")
        return None
    
def regenerate_page(
    story_text: str,
    old_prompt: str,
    character_details: str,
    page_num: int,
    orientation: str,
    genre: str
):
    character_map = {}
    for line in character_details.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            character_map[k.strip()] = v.strip()

    new_story = regen_story_text(story_text)
    new_prompt = regen_image_prompt(new_story, old_prompt, character_map)
    image_b64 = regen_image(new_prompt, page_num, orientation)

# ✅ NEW: regenerate HTML
    new_html = regenerate_html_for_page(new_story, genre)

    return new_story, new_prompt, new_html, image_b64


def extract_json_from_text(text: str) -> Optional[Dict]:
    """
    Try to extract a JSON object from a blob of text.
    1) Try direct json.loads
    2) If that fails, locate the first balanced {...} and load that
    Returns dict or None
    """
    text = text.strip()

    # 1) direct parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2) find first balanced braces block
    brace_stack = []
    start_idx = None
    for i, ch in enumerate(text):
        if ch == '{':
            if start_idx is None:
                start_idx = i
            brace_stack.append(i)
        elif ch == '}':
            if brace_stack:
                brace_stack.pop()
                if not brace_stack and start_idx is not None:
                    candidate = text[start_idx:i+1]
                    try:
                        return json.loads(candidate)
                    except Exception:
                        # keep searching
                        start_idx = None
    return None

def enforce_page_line_limit(text: str, max_lines: int) -> str:
    """
    Hard trim page text to fit physical page height.
    1 line = 1 sentence OR 1 blank line
    """
    if not text:
        return ""

    lines = text.split("\n")
    trimmed = []
    count = 0

    for line in lines:
        trimmed.append(line)
        count += 1
        if count >= max_lines:
            break

    return "\n".join(trimmed).rstrip()




def inject_character_descriptions(prompt, character_map):
    if re.search(r'@\w+\s*\[', prompt):
        return prompt
    """
    Injects @Name[desc] logic with:
    - Unicode normalization
    - First 3 characters shown clearly
    - Remaining characters implied softly
    - Gender consistency hint
    - Replaces ALL plain name occurrences (not just once)
    - Still prevents double-injecting @Name[...] if already present
    - Safe for regeneration loops
    """

    # ------------------------------------------------------
    # 1) Normalize unicode / punctuation
    # ------------------------------------------------------
    prompt = (
        prompt.replace("\u00A0", " ")
              .replace("\u202F", " ")
              .replace("\u2009", " ")
              .replace("\u2011", "-")
              .replace("\u2010", "-")
              .replace("–", "-")
              .replace("—", "-")
    )

    # ------------------------------------------------------
    # 2) Gender consistency detection
    # ------------------------------------------------------
    has_female = any(
        any(word in desc.lower() for word in ["female", "woman", "girl"])
        for desc in character_map.values()
    )
    has_male = any(
        any(word in desc.lower() for word in ["male", "man", "boy"])
        for desc in character_map.values()
    )

    if has_male and not has_female:
        gender_hint = "All visible individuals are male; no female, woman, or girl figures appear."
    elif has_female and not has_male:
        gender_hint = "All visible individuals are female; no male, man, or boy figures appear."
    else:
        gender_hint = ""

    # ------------------------------------------------------
    # 3) Visible vs implied
    # ------------------------------------------------------
    names = list(character_map.keys())
    visible_names = names[:3]
    implied_names = names[3:]

    # ------------------------------------------------------
    # 4) Inject @Name[desc] for ALL occurrences (SAFE)
    # ------------------------------------------------------
    for name in visible_names:
        desc = character_map[name].strip()

        # Skip if already injected
        if re.search(rf'@{re.escape(name)}\s*\[', prompt, flags=re.IGNORECASE):
            continue

        pattern = rf'(?<!@)\b{re.escape(name)}\b'
        replacement = f"@{name}[{desc}]"
        prompt = re.sub(pattern, replacement, prompt, flags=re.IGNORECASE)

    # ------------------------------------------------------
    # 5) Add softly implied background characters
    # ------------------------------------------------------
    if implied_names:
        implied_text = f" (the rest — {', '.join(implied_names)} — appear softly blurred in the background)"
        if implied_text not in prompt:
            prompt += implied_text

    # ------------------------------------------------------
    # 6) Add gender hint if missing
    # ------------------------------------------------------
    if gender_hint and gender_hint not in prompt:
        prompt += f" {gender_hint}"

    return prompt

def extract_page_from_story(story: str, page_tag: str):
    """
    Extracts text for 'Page X' supporting multiple tag styles.
    Returns page text or None.
    """
    story = story.replace("\r\n", "\n")
    number = int(re.findall(r'\d+', page_tag)[0])
    next_tag = f"Page {number+1}"

    pattern = (
        rf"(?i)"                                   # case-insensitive
        rf"(?:^|\n)(?:\*\*|--|\(|\s*)?"            # optional markdown wrapper
        rf"\s*{re.escape(page_tag)}\s*"            # the tag itself
        rf"(?:\*\*|--|\)|:)?\s*\n+"                # closing wrappers
        rf"(.*?)"                                  # capture page content
        rf"(?=\n(?:\*\*|--|\(|\s*)?Page\s+{number+1}\b"  # stop at next Page N
        rf"(?:\*\*|--|\)|:)?\s*\n+|$)"              # or end of text
    )

    match = re.search(pattern, story, re.DOTALL)
    if match:
        text = match.group(1).strip()
        text = re.split(r"(?i)\bPage\s+\d+\b", text)[0].strip()
        return text

    return None

# -----------------------------
# Core generation function (keeps single-call behavior)
# -----------------------------

def genre_visual_style(genre):
    genre_styles = {
        "family": (
            "warm cozy lighting, soft pastel tones, gentle ambience, homely scenery, "
            "emotional warmth, friendly joyful atmosphere"
        ),
        "fantasy": (
            "ethereal glow, magical particles floating, enchanted lighting, warm light rays, "
            "mystical haze, glowing magical accents"
        ),
        "adventure": (
            "dramatic shadows, rugged terrain, dust particles, high contrast, "
            "energetic composition, cinematic action mood"
        ),
        "sci-fi": (
            "neon holograms, futuristic reflections, cool ambience, metallic textures, "
            "glowing circuitry, high-tech atmosphere"
        ),
        "mystery": (
            "moody gradients, noir ambience, soft fog, muted tones, suspense shadows, "
            "silhouetted lighting"
        ),

       "birthday": (
            "bright colorful decorations, vibrant party ambience, confetti floating, "
            "warm celebratory lighting, joyful expressions, balloons and ribbons, "
            "soft glowing highlights"
        ),
        "corporate promotion": (
            "clean professional ambience, elegant soft lighting, subtle depth-of-field, "
            "modern office environment, confidence-filled atmosphere, muted premium tones, "
            "award-ceremony glow"
        ),
        "housewarming": (
            "warm inviting home interior, soft ambient light, cozy decor, indoor plants, "
            "fresh welcoming atmosphere, gentle shadows, warm wooden textures"
        ),
        "marriage": (
            "romantic soft-focus lighting, elegant warm glow, floral decorations, "
            "cinematic highlights, gentle bokeh, pastel romantic tones, "
            "beautiful ceremonial ambience"
        ),
        "baby shower": (
            "soft pastel colors, gentle warm light, cute decorations, baby toys, "
            "delicate joyful atmosphere, balloons and soft textures, dreamy nursery tones"
        ),
    }

    return genre_styles.get(genre, "")


def fallback_writing_style(genre: str) -> str:
    return (
        f"Gentle, imaginative storytelling suited for {genre}. "
        "Simple language, clear emotional beats, and vivid but accessible imagery. "
        "Warm pacing designed for young readers."
    )

def normalize_genre(g: str) -> str:
    if not g:
        return ""

    g = g.lower()

    # collapse complex labels into core genres
    if "family" in g or "keepsake" in g:
        return "family"
    if "fantasy" in g:
        return "fantasy"
    if "adventure" in g:
        return "adventure"
    if "sci-fi" in g or "science" in g:
        return "sci-fi"
    if "mystery" in g:
        return "mystery"
    if "birthday" in g:
        return "birthday"
    if "corporate" in g or "business" in g:
        return "corporate promotion"
    if "housewarming" in g:
        return "housewarming"
    if "marriage" in g or "wedding" in g:
        return "marriage"
    if "baby" in g:
        return "baby shower"

    return g.strip()

def parse_genres(genre: str) -> list[str]:
    separators = ["+", ",", "|", "/"]
    normalized = genre

    for sep in separators:
        normalized = normalized.replace(sep, ",")

    # normalize + dedupe
    seen = set()
    result = []
    for g in normalized.split(","):
        g = normalize_genre(g)
        if g and g not in seen:
            seen.add(g)
            result.append(g)

    return result



def genre_writing_style(genre: str) -> str:
    writing_styles = {
        "family": (
        "Warm, intimate, emotionally grounded prose. "
        "Gentle poetic rhythm, soft sensory detail, "
        "deep focus on relationships, memory, and quiet love. "
        "Emotion is implied, never explained."
    ),

    "fantasy": (
        "Lyrical, restrained, emotionally anchored fantasy prose. "
        "Magic is subtle and implied. "
        "Wonder arises through atmosphere and feeling, not spectacle."
    ),

    "adventure": (
        "Forward-moving cinematic prose with emotional clarity. "
        "Action is clean and purposeful, never chaotic. "
        "Momentum balanced with warmth and reflection."
    ),

    "sci-fi": (
        "Elegant, human-centered speculative prose. "
        "Technology is present but never dominant. "
        "Emotional truth always outweighs technical explanation."
    ),

    "mystery": (
        "Controlled, moody storytelling with restraint. "
        "Short sentences, implied tension, quiet unease. "
        "Atmosphere over shock."
    ),

    "birthday": (
        "Joyful, celebratory storytelling with emotional softness. "
        "Light rhythm, playful warmth, family closeness, "
        "and memory-focused happiness."
    ),

    "corporate promotion": (
        "Polished, confident narrative with emotional intelligence. "
        "Professional tone softened by human warmth and aspiration."
    ),

    "housewarming": (
        "Comforting, reflective prose centered on belonging. "
        "Home as an emotional anchor. "
        "Soft pacing and sensory calm."
    ),

    "marriage": (
        "Romantic, elegant prose with emotional depth. "
        "Connection expressed through moments, not declarations."
    ),

    "baby shower": (
        "Tender, nurturing prose. "
        "Gentle rhythm, hope, softness, and emotional safety."
    ),
}

    return writing_styles.get(genre, "")

def blend_writing_styles(genres: list[str]) -> str:
    styles = []
    for g in genres:
        style = genre_writing_style(g)
        if style:
            styles.append(style)
    return " ".join(styles)

def generate_html_for_pages(story_pages: Dict[str, str], genre: str) -> Dict[str, str]:
    """
    Generates semantic HTML for ALL pages in a SINGLE LLM call.
    Returns dict: { "Page 1": "<div>...</div>", ... }
    """

    system_prompt = render_prompt(
    HTML_FORMATTER,
    genre=genre
    )


    user_prompt = json.dumps(story_pages, ensure_ascii=False)

    resp = client.chat.completions.create(
        model=STORY_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.4,
        timeout=60,
    )

    raw = resp.choices[0].message.content.strip()

    html_map = extract_json_from_text(raw)
    if not html_map:
        raise RuntimeError("Failed to parse HTML JSON from LLM")

    return html_map

def regenerate_html_for_page(page_text: str, genre: str) -> str:
    """
    Regenerates semantic HTML for a single page using the same formatter.
    """
    system_prompt = render_prompt(
        HTML_FORMATTER,
        genre=genre
    )

    pages_payload = {
        "Page 1": page_text
    }

    resp = client.chat.completions.create(
        model=STORY_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(pages_payload, ensure_ascii=False)}
        ],
        temperature=0.4,
        timeout=60,
    )

    raw = resp.choices[0].message.content.strip()
    html_map = extract_json_from_text(raw)

    if not html_map or "Page 1" not in html_map:
        raise RuntimeError("Failed to regenerate HTML")

    return html_map["Page 1"]


# --------------------------------------------------
# PAGE LAYOUT CONFIG (SINGLE SOURCE OF TRUTH)
# --------------------------------------------------
PAGE_LINE_LIMITS = {
    "portrait": 12,
    "landscape": 8,
    "square": 10
}

# Default orientation (you can later pass this from request)
orientation = "portrait"
orientation = orientation.lower()
max_lines = PAGE_LINE_LIMITS.get(orientation.lower(), 10)

def generate_story_and_prompts(story_gist: str, num_characters: int, character_details: str, genre: str, num_pages: int,orientation: str,user_id: Optional[str]):
    
    user_genre_map = {}
    static_genre_map = {}
    if user_id:
        user_genre_map = load_genre_style_map(user_id)
        static_genre_map = load_static_genre_style_map(user_id)


    genres = parse_genres(genre)
# Always apply Ma'am-style base
    writing_styles = []
    examples = []
    unknown_genres = []

    for g in genres:
    # 1️⃣ User uploaded books
        if g in user_genre_map:
            writing_styles.append(user_genre_map[g]["writing_style"])
            examples.append(user_genre_map[g]["example"])

    # 2️⃣ Static narrative genres (Ma’am’s books)
        elif g in static_genre_map:
            writing_styles.append(static_genre_map[g]["writing_style"])
            examples.append(static_genre_map[g]["example"])

    # 3️⃣ System fallback
        else:
            style = genre_writing_style(g)
            if style:
                writing_styles.append(style)
            else:
                unknown_genres.append(g)

    if not writing_styles:
        raise HTTPException(
            status_code=400,
        detail=f"Unknown genres: {', '.join(unknown_genres)}"
    )




    writing_style = " ".join(writing_styles)

# Choose strongest example if available
    style_example = max(examples, key=len) if examples else (
    "On a quiet morning, something small began to change. "
    "The moment felt ordinary, yet it carried meaning that would last."
    )

    """
    Returns list of tuples: [(page_text, prompt), ...] length == num_pages
    """
    # --- Build character map
    character_map = {}
    for line in character_details.splitlines():
        if ":" in line:
            name, desc = line.split(":", 1)
            character_map[name.strip()] = desc.strip()

    character_names = ", ".join(character_map.keys())
    


    # --- Story system prompt
    story_system_prompt = render_prompt(
    STORY_SYSTEM,
    writing_style=writing_style,
    num_pages=num_pages,
    genre=genre,
    style_example=style_example,
    orientation=orientation.capitalize(),
    max_lines=max_lines
    )


    # --- Single LLM call to generate story pages
    user_content = f"Write a {genre} story in exactly {num_pages} pages.\n\nStory Gist:\n{story_gist}\n\nCharacters:\n{character_names}\n\nCharacter details:\n{character_details}\n"

    try:
        resp = client.chat.completions.create(
            model=STORY_MODEL,
            messages=[
                {"role": "system", "content": story_system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.8,
            timeout=60,
        )
        story_output = resp.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"Story generation failed: {str(e)}")

    # --- Extract pages
    story_pages = {}
    for i in range(1, num_pages + 1):
        tag = f"Page {i}"

        raw_page = extract_page_from_story(story_output, tag) or ""

        story_pages[tag] = enforce_page_line_limit(
            raw_page,
         max_lines
        )

        # --- Generate HTML for ALL pages (SINGLE LLM CALL)
    html_pages = generate_html_for_pages(story_pages, genre)


    # --- Build image prompt system
    image_prompt_system = get_prompt(IMAGE_PROMPT_SYSTEM)


    # --- Single LLM call to generate all prompts
    try:
        prompt_resp = client.chat.completions.create(
            model=PROMPT_MODEL,
            messages=[
                {"role": "system", "content": image_prompt_system},
                {"role": "user", "content": json.dumps(story_pages)}
            ],
            temperature=0.7,
            timeout=60,
        )

        raw_output = prompt_resp.choices[0].message.content.strip()

        prompt_dict = extract_json_from_text(raw_output)
        if not prompt_dict:
            raise ValueError("No JSON found in prompt LLM output")

    except Exception as e:
        # If prompt generation fails, build fallback prompts using scenic fallbacks
        prompt_dict = {}
        SCENIC_FALLBACKS = {
        "family": (
            "ultra HD, 8k, cinematic wide-angle shot of a cozy Indian home interior, "
            "warm sunlight through windows, soft shadows, peaceful homely atmosphere."
        ),
    
        "romance": (
            "ultra HD, 8k, warm sunset over a riverbank, golden glow, drifting petals, "
            "soft blurred background, serene romantic ambience."
        ),
    
        "adventure": (
            "ultra HD, 8k, vast mountain valley, rolling mist, dramatic cliffs, "
            "deep depth-of-field, rugged adventurous landscape."
        ),
    
        "fantasy": (
            "ultra HD, 8k, floating magical lights, ethereal mist, "
            "dreamlike mystical ambience."
        ),
            
        "birthday": (
            "ultra HD, 8k, colorful party decorations under bright warm lighting, "
            "balloons, confetti floating, decorated table, joyful festive ambience."
        ),
    
        "corporate promotion": (
            "ultra HD, 8k, sleek modern office interior, elegant soft lighting, "
            "premium muted tones, glass walls and reflections, clean professional ambience."
        ),
    
        "housewarming": (
            "ultra HD, 8k, warm inviting home interior, soft ambient lighting, "
            "wooden textures, indoor plants, cozy welcoming space."
        ),
    
        "marriage": (
            "ultra HD, 8k, beautifully decorated wedding venue, warm golden lights, "
            "floral arrangements, soft romantic glow, elegant ceremonial atmosphere."
        ),
    
        "wedding": (
            "ultra HD, 8k, outdoor wedding mandap or decorated hall, pastel tones, "
            "soft bokeh, dreamy romantic ambience."
        ),
    
        "baby shower": (
            "ultra HD, 8k, pastel-themed celebration décor, soft warm lighting, "
            "cute baby decorations, balloons, gentle and joyful vibe."
        ),
    }

        default_scenic = "ultra HD, 8k, cinematic scenic frame, soft natural lighting."


        for i in range(1, num_pages + 1):
            key = f"Page {i}"
            scenic = SCENIC_FALLBACKS.get(genre.lower(), default_scenic)
            # include character names for clarity
            prompt_dict[key] = f"{scenic} {character_names}. cinematic, Hyperrealism, natural lighting."

    # --- Post-process: ensure every page has a prompt and inject character anchors
    pages_out = []
    for i in range(1, num_pages + 1):
        key = f"Page {i}"

        page_text = story_pages.get(key, "")
        prompt_text = prompt_dict.get(key, "")
        page_html = html_pages.get(key, "")

        prompt_text = inject_character_descriptions(prompt_text, character_map)

        pages_out.append((page_text, prompt_text, page_html))
        logger.info(
    f"[ARTIFACT] req={request_id_ctx.get()} "
    f"type=story pages={num_pages} ttl=24h"
    )

    return pages_out

# images_api_hidream.py
# ----------------------------
# FastAPI app + models
# ----------------------------


class HiDreamPageIn(BaseModel):
    page: int
    text: str   # Flux prompt placeholder (not used for hidream now)
    prompt: str # HiDreamXL prompt (detailed)

class ImageRequest(BaseModel):
    pages: List[HiDreamPageIn]
    orientation: Optional[str] = Field("Landscape", description="Landscape | Portrait | Square")

class HiDreamPageOut(BaseModel):
    page: int
    hidream_image_base64: Optional[str] = None
    error: Optional[str] = None

class ImageResponse(BaseModel):
    pages: List[HiDreamPageOut]
    
class RegenPageInput(BaseModel):
    page: int
    text: str
    prompt: str
    character_details: str

class RegenRequest(BaseModel):
    pages: List[RegenPageInput]
    orientation: Optional[str] = "Landscape"
    genre: str

class RegenPageOut(BaseModel):
    page: int
    new_story: str
    new_prompt: str
    image_base64: Optional[str] = None
    error: Optional[str] = None



# ----------------------------
# Utilities (NSFW check, seed, dims)
# ----------------------------
def is_nsfw_prompt(prompt: str) -> bool:
    banned = {
        "nude", "naked", "nsfw", "boobs", "cleavage", "erotic",
        "underboob", "sideboob", "lingerie", "porn", "18+",
        "sensual", "lewd", "sex", "dick", "ass", "provocative",
        "topless", "bottomless", "sexy"
    }
    words = re.findall(r'\b\w+\b', (prompt or "").lower())
    return any(w in banned for w in words)

def get_deterministic_seed(prompt: str, page_num: int):
    """
    Generate a deterministic seed based on detected character names in the prompt and page number.
    Ensures the same characters share identical visual identity across pages.
    """
    # Prefer explicit character anchors (e.g. <PAVAN_ID>)
    chars = re.findall(r"<([A-Z_]+)>", prompt)
    if not chars:
        # fallback: pick only known story names, not every capital word
        chars = [w for w in re.findall(r"\b[A-Z][a-zA-Z]+\b", prompt)
                 if w.lower() in {"pavan", "lohith", "shashi", "yash"}]

    # sort + add page
    base = "_".join(sorted(chars)) + f"_page{page_num}_{int(time.time())}"
    seed_val = int(hashlib.sha256(base.encode()).hexdigest(), 16) % (2**32)
    return seed_val

def get_dimensions(orientation: str):
    if not orientation:
        orientation = "Landscape"
    o = orientation.strip().lower()
    if o == "portrait":
        return 768, 1024
    if o == "square":
        return 1024, 1024
    return 1024, 768

# ----------------------------
# Core: call runpod serverless workflow (based on your payload)
# Returns: PIL.Image or None
# ----------------------------
def generate_image_from_prompt(prompt: str, negative_prompt: str, page_num: int = 1, orientation: str = "Landscape"):
    logger.info(f"Generating image for page={page_num}, orientation={orientation}")
    logger.debug(f"Prompt: {prompt[:200]}...")

    try:
        # NSFW check
        if is_nsfw_prompt(prompt):
            return None  # caller will log / handle

        width, height = get_dimensions(orientation)
        seed_val = get_deterministic_seed(prompt, page_num)

        # Build payload (your ComfyUI workflow)
        workflow_payload = {
            "input": {
                "workflow": {
                    "54": {"inputs": {"clip_name1": "clip_l_hidream.safetensors",
                                      "clip_name2": "clip_g_hidream.safetensors",
                                      "clip_name3": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                                      "clip_name4": "llama_3.1_8b_instruct_fp8_scaled.safetensors"},
                           "class_type": "QuadrupleCLIPLoader"},
                    "55": {"inputs": {"vae_name": "ae.safetensors"},
                           "class_type": "VAELoader"},
                    "69": {"inputs": {"unet_name": "hidream_i1_full_fp16.safetensors", "weight_dtype": "default"},
                           "class_type": "UNETLoader"},
                    "70": {"inputs": {"shift": 3.0, "model": ["69", 0]},
                           "class_type": "ModelSamplingSD3"},
                    "16_0": {"inputs": {"text": prompt, "clip": ["54", 0]},
                             "class_type": "CLIPTextEncode"},
                    "40_0": {"inputs": {"text": negative_prompt or "blurry", "clip": ["54", 0]},
                             "class_type": "CLIPTextEncode"},
                    "53_0": {"inputs": {"width": width, "height": height, "batch_size": 1},
                             "class_type": "EmptySD3LatentImage"},
                    "3_0": {"inputs": {
                        "seed": seed_val,
                        "steps": 30,
                        "cfg": 5,
                        "sampler_name": "euler",
                        "scheduler": "simple",
                        "denoise": 1,
                        "model": ["70", 0],
                        "positive": ["16_0", 0],
                        "negative": ["40_0", 0],
                        "latent_image": ["53_0", 0]},
                        "class_type": "KSampler"},
                    "8_0": {"inputs": {"samples": ["3_0", 0], "vae": ["55", 0]},
                            "class_type": "VAEDecode"},
                    "9_0": {"inputs": {"filename_prefix": f"runpod_output_{uuid.uuid4().hex[:6]}", "images": ["8_0", 0]},
                            "class_type": "SaveImage"}
                }
            }
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {RUNPOD_AUTH_BEARER}"
        }

        resp = requests.post(RUNPOD_HIDREAM_URL, headers=headers, json=workflow_payload, timeout=30)
        if resp.status_code not in (200, 201):
            raise RuntimeError(f"RunPod returned status {resp.status_code}: {resp.text}")

        job = resp.json()
        job_id = job.get("id")
        if not job_id:
            raise RuntimeError("No job id returned from RunPod.")

        start_time = time.time()
        deadline = time.time() + DEFAULT_TIMEOUT
        while True:
            if time.time() > deadline:
                raise RuntimeError("TTL exceeded: RunPod image generation timed out.")
            status_resp = requests.get(RUNPOD_HIDREAM_STATUS.format(job_id), headers=headers, timeout=30)
            if status_resp.status_code != 200:
                raise RuntimeError(f"Status check failed: {status_resp.status_code} {status_resp.text}")
            status = status_resp.json()
            st = status.get("status", "").upper()
            if st == "COMPLETED":
                images = status.get("output", {}).get("images", [])
                if not images:
                    raise RuntimeError("No images in RunPod response.")
                img_data_b64 = images[0].get("data")
                if not img_data_b64:
                    raise RuntimeError("No image data returned.")
                img = Image.open(BytesIO(base64.b64decode(img_data_b64)))
                logger.info(f"[IMG_JOB_DONE] req={request_id_ctx.get()} job_id={job_id}")
                return img
            if st == "FAILED":
                raise RuntimeError("RunPod job failed.")
            if time.time() - start_time > DEFAULT_TIMEOUT:
                raise RuntimeError("Timeout waiting for RunPod job.")
            time.sleep(POLL_INTERVAL)

    except Exception as e:
        logger.error(f"RunPod image generation failed: {str(e)}")
        # Bubble up string message to caller
        raise RuntimeError(str(e))
    
def generate_image_from_safetensor(
    *,
    user_id: str,
    trigger_word: str,
    prompt: str,
    page_num: int,
    orientation: str,
    lora_strength: float
) -> str:

    lora_name = resolve_user_lora(user_id)

    width, height = get_dimensions(orientation)
    seed = get_deterministic_seed(prompt, page_num)

    final_prompt = f"{trigger_word}, {prompt}"

    payload = build_lora_hidream_workflow(
        prompt=final_prompt,
        negative_prompt=NEGATIVE_PROMPT_TEXT,
        width=width,
        height=height,
        seed=seed,
        lora_name=lora_name,
        lora_strength=lora_strength
    )

    headers = {
        "Authorization": f"Bearer {RUNPOD_AUTH_BEARER}",
        "Content-Type": "application/json"
    }

    r = requests.post(RUNPOD_HIDREAM_URL, headers=headers, json=payload, timeout=30)
    r.raise_for_status()

    job_id = r.json().get("id")
    if not job_id:
        raise RuntimeError("RunPod returned no job id")

    deadline = time.time() + DEFAULT_TIMEOUT
    while time.time() < deadline:
        s = requests.get(RUNPOD_HIDREAM_STATUS.format(job_id), headers=headers, timeout=30)
        s.raise_for_status()
        data = s.json()

        if data.get("status") == "COMPLETED":
            return data["output"]["images"][0]["data"]

        if data.get("status") == "FAILED":
            raise RuntimeError("RunPod job failed")

        time.sleep(POLL_INTERVAL)

    raise RuntimeError("LoRA generation timed out")

# images_api_flux.py
"""
Flux Background Generator API
- Single LLM call for all pages (LLM returns final flux prompts for each page)
- Per-page flux generation (RunPod)
- Left-side fade effect applied to each background (ready for text overlay)
- Outputs base64 PNG per page with same structure as HiDream API
"""
# ----------------------------
# Configuration (env-overrides)
# ----------------------------

# Tunables
LLM_MODEL = os.getenv("FLUX_LLM_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
LLM_TEMPERATURE = float(os.getenv("FLUX_LLM_TEMP", "0.3"))
POLL_INTERVAL = float(os.getenv("FLUX_POLL_INTERVAL_S", "3.0"))
JOB_TIMEOUT = int(os.getenv("FLUX_JOB_TIMEOUT_S", "600"))  # 10 minutes
# ----------------------------
# FastAPI app + models
# ----------------------------

class FluxPageIn(BaseModel):
    page: int
    text: str

class FluxRequest(BaseModel):
    pages: List[FluxPageIn]
    orientation: Optional[str] = Field("Landscape", description="Landscape | Portrait | Square")

class FluxPageOut(BaseModel):
    page: int
    flux_prompt: Optional[str] = None
    flux_background_base64: Optional[str] = None
    error: Optional[str] = None

class FluxResponse(BaseModel):
    pages: List[FluxPageOut]
    message: str
# ----------------------------
# LLM: single-call multi-page to generate final FLUX prompts
# ----------------------------
def build_multi_page_llm_payload(pages: List[FluxPageIn]) -> Dict:
    pages_dict = {f"Page {p.page}": p.text for p in pages}

    system_prompt = render_prompt(
    FLUX_BACKGROUND_USER,
    pages_json=json.dumps(pages_dict, ensure_ascii=False)
    )


    user_prompt = json.dumps(pages_dict, ensure_ascii=False)

    return {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": LLM_TEMPERATURE
    }


def call_llm_get_prompts(pages: List[FluxPageIn]) -> Optional[Dict[str, Dict[str, str]]]:
    """
    Call OpenRouter (LLM) once, parse JSON and return mapping Page -> {"flux_prompt": "..."}
    """
    payload = build_multi_page_llm_payload(pages)
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}"
    }
    try:
        r = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=60)
        r.raise_for_status()
        data = r.json()
        content = data["choices"][0]["message"]["content"].strip()

        # remove code fences if any
        if content.startswith("```"):
            content = "\n".join(content.splitlines()[1:-1])

        # Attempt parse
        parsed = None
        try:
            parsed = json.loads(content)
        except Exception:
            # try to find first {...} block
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end != -1:
                try:
                    parsed = json.loads(content[start:end])
                except Exception:
                    parsed = None

        return parsed
    except Exception as e:
        print("[ERROR] LLM call failed:", e)
        return None

# ----------------------------
# FLUX call wrapper (RunPod)
# ----------------------------
def run_runpod_flux(prompt: str, width: int, height: int, seed: int = -1) -> str:
    payload = {
        "input": {
            "prompt": prompt ,
            "width": width,
            "height": height,
            "num_inference_steps": 4,
            "guidance": 3.5,
            "seed": seed,
            "image_format": "png"
        }
    }

    headers = {
        "Authorization": f"Bearer {RUNPOD_AUTH_BEARER}",
        "Content-Type": "application/json"
    }

    last_error = None

    for attempt in range(3):
        try:
            resp = requests.post(
                RUNPOD_FLUX_URL,
                json=payload,
                headers=headers,
                timeout=180
            )
            resp.raise_for_status()

            data = resp.json()
            if data.get("status") != "COMPLETED":
                raise RuntimeError(data.get("error", "FLUX generation failed"))

            return data["output"]["image_url"]

        except Exception as e:
            last_error = e
            time.sleep(2 * (attempt + 1))  # backoff

    raise RuntimeError(f"FLUX request failed after retries: {last_error}")
# ============================
# 🎨 Base Title Generator
# ============================

def _generate_titles_internal(full_story: str, genre: str, avoid_list: List[str] = None):
    """
    Generates 5 simple cinematic titles.
    If avoid_list is provided (regenerate mode), titles must be different.
    """

    avoid_list_text = ""
    if avoid_list:
        avoid_list_text = (
            "\n\nAVOID all these previous titles (do NOT repeat or use similar wording):\n"
            + "\n".join(f"- {t}" for t in avoid_list)
        )

    prompt = render_prompt(
    TITLE_GENERATOR,
    genre=genre,
    full_story=full_story,
    avoid_list_text=avoid_list_text
    )


    resp = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct:free",
        messages=[{"role": "user", "content": prompt}],
        temperature=1.05,
        top_p=0.85,
        frequency_penalty=1.4,
        presence_penalty=1.0,
        timeout=60,
    )

    raw = resp.choices[0].message.content.strip()

    titles = [t.strip() for t in raw.split("\n") if t.strip()]
    titles = [t.lstrip("1234567890.- ").strip() for t in titles]

    return titles[:5]

# ============================
# 🏷️ Tagline Generator
# ============================

def _generate_tagline_internal(story: str, genre: str) -> str:
    """
    Generates ONE short cinematic tagline.
    Uses the SAME input as title generation.
    """

    prompt = render_prompt(
    TAGLINE_GENERATOR,
    genre=genre,
    story=story
    )


    resp = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct:free",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.9,
        timeout=60,
    )

    return resp.choices[0].message.content.strip()

# ============================
# 🧾 API Models
# ============================

class GenerateTitleRequest(BaseModel):
    story: str
    genre: str = "Family"


class RegenerateTitleRequest(BaseModel):
    story: str
    genre: str = "Family"
    previous_titles: List[str]


class TitleListResponse(BaseModel):
    titles: List[str]
    tagline: Optional[str] = None
    regenerated: bool = False
# ============================
# coverback_api_simple.py
"""
Standalone Cover + BackCover Generator (No characters on cover)
- Single endpoint: POST /coverback/generate
- Input: pages[], genre, orientation, story_title (optional), qr_url (optional)
- Output: base64 cover image + base64 back image + prompts + blurb
"""
# ----------------------------
# Configuration (env or defaults)
# ----------------------------
# Tunables
POLL_INTERVAL = float(os.getenv("COVER_POLL_INTERVAL_S", "3.0"))
JOB_TIMEOUT = int(os.getenv("COVER_JOB_TIMEOUT_S", "600"))

DEFAULT_QR_URL = os.getenv("DEFAULT_QR_URL", "https://talescraftco.com/")

NEGATIVE_PROMPT_TEXT = (
    "text, watermark, signature, low quality, deformed, mutated, extra limbs, "
    "bad anatomy, bad proportions, poorly drawn, jpeg artifacts, pixelated, nsfw, nude"
)

# ----------------------------
# FastAPI + Models
# ----------------------------

class CoverPageIn(BaseModel):
    page: int
    text: str
    prompt: Optional[str] = None

class CoverBackRequest(BaseModel):
    pages: List[CoverPageIn]
    genre: Optional[str] = Field("Family")
    orientation: Optional[str] = Field("Portrait")
    story_title: Optional[str] = None
    qr_url: Optional[str] = Field(DEFAULT_QR_URL)

class CoverBackResponsePage(BaseModel):
    cover_prompt: Optional[str] = None
    cover_image_base64: Optional[str] = None
    back_blurb: Optional[str] = None
    back_prompt: Optional[str] = None
    back_image_base64: Optional[str] = None
    error: Optional[str] = None

class CoverBackResponse(BaseModel):
    pages: List[CoverBackResponsePage]
    title_used: Optional[str] = None
    message: str

# ----------------------------
# Helper: OpenRouter LLM
# ----------------------------

def call_openrouter_system_user(system_prompt: str, user_prompt: str, model="meta-llama/llama-3.3-70b-instruct:free", temperature=0.5, timeout=60) -> str:
    if not OPENROUTER_API_KEY:
        # Fail fast with a descriptive error
        raise RuntimeError("OPENROUTER_API_KEY not set in environment")

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {OPENROUTER_API_KEY}"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": temperature
    }
    resp = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=timeout)
    resp.raise_for_status()
    data = resp.json()

    # resilient extraction of content
    try:
        return data["choices"][0]["message"]["content"].strip()
    except Exception:
        # best-effort fallback
        if isinstance(data, dict):
            # try some other likely fields
            for k in ("text", "content", "reply"):
                v = data.get(k)
                if isinstance(v, str):
                    return v.strip()
        raise RuntimeError("Unexpected OpenRouter response format: " + json.dumps(data)[:400])

# ----------------------------
# Helper: RunPod HiDream — FIXED VERSION
# ----------------------------

def runpod_hidream_generate(prompt: str, orientation: str = "Portrait") -> str:
    o = (orientation or "Portrait").strip().lower()
    if o == "portrait":
        width, height = 768, 1024
    elif o == "square":
        width, height = 1024, 1024
    else:
        width, height = 1024, 768

    workflow_payload = {
        "input": {
            "workflow": {
                "54": {"inputs": {"clip_name1": "clip_l_hidream.safetensors",
                                  "clip_name2": "clip_g_hidream.safetensors",
                                  "clip_name3": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                                  "clip_name4": "llama_3.1_8b_instruct_fp8_scaled.safetensors"},
                       "class_type": "QuadrupleCLIPLoader"},
                "55": {"inputs": {"vae_name": "ae.safetensors"},
                       "class_type": "VAELoader"},
                "69": {"inputs": {"unet_name": "hidream_i1_full_fp16.safetensors", "weight_dtype": "default"},
                       "class_type": "UNETLoader"},
                "70": {"inputs": {"shift": 3.0, "model": ["69", 0]},
                       "class_type": "ModelSamplingSD3"},
                "16_0": {"inputs": {"text": prompt, "clip": ["54", 0]},
                         "class_type": "CLIPTextEncode"},
                "40_0": {"inputs": {"text": NEGATIVE_PROMPT_TEXT, "clip": ["54", 0]},
                         "class_type": "CLIPTextEncode"},
                "53_0": {"inputs": {"width": width, "height": height, "batch_size": 1},
                         "class_type": "EmptySD3LatentImage"},
                "3_0": {"inputs": {
                    "seed": random.randint(1, 2**31-1),
                    "steps": 30,
                    "cfg": 5,
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "denoise": 1,
                    "model": ["70", 0],
                    "positive": ["16_0", 0],
                    "negative": ["40_0", 0],
                    "latent_image": ["53_0", 0]},
                    "class_type": "KSampler"},
                "8_0": {"inputs": {"samples": ["3_0", 0], "vae": ["55", 0]},
                        "class_type": "VAEDecode"},
                "9_0": {"inputs": {"filename_prefix": f"runpod_cover_{uuid.uuid4().hex[:6]}", "images": ["8_0", 0]},
                        "class_type": "SaveImage"}
            }
        }
    }

    if not RUNPOD_AUTH_BEARER:
        raise RuntimeError("RUNPOD_AUTH_BEARER not set in environment")

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {RUNPOD_AUTH_BEARER}"}
    resp = requests.post(RUNPOD_HIDREAM_URL, headers=headers, json=workflow_payload, timeout=30)

    if resp.status_code not in (200, 201):
        raise RuntimeError(f"RunPod start failed: {resp.status_code} {resp.text}")

    job = resp.json()
    job_id = job.get("id")
    if not job_id:
        raise RuntimeError("No job id returned by RunPod")

    start_time = time.time()
    while True:
        status_resp = requests.get(RUNPOD_HIDREAM_STATUS.format(job_id), headers=headers, timeout=30)
        if status_resp.status_code != 200:
            raise RuntimeError(f"RunPod status failed: {status_resp.status_code} {status_resp.text}")

        st = status_resp.json()
        stcode = st.get("status", "").upper()

        if stcode == "COMPLETED":
            imgs = st.get("output", {}).get("images", [])
            if not imgs:
                raise RuntimeError("No images in RunPod output")

            img_obj = imgs[0]

            # CASE 1 — direct string
            if isinstance(img_obj, str):
                return img_obj

            # CASE 2 — dictionary
            if isinstance(img_obj, dict):
                # Common key
                if "image" in img_obj:
                    return img_obj["image"]

                # Alternate key
                if "data" in img_obj:
                    return img_obj["data"]

                # Search for any base64-like value
                for v in img_obj.values():
                    if isinstance(v, str) and v.startswith("data:image"):
                        return v

                raise RuntimeError("Unsupported image dict format from RunPod.")

            raise RuntimeError("Unsupported image format from RunPod.")

        if stcode == "FAILED":
            raise RuntimeError("RunPod job failed")

        if time.time() - start_time > JOB_TIMEOUT:
            raise RuntimeError("RunPod job timeout")

        time.sleep(POLL_INTERVAL)


# ----------------------------
# Extract visuals
# ----------------------------

def extract_visuals_from_story(full_story_text: str) -> str:
    sys_prompt = """Read the full story below and extract ONLY the strongest visual elements that should appear on a photorealistic cinematic book cover.
RULES:
- NO characters.
- Only: locations, objects, props, atmospheric elements, lighting cues.
- Return a short comma-separated list.
"""
    user_prompt = f"Story:\n{full_story_text}\nReturn only a comma-separated list."

    try:
        return call_openrouter_system_user(sys_prompt, user_prompt, temperature=0.3)
    except Exception:
        return "mountains, fields, warm sunset"

# ----------------------------
# Build cover prompt
# ----------------------------

def build_cover_prompt_from_visuals(extracted_visuals: str, genre: str) -> str:
    system = get_prompt(COVER_VISUAL_SYSTEM)

    user = f"Extracted: {extracted_visuals}\nGenre: {genre}"

    try:
        return call_openrouter_system_user(system, user, temperature=0.5)
    except Exception:
        return f"ultra HD, 8k, photorealistic, dramatic cinematic lighting, {extracted_visuals}, Hyperrealism, natural lighting."

# ----------------------------
# Back blurb + prompt
# ----------------------------

def generate_back_blurb_and_prompt(full_story_text: str, genre: str) -> Tuple[str, str]:
    # Generate blurb
    back_sys = render_prompt(
    BACK_BLURB_SYSTEM,
    genre=genre
    )


    user = f"Story gist:\n{full_story_text}\nGenre: {genre}"

    try:
        blurb_raw = call_openrouter_system_user(back_sys, user, temperature=0.5)
        blurb = blurb_raw.strip()
    except Exception:
        blurb = "A powerful emotional journey.\nTheme Highlight: \"Hope and resilience.\""

    # Generate back cover visual prompt
    back_visual_sys = render_prompt(
    BACK_VISUAL_SYSTEM,
    genre=genre
    )


    try:
        back_prompt_raw = call_openrouter_system_user(back_visual_sys, user, temperature=0.5)
    except Exception:
        back_prompt_raw = "ultra HD, 8k, photorealistic farmhouse at dusk, soft pastel sky, quiet fields, gentle mist, Hyperrealism, natural lighting."

    # Genre-specific suffixes to tweak mood
    suffix_map = {
        "fantasy": "soft magical glow in the environment, ethereal ambient lighting, cool blue highlights, misty depth in the background, subtle floating particles, enchanted cinematic mood",
        "family": "warm golden-hour lighting, soft natural highlights, gentle shadows, cozy inviting ambience, peaceful rural or homely setting",
        "adventure": "bold high-contrast cinematic lighting, deep warm highlights, dramatic wide scenery, windswept landscape or rugged outdoor setting, sense of motion and exploration",
        "sci-fi": "cool futuristic lighting, subtle technological reflections, sharp contrast, clean metallic or neon-toned ambience",
        "mystery": "low-key lighting, deep shadow contrast, subtle fog layers, cool desaturated tones, cinematic suspenseful mood",
        "birthday": "bright cheerful lighting, colorful festive highlights, soft bokeh glow, party ambience with balloons and confetti, warm celebratory mood",
        "corporate promotion": "clean modern lighting, subtle premium highlights, sleek professional ambience, muted elegant tones, award-ceremony feel, confident visual composition",
        "housewarming": "warm ambient interior lighting, soft shadows, cozy textures, inviting home-like setting, gentle natural highlights, welcoming mood",
        "marriage": "romantic soft-focus lighting, elegant warm glow, floral accents, gentle bokeh background, pastel romantic tones, cinematic ceremonial atmosphere",
        "wedding": "romantic soft-focus lighting, elegant warm glow, floral accents, gentle bokeh background, pastel romantic tones, cinematic ceremonial atmosphere",
        "baby shower": "soft pastel-color ambience, warm gentle lighting, cute baby-themed decorations, dreamy nursery tones, delicate highlights, cozy joyful mood",
    }

    genre_key = (genre or "").strip().lower()
    suffix = suffix_map.get(genre_key, "balanced cinematic lighting, clear photorealistic ambience")

    # Combine prompt
    final_back_prompt = back_prompt_raw.rstrip(". ") + ", " + suffix + ", Hyperrealism, natural lighting."

    return blurb, final_back_prompt
#=====================================================================================
# image editing endpoint
#=====================================================================================

RUNPOD_BANANA_ENDPOINT = "https://api.runpod.ai/v2/nano-banana-edit/runsync"

def convert_to_format(image_path, desired_format):
    img = Image.open(image_path).convert("RGB")
    base, _ = os.path.splitext(image_path)
    new_path = f"{base}.{desired_format}"
    img.save(new_path, desired_format.upper())
    return new_path

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def run_banana_edit(prompt, image_b64, output_format):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {RUNPOD_AUTH_BEARER}"
    }

    data = {
        "input": {
            "prompt": prompt,
            "images": [image_b64],  
            "output_format": output_format,
            "seed": -1,
            "enable_safety_checker": True
        }
    }

    response = requests.post(RUNPOD_BANANA_ENDPOINT, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"RunPod Error: {response.text}")
#========================================================================
#Face Swap 
#+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# =============================================
# 🧑‍🤝‍🧑 FaceSwap Config (RunPod)
# =============================================
RUNPOD_FACESWAP_URL = "https://api.runpod.ai/v2/njyoog9u3bm8oa/runsync"
def faceswap_to_base64(file: UploadFile):
    return base64.b64encode(file.file.read()).decode("utf-8")

def call_runpod_faceswap(
    source_bytes: bytes,
    target_bytes: bytes,
    source_index: int = -1,
    target_index: int = -1,
    upscale: int = 1,
    codeformer_fidelity: float = 0.5,
    background_enhance: bool = True,
    face_restore: bool = True,
    face_upsample: bool = False,
    output_format: str = "JPEG"
) -> str:
    payload = {
        "input": {
            "source_image": base64.b64encode(source_bytes).decode(),
            "target_image": base64.b64encode(target_bytes).decode(),
            "source_indexes": str(source_index),
            "target_indexes": str(target_index),
            "background_enhance": background_enhance,
            "face_restore": face_restore,
            "face_upsample": face_upsample,
            "upscale": upscale,
            "codeformer_fidelity": codeformer_fidelity,
            "output_format": output_format
        }
    }

    headers = {
        "Authorization": f"Bearer {RUNPOD_AUTH_BEARER}",
        "Content-Type": "application/json"
    }

    r = requests.post(RUNPOD_FACESWAP_URL, json=payload, headers=headers, timeout=120)
    r.raise_for_status()

    result = r.json()
    if "output" not in result or "image" not in result["output"]:
        raise RuntimeError(f"Invalid FaceSwap response: {result}")

    return result["output"]["image"]
    
# ============================================================
# ⚡ FastAPI Endpoints
# ============================================================

@app.post("/start", response_model=StartResponse)
def start_questionnaire():
    logger.info("Start questionnaire called")
    """Initialize a new questionnaire."""
    first = QA(question="Why write this book?", answer="")
    chat = [("System", "Let's begin your story journey!")]

    return {"chat": chat, "conversation": [first]}


QUESTION_LIMIT = int(os.getenv("QUESTION_LIMIT", 15))


@app.post("/next", response_model=NextResponse)
def next_question(data: AnswerInput):
    logger.info(f"Next question request received. Answer: {data.answer}")
    """Record answer and generate next question with enhanced finishing logic."""
    conversation: List[QA] = data.conversation

    # ------------------------------
    # Case 1: First question answer
    # ------------------------------
    if len(conversation) == 1 and conversation[0].answer == "":
        conversation[0].answer = data.answer
        conversation.append(QA(question=SECOND_QUESTION, answer=""))
        
        return {
            "chat": [(q.question, q.answer) for q in conversation],
            "conversation": conversation,
            "ready_for_gist": False,
            "stop_reason": None,
            "message": "Second question added."
        }

    # ------------------------------
    # Case 2: Second question answer
    # ------------------------------
    if len(conversation) == 2 and conversation[-1].answer == "":
        conversation[-1].answer = data.answer
        next_q = generate_next_question(conversation)
        conversation.append(QA(question=next_q, answer=""))

        return {
            "chat": [(q.question, q.answer) for q in conversation],
            "conversation": conversation,
            "ready_for_gist": False,
            "stop_reason": None,
            "message": "Next AI question added."
        }

    # ------------------------------
    # Case 3: Normal flow
    # ------------------------------
    # Update last answer
    conversation[-1].answer = data.answer

    # ---- STOP after limit is reached ----
    if len(conversation) >= QUESTION_LIMIT:
        return {
            "chat": [(q.question, q.answer) for q in conversation],
            "conversation": conversation,
            "ready_for_gist": True,
            "stop_reason": "question_limit_reached",
            "message": "You have completed the questionnaire. Please proceed to generate the gist."
        }

    # Otherwise generate next question
    next_q = generate_next_question(conversation)
    conversation.append(QA(question=next_q, answer=""))

    return {
        "chat": [(q.question, q.answer) for q in conversation],
        "conversation": conversation,
        "ready_for_gist": False,
        "stop_reason": None,
        "message": "Next AI question added."
    }

# ============================

@app.post("/upload-books")

async def upload_books(
    user_id: str = Query(...),
    files: list[UploadFile] = File(...)
):
    if user_id not in SESSION_UPLOADS:
        SESSION_UPLOADS[user_id] = {
        "files": [],
        "created_at": time.time()
    }


    for file in files:
        ext = Path(file.filename).suffix.lower()
        if ext not in {".pdf", ".docx", ".txt"}:
            continue

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
        tmp.write(await file.read())
        tmp.close()

        SESSION_UPLOADS[user_id]["files"].append(tmp.name)


    if not SESSION_UPLOADS[user_id]["files"]:
        raise HTTPException(400, "No valid files uploaded")

    return {
        "status": "uploaded",
        "files_uploaded": len(SESSION_UPLOADS[user_id]["files"]),
        "next_step": "Call /process-books"
    }

# =========================================================
# PROCESS ENDPOINT (STEP 2)
# =========================================================
@app.post("/process-books")
def process_books(user_id: str):
    if user_id not in SESSION_UPLOADS:
        raise HTTPException(400, "No uploaded files found for this user")

    books_text = {}
    books_meta = []

    for path in SESSION_UPLOADS[user_id]["files"]:

        ext = Path(path).suffix.lower()
        book_id = f"book_{uuid.uuid4().hex[:8]}"

        if ext == ".pdf":
            text = extract_text_from_pdf(Path(path))
        elif ext == ".docx":
            text = extract_text_from_docx(Path(path))
        else:
            text = extract_text_from_txt(Path(path))
            
        content_hash = hashlib.sha256((Path(path).name + text[:5000]).encode("utf-8")).hexdigest()


        books_text[book_id] = text[:12000]

    # ---- LLM METADATA EXTRACTION (same logic as before) ----
    prompt = build_prompt(books_text)

    completion = client.chat.completions.create(
        model="xiaomi/mimo-v2-flash:free",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a strict data extraction engine.\n"
                    "Your task is to extract structured metadata from book text.\n\n"
                    "CRITICAL RULES:\n"
                    "- The example MUST be narrative story content (not instructions, not introductions).\n"
                    "- If the story text is the form of ->ex:'W e l c o m e t o t h e w i l d e s t g a r a g e i n t o w n' then first clean and process it,then use it to generate JSON"
                    "- NEVER use the beginning pages of the book.\n"
                    "- NEVER include welcome text, introductions, dedications, instructions, coloring prompts, or reader guidance.\n"
                    "- Explicitly EXCLUDE text containing phrases like:\n"
                    "  'welcome', 'this book was made for you', 'use crayons', 'color inside the lines',\n"
                    "  'get comfy', 'just remember', 'this book is', 'with love'.\n"
                    "- If such text appears at the start, SKIP IT and select text from later story pages.\n\n"
                    "- The example must be approximately 1000–1500 words of STORY prose.\n"
                    "- The example must demonstrate character action, scenes, or events.\n"
                    "- Output MUST be valid JSON only.\n"
                    "- No markdown, no explanations, no comments."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    match = re.search(r"\{.*\}", completion.choices[0].message.content, re.DOTALL)
    if not match:
        raise HTTPException(500, "Invalid JSON from LLM")

    parsed = json.loads(match.group())

    for book_id, data in parsed.items():
        books_meta.append({
            "book_id": book_id,
            "title": data.get("title", ""),
            "genre": normalize_genre(data.get("genre", "")),
            "writing_style": data.get("writing_style", ""),
            "example": data.get("example", ""),
            "hash": content_hash
        })

    existing = styles_collection.find_one(
        {"user_id": user_id},
        {"books.hash": 1}
        ) or {}

    existing_hashes = {
        b["hash"] for b in existing.get("books", [])
        if "hash" in b
    }

    books_meta = [
        b for b in books_meta
        if b.get("hash") not in existing_hashes
    ]

    # ---- SAVE TO MONGODB ----
    if books_meta:  # only push if something new exists
        styles_collection.update_one(
    {"user_id": user_id},
    {
        "$set": {
            "generated_at": datetime.utcnow()
        },
        "$push": {
            "books": {
                "$each": books_meta
            }
        }
    },
    upsert=True
)

    # ----------------------------
    # ---- CLEAN TEMP FILES ----
    for p in SESSION_UPLOADS[user_id]["files"]:
        os.unlink(p)
    del SESSION_UPLOADS[user_id]

    return {
        "status": "success",
        "books_processed": len(books_meta)
    }


@app.get("/genres")
def get_genres(user_id: str):
    genre_map = load_genre_style_map(user_id)
    return {"genres": sorted(genre_map.keys())}

# ============================
@app.post("/gist", response_model=GistResponse)
def gist(data: GistInput):
    logger.info(
        "Generating gist | user=%s | genre=%s",
        data.user_id,
        data.genre
    )

    gist_text = generate_gist(
        conversation=data.conversation,
        genre=data.genre,
        user_id=data.user_id
    )

    genres = parse_genres(data.genre)

    return {
        "user_id": data.user_id,
        "genres": genres,
        "gist": gist_text
    }


# ============================

@app.post("/gist/preview-images")
def gist_preview_images(payload: GistResponse):
    try:
        images = generate_preview_images_from_gist(payload.gist)
        return {
            "user_id": payload.user_id,
            "genres": payload.genres,
            "images": images
        }
    except Exception as e:
        logger.exception("Gist image generation failed")
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# FastAPI endpoint
# -----------------------------
@app.post("/story/generate", response_model=StoryResponse)
def story_generate(req: StoryRequest):
    """Generate story pages + cinematic prompts in a single call."""
    try:
        if req.num_pages < 1 or req.num_pages > 50:
            raise HTTPException(status_code=400, detail="num_pages must be between 1 and 50")

        pages = generate_story_and_prompts(req.gist, req.num_characters, req.character_details, req.genre, req.num_pages,req.orientation,req.user_id)
        # ✅ SAVE WRITING STYLE (ONCE PER STORY)
        if req.user_id:
            full_story_text = "\n\n".join([p[0] for p in pages])

        save_writing_style(
            user_id=req.user_id,
            genre=req.genre,
            story_text=full_story_text
        )

        page_objects = [
            PageOutput(
                page=i + 1,
                text=pages[i][0],
                prompt=pages[i][1],
                html=pages[i][2]   # ✅ NEW
            )
            for i in range(len(pages))
        ]


        return StoryResponse(pages=page_objects, ready_for_images=True, message="Story and prompts generated successfully")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

class LoRAImageRequest(BaseModel):
    user_id: str
    trigger_word: str
    pages: List[HiDreamPageIn]
    orientation: Optional[str] = "Landscape"
    lora_strength: float = 1.0

@app.post("/upload-and-process")
async def upload_and_process(
    user_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    if not files:
        raise HTTPException(400, "No files uploaded")

    image_keys = []

    for file in files:
        data = await file.read()
        ext = file.filename.lower().rsplit(".", 1)[-1]

        # Save original
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=f"users/{user_id}/uploads/{file.filename}",
            Body=data
        )

        # Process image
        if ext in ("jpg", "jpeg", "png", "webp"):
            processed = process_image(data)
            out_name = file.filename.rsplit(".", 1)[0] + ".png"
            out_key = f"datasets/{user_id}/{out_name}"

            s3.put_object(
                Bucket=S3_BUCKET,
                Key=out_key,
                Body=processed,
                ContentType="image/png"
            )

            image_keys.append(out_key)

    # WRITE MANIFEST (CRITICAL FIX)
    manifest = {"images": image_keys}

    s3.put_object(
        Bucket=S3_BUCKET,
        Key=f"users/{user_id}/manifest.json",
        Body=json.dumps(manifest).encode("utf-8"),
        ContentType="application/json"
    )

    return {
        "status": "success",
        "processed_images": len(image_keys),
        "manifest": f"s3://{S3_BUCKET}/users/{user_id}/manifest.json"
    }

# =========================================================
# CAPTION ENDPOINT (NO LIST)
# =========================================================

@app.post("/generate-captions")
def generate_captions(user_id: str, trigger_word: str):

    manifest_key = f"users/{user_id}/manifest.json"

    try:
        obj = s3.get_object(Bucket=S3_BUCKET, Key=manifest_key)
        manifest = json.loads(obj["Body"].read())
    except Exception:
        raise HTTPException(400, "manifest.json not found — run preprocess first")

    image_keys = manifest.get("images", [])
    if not image_keys:
        raise HTTPException(400, "Manifest contains no images")

    images = [encode_image_from_s3(k) for k in image_keys]

    # Call RunPod caption model
    r = requests.post(
        RUNPOD_URL,
        headers={
            "Authorization": f"Bearer {RUNPOD_API_KEY}",
            "Content-Type": "application/json"
        },
        json={"input": {"images": images}},
        timeout=300
    )
    r.raise_for_status()

    captions = r.json()["output"]["captions"]

    for key, caption in zip(image_keys, captions):
        clean_caption = (
        caption
        .replace(".", "")
        .replace("\n", "")
        .strip()
    )
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=f"{key}.txt",
            Body=f"{trigger_word},{caption}".encode("utf-8"),
            ContentType="text/plain"
        )

    return {
        "status": "success",
        "captioned_images": len(image_keys)
    }

def get_runpod_job_status(job_id: str):
    url = f"https://api.runpod.ai/v2/{RUNPOD_TRAINING_ENDPOINT_ID}/status/{job_id}"

    r = requests.get(
        url,
        headers={
            "Authorization": f"Bearer {RUNPOD_API_KEY}"
        },
        timeout=30
    )

    if not r.ok:
        raise HTTPException(status_code=500, detail=r.text)

    return r.json()

@app.post("/train-character")
def train_character(
    user_id: str = Form(...),
    trigger_word: str = Form(...)
):
    payload = {
        "input": {
            "name": user_id,
            "trigger_word": trigger_word,
            "folder_path": f"/runpod-volume/datasets/{user_id}",
            "output_path": f"/runpod-volume/models/loras"
        }
    }

    r = requests.post(
        RUNPOD_TRAIN_URL,
        headers={
            "Authorization": f"Bearer {RUNPOD_API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=60
    )

    if not r.ok:
        raise HTTPException(status_code=500, detail=r.text)

    return {
        "status": "training_started",
        "runpod_job": r.json()
    }

@app.get("/job-status/{job_id}")
def job_status(job_id: str):
    """
    Check RunPod training job status.
    """
    status = get_runpod_job_status(job_id)

    return {
        "job_id": job_id,
        "status": status.get("status"),
        "details": status
    }

@app.post("/images/generate-lora", response_model=ImageResponse)
def images_generate_lora(req: LoRAImageRequest):

    results: List[HiDreamPageOut] = []

    for p in req.pages:
        try:
            use_lora = should_apply_lora(p.prompt, req.trigger_word)

            if use_lora:
                img_b64 = generate_image_from_safetensor(
                user_id=req.user_id,
                trigger_word=req.trigger_word,
                prompt=p.prompt,
                page_num=p.page,
                orientation=req.orientation,
                lora_strength=req.lora_strength
                )
            else:
            # 🔹 NO LORA — normal HiDream path
                img = generate_image_from_prompt(
                p.prompt,
                NEGATIVE_PROMPT_TEXT,
                page_num=p.page,
                orientation=req.orientation
            )

                if img is None:
                    raise RuntimeError("Image generation returned no result")

                buf = BytesIO()
                img.save(buf, format="PNG")
                img_b64 = base64.b64encode(buf.getvalue()).decode()

            results.append(
                HiDreamPageOut(
                page=p.page,
                hidream_image_base64=img_b64,
                error=None
            )
        )

        except Exception as e:
            results.append(
            HiDreamPageOut(
            page=p.page,
            hidream_image_base64=None,
            error=str(e)
            )
        )

    return ImageResponse(pages=results)

@app.post("/images/generate", response_model=ImageResponse)
def images_generate(req: ImageRequest):
    if not req.pages or len(req.pages) == 0:
        raise HTTPException(status_code=400, detail="No pages provided.")

    results: List[HiDreamPageOut] = []


    for p in req.pages:
        page_num = p.page
        prompt = p.prompt or ""
        # We use prompt for HiDream generation. text is reserved for flux later.
        try:
            # NSFW quick check
            if is_nsfw_prompt(prompt):
                results.append(HiDreamPageOut(page=page_num, hidream_image_base64=None, error="NSFW content detected. Skipped."))
                continue

            img = generate_image_from_prompt(prompt, NEGATIVE_PROMPT_TEXT, page_num=page_num, orientation=req.orientation)
            if img is None:
                results.append(HiDreamPageOut(page=page_num, hidream_image_base64=None, error="Generation returned no image."))
                continue
            logger.info(
                f"[ARTIFACT] req={request_id_ctx.get()} "
                f"type=image page={page_num} ttl=ephemeral"
            )

            # convert to base64 PNG
            buf = BytesIO()
            img.save(buf, format="PNG")
            encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
            results.append(HiDreamPageOut(page=page_num, hidream_image_base64=encoded, error=None))

        except Exception as e:
            results.append(HiDreamPageOut(page=page_num, hidream_image_base64=None, error=str(e)))


    return ImageResponse(pages=results, message="HiDream generation completed (Flux background pending).")

@app.post("/images/regenerate")
def images_regenerate(req: RegenRequest):
    results = []

    for page in req.pages:
        try:
            new_story, new_prompt, new_html, image_b64 = regenerate_page(
                story_text=page.text,
                old_prompt=page.prompt,
                character_details=page.character_details,
                page_num=page.page,
                orientation=req.orientation,
            genre=req.genre
            )


            results.append({
                "page": page.page,
                "new_story": new_story,
                "new_prompt": new_prompt,
                "new_html": new_html,
                "image_base64": image_b64
            })

        except Exception as e:
            results.append({
                "page": page.page,
                "error": str(e)
            })

    return {
        "pages": results,
        "message": "Regeneration completed."
    }
# ----------------------------
# Run with: uvicorn images_api_flux:app --reload
# ----------------------------
@app.post("/images/flux_generate", response_model=FluxResponse)
def flux_generate(req: FluxRequest):
    logger.info(f"/images/flux_generate called. Orientation={req.orientation}")

    if not req.pages:
        raise HTTPException(status_code=400, detail="No pages provided.")

    # Batch NSFW guard
    combined_text = " ".join([p.text for p in req.pages])
    if is_nsfw_prompt(combined_text):
        raise HTTPException(status_code=400, detail="NSFW content detected.")

    # 1️⃣ LLM call (UNCHANGED PROMPT, ONLY RENAMED TYPES)
    llm_out = call_llm_get_prompts(req.pages)
    if not isinstance(llm_out, dict):
        raise HTTPException(status_code=500, detail="LLM failed to return valid JSON.")

    width, height = get_dimensions(req.orientation)
    results: List[FluxPageOut] = []

    for p in req.pages:
        page_key = f"Page {p.page}"
        page_result = FluxPageOut(page=p.page)

        try:
            page_info = llm_out.get(page_key)
            if not page_info or "flux_prompt" not in page_info:
                page_result.error = "LLM did not return prompt for this page."
                results.append(page_result)
                continue

            # ✅ keep flux prompt key, just rename variable
            flux_prompt = page_info["flux_prompt"]
            page_result.flux_prompt = flux_prompt

            if is_nsfw_prompt(flux_prompt):
                page_result.error = "NSFW prompt generated by LLM."
                results.append(page_result)
                continue

            # 2️⃣ FLUX IMAGE GENERATION
            image_url = run_runpod_flux(flux_prompt, width, height)

            if image_url.startswith("http"):
                r = requests.get(image_url, timeout=30)
                r.raise_for_status()
                final_b64 = base64.b64encode(r.content).decode()
            elif image_url.startswith("data:image"):
                final_b64 = image_url.split(",", 1)[1]
            else:
                final_b64 = image_url

            page_result.flux_background_base64 = final_b64
            results.append(page_result)

        except Exception as e:
            page_result.error = str(e)
            results.append(page_result)

    return FluxResponse(
        pages=results,
        message="FLUX.1 Schnell background generation completed"
    )
# ============================
# 🚀 API ENDPOINTS
# ============================

@app.post("/title/generate", response_model=TitleListResponse)
def title_generate(req: GenerateTitleRequest):
    story = req.story.strip()
    genre = req.genre.strip()

    if not story:
        raise HTTPException(status_code=400, detail="Story text is empty.")

    titles = _generate_titles_internal(story, genre)
    tagline = _generate_tagline_internal(story, genre)

    return TitleListResponse(
        titles=titles,
        tagline=tagline,
        regenerated=False
    )
# ============================
@app.post("/title/regenerate", response_model=TitleListResponse)
def title_regenerate(req: RegenerateTitleRequest):
    story = req.story.strip()
    genre = req.genre.strip()

    if not story:
        raise HTTPException(status_code=400, detail="Story text is empty.")

    if not req.previous_titles:
        raise HTTPException(status_code=400, detail="previous_titles is required.")

    new_titles = _generate_titles_internal(
        story,
        genre,
        avoid_list=req.previous_titles
    )

    tagline = _generate_tagline_internal(story, genre)

    return TitleListResponse(
        titles=new_titles,
        tagline=tagline,
        regenerated=True
    )
# ============================
# ----------------------------
# Run: uvicorn images_api_flux:app --reload
# ----------------------------
@app.post("/coverback/generate", response_model=CoverBackResponse)
def coverback_generate(req: CoverBackRequest):
    logger.info(f"/coverback/generate called. Genre={req.genre}, Title={req.story_title}")

    if not req.pages:
        raise HTTPException(status_code=400, detail="No pages provided.")

    pages_sorted = sorted(req.pages, key=lambda p: p.page)
    full_story_text = "\n\n".join([p.text for p in pages_sorted])

    title_used = req.story_title.strip() if req.story_title else None
    if not title_used:
        try:
            title_used = auto_generate_title(full_story_text)
        except:
            title_used = "Untitled Story"

    # COVER
    try:
        extracted = extract_visuals_from_story(full_story_text)
        cover_prompt = build_cover_prompt_from_visuals(extracted, req.genre)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover prompt generation failed: {e}")

    cover_b64 = None
    cover_err = None
    try:
        raw_cover = runpod_hidream_generate(cover_prompt, orientation=req.orientation)

        if isinstance(raw_cover, str) and raw_cover.startswith("data:image"):
            cover_b64 = raw_cover.split(",", 1)[1]
        elif isinstance(raw_cover, str) and raw_cover.startswith("http"):
            r = requests.get(raw_cover, timeout=30)
            r.raise_for_status()
            cover_b64 = base64.b64encode(r.content).decode()
        else:
            cover_b64 = raw_cover

        if cover_b64:
            cover_b64 = cover_b64  # no title overlay


    except Exception as e:
        cover_err = str(e)
        cover_b64 = None

    # BACK COVER
    back_b64 = None
    back_prompt = None
    back_blurb = None
    back_err = None

    try:
        back_blurb, back_prompt = generate_back_blurb_and_prompt(full_story_text, req.genre)
        raw_back = runpod_hidream_generate(back_prompt, orientation=req.orientation)

        if isinstance(raw_back, str) and raw_back.startswith("data:image"):
            back_b64 = raw_back.split(",", 1)[1]
        elif isinstance(raw_back, str) and raw_back.startswith("http"):
            r = requests.get(raw_back, timeout=30)
            r.raise_for_status()
            back_b64 = base64.b64encode(r.content).decode()
        else:
            back_b64 = raw_back

        if back_b64:
            img_back = Image.open(BytesIO(base64.b64decode(back_b64))).convert("RGBA")
            W, H = img_back.size

            # blurb text
            try:
                base_font_size = max(20, int(H * 0.035))
                try:
                    font = ImageFont.truetype("SundayShine.otf", base_font_size)
                except:
                    font = ImageFont.load_default()
                wrapped = textwrap.fill(back_blurb, width=55 if W < H else 45)
                draw = ImageDraw.Draw(img_back)
                lines = wrapped.split("\n")
                line_spacing = int(base_font_size * 1.35)
                text_block_height = len(lines) * line_spacing
                text_y = (H - text_block_height) // 4
                text_x = W // 2

                for i, line in enumerate(lines):
                    y = text_y + i * line_spacing
                    w, h = draw.textsize(line, font=font)
                    for dx, dy in [(2,2),(-2,-2),(2,-2),(-2,2)]:
                        draw.text((text_x - w//2 + dx, y + dy), line, fill=(0,0,0,160), font=font)
                    draw.text((text_x - w//2, y), line, fill="white", font=font)

            except:
                pass

            # QR code
            try:
                qr = qrcode.QRCode(version=2, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=6, border=1)
                qr.add_data(req.qr_url or DEFAULT_QR_URL)
                qr.make()
                qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
                qr_size = int(min(W, H) * 0.16)
                qr_img = qr_img.resize((qr_size, qr_size), Image.LANCZOS)
                img_back.alpha_composite(qr_img, (W - qr_size - 36, H - qr_size - 36))
            except:
                pass

            buf = BytesIO()
            img_back.convert("RGB").save(buf, format="PNG")
            back_b64 = base64.b64encode(buf.getvalue()).decode()

    except Exception as e:
        back_err = str(e)
        back_b64 = None

    page_out = CoverBackResponsePage(
        cover_prompt=cover_prompt,
        cover_image_base64=cover_b64,
        back_blurb=back_blurb,
        back_prompt=back_prompt,
        back_image_base64=back_b64,
        error="; ".join(filter(None, [cover_err, back_err])) if (cover_err or back_err) else None
    )

    return CoverBackResponse(
        pages=[page_out],
        title_used=title_used,
        message="Cover & Back generated (base64 only)."
    )

# ===================================================
# 🍌 /edit-image — Nano Banana Edit Endpoint
# ===================================================
@app.post("/edit-image")
async def edit_image_api(
    file: UploadFile = File(...),
    prompt: str = Form(...)
):
    """Edit an image using Nano-Banana and return Base64 output."""

    # Save temporary file
    temp_path = file.filename
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    ext = temp_path.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png"]:
        os.remove(temp_path)
        return JSONResponse({"error": "Only JPG, JPEG, PNG allowed"}, status_code=400)

    output_format = "jpeg" if ext in ["jpg", "jpeg"] else "png"

    # Convert JPEG → JPG
    if ext == "jpeg":
        temp_path = convert_to_format(temp_path, "jpg")

    # Encode → Base64
    image_b64 = encode_image_to_base64(temp_path)

    # Delete original file
    if os.path.exists(temp_path):
        os.remove(temp_path)

    # Call Nano-Banana
    try:
        result = run_banana_edit(prompt, image_b64, output_format)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    output_url = result.get("output", {}).get("result")
    if not output_url:
        return JSONResponse({"error": "Model returned no result URL", "raw": result})

    # Download final image
    img_bytes = requests.get(output_url).content

    # Convert to Base64
    output_b64 = base64.b64encode(img_bytes).decode("utf-8")

    return {
        "message": "Image edited successfully!",
        "result_url": output_url,
        "output_base64": output_b64
    }
# ==========================================================
# 🧑‍🤝‍🧑 /faceswap — RunPod FaceSwap API
# ==========================================================
@app.post("/faceswap")
async def faceswap_api(
    source: UploadFile = File(...),
    target: UploadFile = File(...),

    source_index: int = Form(-1),
    target_index: int = Form(-1),

    upscale: int = Form(1),
    codeformer_fidelity: float = Form(0.5),
    background_enhance: bool = Form(True),
    face_restore: bool = Form(True),
    face_upsample: bool = Form(False),
    output_format: str = Form("JPEG")
):
    try:
        source_bytes = await source.read()
        target_bytes = await target.read()

        image_b64 = call_runpod_faceswap(
            source_bytes=source_bytes,
            target_bytes=target_bytes,
            source_index=source_index,
            target_index=target_index,
            upscale=upscale,
            codeformer_fidelity=codeformer_fidelity,
            background_enhance=background_enhance,
            face_restore=face_restore,
            face_upsample=face_upsample,
            output_format=output_format
        )

        return {
            "status": "success",
            "image_base64": image_b64
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))