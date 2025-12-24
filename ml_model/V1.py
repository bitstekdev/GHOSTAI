# ============================================================
# 🎨 Storybook Generator API (FastAPI + OpenRouter)
# ============================================================
from dotenv import load_dotenv
import os

# Always load .env from the SAME folder as this file
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)
print("API KEY =>", os.getenv("OPENROUTER_API_KEY"))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Tuple
from openai import OpenAI
import os
from fastapi import UploadFile, File, Form
import base64
import logging
from logging.handlers import RotatingFileHandler
from fastapi_utilities import ttl_lru_cache



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

import time
from fastapi import HTTPException

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
            logger.info(f"🧠 Questionnaire LLM attempt [{idx+1}/{len(QUESTIONNAIRE_MODELS)}]: {model}")

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

            logger.info(f"✅ Questionnaire LLM success: {model}")
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

API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

if not API_KEY:
    raise Exception("❌ OPENROUTER_API_KEY missing in .env")

client = OpenAI(
    base_url=BASE_URL,
    api_key=API_KEY,
    default_headers={
        "HTTP-Referer": "https://your-site.com",
        "X-Title": "Storybook Generator API"
    }
)

SECOND_QUESTION = (
    "What happened? List the key incidents in order, and also mention every important person."
)

app = FastAPI(
    title="Storybook Generator API",
    version="1.0",
    description="An API to guide users through a story creation questionnaire and generate cinematic story gists."
)

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
    conversation: List[QA]
    genre: str = "Family"

class StartResponse(BaseModel):
    chat: List[Tuple[str, str]]
    conversation: List[QA]

class NextResponse(BaseModel):
    chat: List[Tuple[str, str]]
    conversation: List[QA]

class GistResponse(BaseModel):
    genre: str
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


def generate_gist(conversation, genre="Family", model="meta-llama/llama-3.3-70b-instruct:free"):
    logger.info("Calling LLM for story gist")

    """Generate cinematic story gist from questionnaire."""

    context = "\n".join(
        [f"Q{i+1}: {c.question}\nA{i+1}: {c.answer}" for i, c in enumerate(conversation)]
    )

    gist_prompt = f"""
You are a skilled story writer.
Turn the following structured Q&A into a short cinematic story gist.

Rules:
- Use ONLY the answers, ignore question wording.
- Maintain emotional tone from answers.
- Genre: {genre}
- Length ≤150 words
- Third person only
- Start with a visual or emotional scene
- Natural storytelling, no lists, no bullets, no dialogues
- Sound like a children’s storybook introduction
"""

    messages = [
        {"role": "system", "content": gist_prompt},
        {"role": "user", "content": f"Questionnaire responses:\n{context}"},
    ]

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.6,
            timeout=60,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gist generation failed: {str(e)}")
    
# story_generator_api.py
# FastAPI Story Page + Prompt Generator
# Single-call API: generates exactly N pages and one cinematic image prompt per page

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import os
import re
import json
from openai import OpenAI

# -----------------------------
# Config / Client
# -----------------------------
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise Exception("Missing OPENROUTER_API_KEY environment variable")

BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
STORY_MODEL = os.getenv("STORY_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
PROMPT_MODEL = os.getenv("PROMPT_MODEL", "meta-llama/llama-3.3-70b-instruct:free")

client = OpenAI(base_url=BASE_URL, api_key=OPENROUTER_API_KEY,
                default_headers={"HTTP-Referer": "https://your-site.com", "X-Title": "Story Generator API"})

#app = FastAPI(title="Story Page + Prompt Generator", version="1.0")

# -----------------------------
# Pydantic models
# -----------------------------
class StoryRequest(BaseModel):
    gist: str = Field(..., description="Story gist text")
    num_characters: int = Field(..., description="Number of characters (kept for compatibility)")
    character_details: str = Field(..., description="Character details, one per line, format: Name: description")
    genre: str = Field("Family", description="Genre name")
    num_pages: int = Field(5, description="Exact number of pages to generate")

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

def regenerate_page(story_text, old_prompt, character_map, page_num, orientation="Landscape"):
    global client 
    """
    Regenerates one page completely:
    1) Rewrites the story paragraph (same meaning)
    2) Rewrites the image prompt based on new story
    3) Regenerates the image with deterministic consistency
    """

    if not story_text or not old_prompt:
        return story_text, old_prompt, None

    # ======================================================
    # 1) REWRITE STORY TEXT
    # ======================================================
    regen_story_system = """
You are a skilled cinematic story rewriter.

Your task:
- Rewrite the paragraph using different wording
- Keep EXACTLY the same meaning, events, actions, and characters
- Keep 3–5 sentences
- Maintain cinematic tone suitable for an illustrated storybook
- Do NOT add new events, props, locations, or characters
- Do NOT change the sequence of actions
- Do NOT explain anything
- Do NOT comment on the rewrite
- Do NOT add titles, prefixes, or labels

STRICT OUTPUT RULES:
- Output ONLY the rewritten paragraph
- NO lines like "Here is the rewritten paragraph:"
- NO commentary
- NO Markdown
- NO quotes
- NO bullet points
    """

    story_rewrite_prompt = f"""
Rewrite the following story paragraph with different wording,
but maintain identical meaning and actions:

Original Paragraph:
{story_text}
    """

    story_resp = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct:free",
        messages=[
            {"role": "system", "content": regen_story_system},
            {"role": "user", "content": story_rewrite_prompt}
        ],
        temperature=0.6,
        timeout=60,
    )

    new_story_text = story_resp.choices[0].message.content.strip()

    # ======================================================
    # 2) REWRITE IMAGE PROMPT
    # ======================================================
    regen_prompt_system = """
You are a professional cinematic visual prompt engineer for AI images.

Your job:
Rewrite the ORIGINAL image prompt into a new cinematic version while keeping:
- SAME characters
- SAME actions
- SAME environment
- SAME emotional tone
- SAME story continuity

You must follow the ORIGINAL prompt style rules exactly.

======================
ORIGINAL CINEMATIC RULES (STRICT)
======================

START every prompt with this exact prefix:

"ultra HD, 8k, sharp focus, cinematic wide shot, full body characters, natural movement,
dynamic action, looking away from the camera, expressive body language, dramatic lighting,
depth of field, atmospheric haze, environmental interaction, cinematic perspective of"

REQUIREMENTS:
- Include ALL character names explicitly (no pronouns)
- Characters must NOT look at the camera
- Show clear physical ACTION (walking, pointing, holding, exploring, discovering, turning, lifting)
- Must show the environment clearly
- Characters must interact with surroundings
- If 2 characters are present, show both
- If 3+ characters appear, show first 3 clearly
- NO new characters allowed
- NO new props allowed
- NO invented outfits
- No changes to the story content
- Only the camera angle or composition may change

END every prompt with the exact suffix:
"consistent faces and outfits as before, cinematic, Hyperrealism, natural lighting."

OUTPUT RULES:
- Output ONLY the rewritten cinematic prompt
- NO explanations
- NO markdown
- NO quotes
- NO prefixes like “Here is the prompt:”

"""

    rewrite_prompt = f"""
Story Page:
{new_story_text}

Original Prompt:
{old_prompt}

Rewrite a new cinematic prompt with:
- SAME characters
- SAME actions
- SAME setting  
But with a slightly different camera angle or composition.
"""

    prompt_resp = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct:free",
        messages=[
            {"role": "system", "content": regen_prompt_system},
            {"role": "user", "content": rewrite_prompt}
        ],
        temperature=0.7,
        timeout=60,
    )

    new_prompt_raw = prompt_resp.choices[0].message.content.strip()
    new_prompt = inject_character_descriptions(new_prompt_raw, character_map)

    # ======================================================
    # 3) GENERATE IMAGE
    # ======================================================
    image = generate_image_from_prompt(
        new_prompt,
        NEGATIVE_PROMPT_TEXT,
        page_num=page_num,
        orientation=orientation
    )

    base64_image = None

    if image:
        from io import BytesIO
        import base64

        buffer = BytesIO()
        image.save(buffer, format="PNG")
        base64_image = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return new_story_text, new_prompt, base64_image


def wrap_regen_page(story_text, old_prompt, character_details, page_num, orientation):
    character_map = {}
    for line in character_details.splitlines():
        if ":" in line:
            name, desc = line.split(":", 1)
            character_map[name.strip()] = desc.strip()

    return regenerate_page(story_text, old_prompt, character_map, page_num, orientation)

def inject_character_descriptions(prompt, character_map):
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
        "Family": (
            "warm cozy lighting, soft pastel tones, gentle ambience, homely scenery, "
            "emotional warmth, friendly joyful atmosphere"
        ),
        "Fantasy": (
            "ethereal glow, magical particles floating, enchanted lighting, warm light rays, "
            "mystical haze, glowing magical accents"
        ),
        "Adventure": (
            "dramatic shadows, rugged terrain, dust particles, high contrast, "
            "energetic composition, cinematic action mood"
        ),
        "Sci-Fi": (
            "neon holograms, futuristic reflections, cool ambience, metallic textures, "
            "glowing circuitry, high-tech atmosphere"
        ),
        "Mystery": (
            "moody gradients, noir ambience, soft fog, muted tones, suspense shadows, "
            "silhouetted lighting"
        ),

       "Birthday": (
            "bright colorful decorations, vibrant party ambience, confetti floating, "
            "warm celebratory lighting, joyful expressions, balloons and ribbons, "
            "soft glowing highlights"
        ),
        "Corporate Promotion": (
            "clean professional ambience, elegant soft lighting, subtle depth-of-field, "
            "modern office environment, confidence-filled atmosphere, muted premium tones, "
            "award-ceremony glow"
        ),
        "Housewarming": (
            "warm inviting home interior, soft ambient light, cozy decor, indoor plants, "
            "fresh welcoming atmosphere, gentle shadows, warm wooden textures"
        ),
        "Marriage": (
            "romantic soft-focus lighting, elegant warm glow, floral decorations, "
            "cinematic highlights, gentle bokeh, pastel romantic tones, "
            "beautiful ceremonial ambience"
        ),
        "Baby Shower": (
            "soft pastel colors, gentle warm light, cute decorations, baby toys, "
            "delicate joyful atmosphere, balloons and soft textures, dreamy nursery tones"
        ),
    }

    return genre_styles.get(genre, "")


def generate_html_for_pages(story_pages: Dict[str, str], genre: str) -> Dict[str, str]:
    """
    Generates semantic HTML for ALL pages in a SINGLE LLM call.
    Returns dict: { "Page 1": "<div>...</div>", ... }
    """

    system_prompt = f"""
You are an expert storybook HTML formatter.

TASK:
You will receive a JSON object mapping Page numbers to story text.
For EACH page, convert the text into semantic HTML.

GLOBAL RULES:
- Output ONLY valid JSON
- Keys must remain exactly the same (Page 1, Page 2, ...)
- Values must be HTML strings

HTML RULES:
- NO <html>, <head>, <style>, or <body>
- Each value MUST be wrapped exactly as:

<div class="container">
  <p class="adventure-text">
    ...
  </p>
</div>

STRICT RULES:
- Output ONLY valid HTML (no markdown, no explanations)
- Use ONLY these classes:
  highlight-place
  highlight-action
  highlight-emotion
  highlight-emphasis
- highlight-place → ONLY physical locations (room, house, table, street)
- highlight-action → verbs or actions,visible physical action only
- highlight-emotion → feelings or mental states internal state / value / feeling
- highlight-emphasis → very important story turning points OR final lesson only
- NEVER highlight time words (morning, evening, night)
- NEVER highlight objects or people
- Do NOT overuse highlights
- If multiple lessons appear, choose ONLY the strongest one for highlight-emphasis
- highlight-place must be a literal, physical location (not symbolic or metaphorical)


HIGHLIGHT RULES (apply intelligently):
- Places → <span class="highlight-place">
- Actions → <span class="highlight-action">
- Emotions → <span class="highlight-emotion">
- ONE major emphasis per page max → <span class="highlight-emphasis">

QUALITY RULES:
- Preserve original wording
- Do NOT over-highlight
- Do NOT add or remove meaning
- No explanations
- No comments
- No markdown
- No escaping

GENRE CONTEXT: {genre}

Return ONLY the JSON object.
"""

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

def generate_story_and_prompts(story_gist: str, num_characters: int, character_details: str, genre: str, num_pages: int):
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
    
    # character_map = {}
    # segments = []

    # # Split by newline first
    # for line in character_details.splitlines():
    #     if line.strip():
    #         # Also split by semicolon inside each line
    #         parts = [p.strip() for p in line.split(";") if p.strip()]
    #         segments.extend(parts)

    # # Parse "name: desc" pairs
    # for seg in segments:
    #     if ":" in seg:
    #         name, desc = seg.split(":", 1)
    #         character_map[name.strip()] = desc.strip()

    # character_names = ", ".join(character_map.keys()

    # --- Story system prompt
    story_system_prompt = f"""
You are a masterful storyteller who creates coherent, a bit poetic, emotional, and cinematic narratives suitable for readers of all ages.

Guiding Principles:
- Begin the story with a warm, natural opening such as “One day,” “Long ago,” or “On a quiet morning,” to gently invite the reader in.
- Avoid unnecessary side plots.
- Each page MUST explicitly include at least one of the provided character names.
- Build the entire narrative solely from the provided story gist and characters.
- The story must contain EXACTLY {num_pages} pages.
- Each page should unfold in 3–5 meaningful, well-crafted sentences.
- Every page must include at least one named character (explicit name, not pronouns).
- You may describe characters physically ONLY if it is already provided in character_details.
- Never invent new characters or new names.
- Maintain a consistent emotional tone that matches the genre: {genre}.
- Genre must match: {genre}.
- Label each part exactly as: Page 1, Page 2, ...

**STRICT CONSTRAINTS**:
- Do NOT include, paraphrase, or hint at any information from character_details.
- Do NOT describe physical appearance, clothing, age, or traits unless they are explicitly stated in the story gist.
- Character names may be used, but no other character_details are allowed in the narrative.

"""


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
        story_pages[tag] = extract_page_from_story(story_output, tag) or ""
        # --- Generate HTML for ALL pages (SINGLE LLM CALL)
    html_pages = generate_html_for_pages(story_pages, genre)


    # --- Build image prompt system
    image_prompt_system = f"""
You are a professional cinematic visual prompt engineer for AI images.
Your job is to create CLEAR, ACTION-BASED, WIDE-SHOT cinematic prompts that match the story.

RULES FOR EVERY PAGE:
- Characters must NOT look at the camera.
- You MUST explicitly mention every character name found in the story page.
- If two or more characters are present, include ALL their names in the prompt text.
- Characters must NOT pose like a portrait photo.
- Every page must include at least one clear physical action (e.g., walking, discovering, holding, pointing, exploring, examining, opening, approaching, turning, stepping, lifting, noticing).
- Use full-body or mid-body composition.
- Show the environment clearly.
- Always show characters interacting with their surroundings.
- If 2 characters are present, both MUST appear in the prompt.
- If 3+ characters appear, show the first 3 clearly, others implied softly.

ABSOLUTE CHARACTER CONSTRAINT:
- ONLY the explicitly named characters may appear.
- NO crowd, NO background people, NO silhouettes, NO partial humans.
- Public places must be shown EMPTY except for the named characters.

START EVERY PROMPT WITH:
"ultra HD, 8k, sharp focus, cinematic wide shot, full body characters, natural movement, dynamic action, looking away from the camera, expressive body language, dramatic lighting, depth of field, atmospheric haze, environmental interaction, cinematic perspective"
- End every prompt with:
  "consistent faces and outfits as before, cinematic, Hyperrealism, natural lighting."

CRITICAL:
- You MUST return ONLY a valid JSON object.
- No text before or after JSON.
- No explanations.
- No natural language.
- No comments.
- The ONLY valid output format is a JSON object mapping Page X -> prompt string.
"""

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
    
        # ⭐ NEW GENRES BELOW ⭐
    
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

    return pages_out

# images_api_hidream.py
import os
import re
import time
import uuid
import json
import hashlib
import base64
import tempfile
import requests
from io import BytesIO
from typing import List, Optional
from PIL import Image
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ----------------------------
# Config (use env vars or fallbacks)
# ----------------------------
RUNPOD_HIDREAM_URL = os.getenv("RUNPOD_HIDREAM_URL")
RUNPOD_HIDREAM_STATUS = os.getenv("RUNPOD_HIDREAM_STATUS")
RUNPOD_AUTH_BEARER = os.getenv("RUNPOD_AUTH_BEARER")

# Safety / generation defaults
DEFAULT_TIMEOUT = int(os.getenv("IMAGE_GEN_TIMEOUT_S", "1600"))  # seconds
POLL_INTERVAL = float(os.getenv("IMAGE_GEN_POLL_INTERVAL_S", "3.0"))

# Negative prompt text (from your snippet)
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

# ----------------------------
# FastAPI app + models
# ----------------------------
#app = FastAPI(title="Image Generator (HiDreamXL Serverless)")

class PageIn(BaseModel):
    page: int
    text: str   # SDXL prompt placeholder (not used for hidream now)
    prompt: str # HiDreamXL prompt (detailed)

class ImageRequest(BaseModel):
    pages: List[PageIn]
    orientation: Optional[str] = Field("Landscape", description="Landscape | Portrait | Square")

class HiDreamPageOut(BaseModel):
    page: int
    hidream_image_base64: Optional[str] = None
    error: Optional[str] = None

class ImageResponse(BaseModel):
    pages: List[HiDreamPageOut]
    



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
    base = "_".join(sorted(chars)) + f"_page{page_num}"
    seed_val = int(hashlib.sha256(base.encode()).hexdigest(), 16) % (2**32)
    return seed_val

def get_dimensions(orientation: str):
    if not orientation:
        orientation = "Landscape"
    orientation = orientation.strip().lower()
    if orientation == "portrait":
        return 1024, 1536
    if orientation == "square":
        return 1024, 1024
    return 1536, 1024

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
# images_api_sdxl.py
"""
SDXL Background Generator API
- Single LLM call for all pages (LLM returns final SDXL prompts for each page)
- Per-page SDXL generation (RunPod)
- Left-side fade effect applied to each background (ready for text overlay)
- Outputs base64 PNG per page with same structure as HiDream API
"""

import os
import re
import time
import json
import base64
import uuid
import requests
import hashlib
from io import BytesIO
from typing import List, Optional, Dict
from PIL import Image, ImageDraw, ImageFilter
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ----------------------------
# Configuration (env-overrides)
# ----------------------------
OPENROUTER_API_URL = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise Exception("Missing OPENROUTER_API_KEY environment variable")

RUNPOD_SDXL_URL = os.getenv("RUNPOD_SDXL_URL", "https://api.runpod.ai/v2/2epfnuazhyb2mm/run")
RUNPOD_SDXL_STATUS = os.getenv("RUNPOD_SDXL_STATUS", "https://api.runpod.ai/v2/2epfnuazhyb2mm/status/{}")
RUNPOD_API_KEY = os.getenv("RUNPOD_API_KEY")
if not RUNPOD_API_KEY:
    raise Exception("Missing RUNPOD_API_KEY environment variable")

# Tunables
LLM_MODEL = os.getenv("SDXL_LLM_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
LLM_TEMPERATURE = float(os.getenv("SDXL_LLM_TEMP", "0.3"))
POLL_INTERVAL = float(os.getenv("SDXL_POLL_INTERVAL_S", "3.0"))
JOB_TIMEOUT = int(os.getenv("SDXL_JOB_TIMEOUT_S", "600"))  # 10 minutes

# Negative prompt for SDXL (can be edited)
NEGATIVE_PROMPT = os.getenv("SDXL_NEGATIVE_PROMPT", (
    "text, watermark, signature, low quality, deformed, mutated, extra limbs, "
    "bad anatomy, bad proportions, poorly drawn, jpeg artifacts, pixelated, nsfw, nude"
))

# ----------------------------
# FastAPI app + models
# ----------------------------
#app = FastAPI(title="SDXL Background Generator (Single LLM call)")

class PageIn(BaseModel):
    page: int
    text: str  # story page text (used by LLM to create prompt)

class SDXLRequest(BaseModel):
    pages: List[PageIn]
    orientation: Optional[str] = Field("Landscape", description="Landscape | Portrait | Square")

class SDXLPageOut(BaseModel):
    page: int
    sdxl_prompt: Optional[str] = None
    sdxl_background_base64: Optional[str] = None
    error: Optional[str] = None

class SDXLResponse(BaseModel):
    pages: List[SDXLPageOut]
    message: str

# ----------------------------
# Helpers
# ----------------------------
def is_nsfw_prompt(prompt: str) -> bool:
    banned = {
        "nude", "naked", "nsfw", "porn", "sex", "erotic", "boobs", "cleavage",
        "topless", "sexy", "underboob", "lingerie", "ass", "dick"
    }
    tokens = re.findall(r'\b\w+\b', (prompt or "").lower())
    return any(t in banned for t in tokens)

def get_dimensions(orientation: str):
    if not orientation:
        orientation = "Landscape"
    o = orientation.strip().lower()
    if o == "portrait":
        return 1024, 1536
    if o == "square":
        return 1024, 1024
    return 1536, 1024

def fade_left_background(image: Image.Image, fade_width_ratio: float = 0.45,
                         blur_strength: int = 6, opacity_boost: float = 0.65) -> Image.Image:
    """
    Apply left-side fade (blur + white overlay) so the left side becomes drawable for text.
    """
    if image.mode != "RGBA":
        base_img = image.convert("RGBA")
    else:
        base_img = image.copy()

    w, h = base_img.size
    fade_w = int(w * fade_width_ratio)

    # mask: left-to-right ramp 0 -> 255
    mask = Image.new("L", (w, h), 255)
    mdraw = ImageDraw.Draw(mask)
    for x in range(fade_w):
        alpha = int(255 * (x / max(1, fade_w)))
        mdraw.line([(x, 0), (x, h)], fill=alpha)

    # blurred background blended
    blurred = base_img.filter(ImageFilter.GaussianBlur(blur_strength))
    faded = Image.composite(blurred, base_img, mask)

    # overlay white on left side to create text-friendly space
    overlay = Image.new("RGBA", base_img.size, (255, 255, 255, int(255 * opacity_boost)))
    left_mask = mask.point(lambda p: 255 - p)  # invert so left side gets overlay
    faded_img = Image.composite(overlay, faded, left_mask)

    return faded_img

# ----------------------------
# LLM: single-call multi-page to generate final SDXL prompts
# ----------------------------
def build_multi_page_llm_payload(pages: List[PageIn]) -> Dict:
    """
    Build a user content containing JSON mapping Page -> text to send to the LLM.
    We ask the LLM to return a JSON object mapping Page N -> {"sdxl_prompt": "..."}
    with strict rules for scenic, pastel, no humans, no silhouettes.
    """
    pages_dict = {f"Page {p.page}": p.text for p in pages}
    user_content = (
        "You are a pro prompt engineer for Stable Diffusion XL (SDXL). "
        "You will receive a JSON object mapping Page numbers to short story texts. "
        "For each page produce a single final SDXL prompt optimized for landscape/storybook background images only.\n\n"
        "REQUIREMENTS FOR EVERY PROMPT:\n"
        "- Pastel, watercolor, soft brushwork, dreamy storybook lighting.\n"
        "- NO HUMANS, NO SILHOUETTES, NO HUMAN SHAPES, NO FACES. Strictly scenic elements only.\n"
        "- No text, no watermark, no logos.\n"
        "- Include atmosphere, lighting, color palette, composition, and 3-6 visual objects/elements.\n"
        "- Keep prompts concise (one sentence) but descriptive enough for SDXL.\n"
        "- Return ONLY a valid JSON object, with keys exactly 'Page 1', 'Page 2', etc. Each value must be an object with a single key 'sdxl_prompt'.\n"
        "- Example output structure:\n"
        '{ \"Page 1\": { \"sdxl_prompt\": \"...\" }, \"Page 2\": { \"sdxl_prompt\": \"...\" } }\n\n'
        "Now the input JSON (do not add explanation):\n"
        f"{json.dumps(pages_dict, ensure_ascii=False)}\n\n"
        "Return only the JSON object, nothing else."
    )
    return {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": user_content}],
        "temperature": LLM_TEMPERATURE
    }

def call_llm_get_prompts(pages: List[PageIn]) -> Optional[Dict[str, Dict[str, str]]]:
    """
    Call OpenRouter (LLM) once, parse JSON and return mapping Page -> {"sdxl_prompt": "..."}
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
# SDXL call wrapper (RunPod)
# ----------------------------
def run_runpod_sdxl(prompt: str, width: int, height: int, seed: int = None):
    """
    Call RunPod SDXL serverless endpoint with a simple payload.
    Expects the RunPod job to return an output.images[0] that contains a data:image/png;base64,... string.
    """
    if seed is None:
        seed = int(hashlib.sha256((prompt + str(time.time())).encode()).hexdigest(), 16) % (2**32)

    payload = {
        "input": {
            "prompt": prompt,
            "negative_prompt": NEGATIVE_PROMPT,
            "width": width,
            "height": height,
            "num_inference_steps": 25,
            "refiner_inference_steps": 50,
            "guidance_scale": 7.5,
            "strength": 0.3,
            "seed": seed,
            "scheduler": "K_EULER",
            "num_images": 1
        }
    }

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {RUNPOD_API_KEY}"}
    resp = requests.post(RUNPOD_SDXL_URL, headers=headers, json=payload, timeout=30)
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"RunPod SDXL start failed: {resp.status_code} {resp.text}")

    job = resp.json()
    job_id = job.get("id")
    if not job_id:
        raise RuntimeError("No job id from RunPod SDXL.")

    start_time = time.time()
    while True:
        if time.time() - start_time > JOB_TIMEOUT:
            raise RuntimeError("TTL exceeded: RunPod SDXL job timed out.")
        status = requests.get(RUNPOD_SDXL_STATUS.format(job_id), headers=headers, timeout=30)
        if status.status_code != 200:
            raise RuntimeError(f"RunPod status check failed: {status.status_code} {status.text}")
        st = status.json()
        code = st.get("status", "").upper()
        if code == "COMPLETED":
            output = st.get("output", {})
            images = output.get("images", [])
            if not images:
                raise RuntimeError("No images returned from RunPod SDXL.")
            # images[0] should be data:image/png;base64,...
            return images[0]
        if code == "FAILED":
            raise RuntimeError("RunPod SDXL job failed.")
        if time.time() - start_time > JOB_TIMEOUT:
            raise RuntimeError("Timeout waiting for RunPod SDXL job.")
        time.sleep(POLL_INTERVAL)
        
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

    prompt = f"""
You are a bestselling book-title creator known for crafting powerful but simple cinematic titles.

TASK:
Generate FIVE easy-to-understand, emotionally strong book titles.
Each title must use simple, everyday vocabulary while still feeling cinematic and premium.
Each title must be different in wording and meaning.

STRICT RULES FOR EACH TITLE:
- 3 to 4 words total
- SIMPLE everyday words only
- No complex or abstract vocabulary
- No character names
- No locations unless essential
- No punctuation or quotes
- No numbering
- No “X of Y” structure
- No titles starting with “The”
- Each title MUST appear on its own line

STYLE:
- Simple but cinematic
- Emotional, clear, meaningful
- Understandable at a glance

GENRE: {genre}

STORY:
{full_story}

{avoid_list_text}

Now generate exactly 5 NEW titles:
"""

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
    regenerated: bool = False
# ============================
# coverback_api_simple.py
"""
Standalone Cover + BackCover Generator (No characters on cover)
- Single endpoint: POST /coverback/generate
- Input: pages[], genre, orientation, story_title (optional), qr_url (optional)
- Output: base64 cover image + base64 back image + prompts + blurb
"""

import os
import time
import uuid
import json
import base64
import textwrap
import random
import requests
from io import BytesIO
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from PIL import Image, ImageDraw, ImageFont
import qrcode

# ----------------------------
# Configuration (env or defaults)
# ----------------------------
OPENROUTER_API_URL = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise Exception("OPENROUTER_API_KEY environment variable is required")

RUNPOD_HIDREAM_URL = os.getenv("RUNPOD_HIDREAM_URL", "https://api.runpod.ai/v2/13qcrvhdetvkgx/run")
RUNPOD_HIDREAM_STATUS = os.getenv("RUNPOD_HIDREAM_STATUS", "https://api.runpod.ai/v2/13qcrvhdetvkgx/status/{}")
RUNPOD_AUTH_BEARER = os.getenv("RUNPOD_AUTH_BEARER")

if not RUNPOD_AUTH_BEARER:
    raise Exception("RUNPOD_AUTH_BEARER environment variable is required")

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
#app = FastAPI(title="Cover & BackCover Generator (Simple, No Characters on Cover)")

class PageIn(BaseModel):
    page: int
    text: str
    prompt: Optional[str] = None

class CoverBackRequest(BaseModel):
    pages: List[PageIn]
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
        width, height = 1024, 1536
    elif o == "square":
        width, height = 1024, 1024
    else:
        width, height = 1536, 1024

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
    system = """
You are a cinematic visual prompt generator for AI image models.

STRICT RULES:
- NO text, NO title, NO symbols, NO lettering.
- Absolutely NO characters.
- MUST be photorealistic, modern, sharp, and cinematic.
- Only ONE visual scene (35–45 words).
- Must be based ONLY on objects/locations/atmosphere from the extracted visuals.
- No long sentences. No paragraphs.
- No metaphors, no abstract symbolism.

Start with:
"ultra HD, 8k, photorealistic, ultra-sharp focus, dramatic cinematic lighting,"

End with:
"Hyperrealism, natural lighting."
"""
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
    back_sys = (
        "You are a senior editorial writer at Penguin Random House.\n\n"
        "Write a polished, market-ready BACK COVER BLURB.\n\n"
        "STRICT RULES:\n"
        "- Output MUST be ONLY the blurb sentence + the Theme Highlight.\n"
        "- Do NOT write: 'Here is...', 'This is...', 'Below is...', or any meta-text.\n"
        "- Do NOT explain, introduce, label, or format the answer.\n"
        "- EXACTLY 1 warm, emotional, premium sentence.\n"
        "- No spoilers.\n"
        "- Mention characters lightly.\n"
        f"- Tone must match the genre: {genre}.\n"
        "- End with a one-line Theme Highlight formatted as: Theme Highlight: \"...\""
    )
    user = f"Story gist:\n{full_story_text}\nGenre: {genre}"

    try:
        blurb_raw = call_openrouter_system_user(back_sys, user, temperature=0.5)
        blurb = blurb_raw.strip()
    except Exception:
        blurb = "A powerful emotional journey.\nTheme Highlight: \"Hope and resilience.\""

    # Generate back cover visual prompt
    back_visual_sys = (
        "You are a cinematic visual prompt generator for AI book BACK COVERS.\n\n"
        "Rules:\n"
        "- NO humans, NO silhouettes.\n"
        "- Only environments, objects, props, lighting.\n"
        "- Mood: reflective, calm ending.\n"
        "- Photorealistic 8k, cinematic.\n"
        "- 35–45 words only.\n"
        f"- Genre tone: {genre}.\n"
        "- No metaphors.\n"
        "Begin with: ultra HD, 8k, photorealistic, soft dramatic lighting,\n"
        "End with: Hyperrealism, natural lighting."
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
        "Authorization": f"Bearer {RUNPOD_API_KEY}"
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
        "Authorization": f"Bearer {RUNPOD_API_KEY}",
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


import os

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


@app.post("/gist", response_model=GistResponse)
def gist(data: GistInput):
    logger.info("Generating gist for genre: %s", data.genre)
    """Generate cinematic story gist."""
    conversation = data.conversation
    gist_text = generate_gist(conversation, genre=data.genre)
    return {"genre": data.genre, "gist": gist_text}

# -----------------------------
# FastAPI endpoint
# -----------------------------
@app.post("/story/generate", response_model=StoryResponse)
def story_generate(req: StoryRequest):
    """Generate story pages + cinematic prompts in a single call."""
    try:
        if req.num_pages < 1 or req.num_pages > 50:
            raise HTTPException(status_code=400, detail="num_pages must be between 1 and 50")

        pages = generate_story_and_prompts(req.gist, req.num_characters, req.character_details, req.genre, req.num_pages)

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

@app.post("/images/generate", response_model=ImageResponse)
def images_generate(req: ImageRequest):
    if not req.pages or len(req.pages) == 0:
        raise HTTPException(status_code=400, detail="No pages provided.")

    results: List[HiDreamPageOut] = []


    for p in req.pages:
        page_num = p.page
        prompt = p.prompt or ""
        # We use prompt for HiDream generation. text is reserved for SDXL later.
        try:
            # NSFW quick check
            if is_nsfw_prompt(prompt):
                results.append(HiDreamPageOut(page=page_num, hidream_image_base64=None, error="NSFW content detected. Skipped."))
                continue

            img = generate_image_from_prompt(prompt, NEGATIVE_PROMPT_TEXT, page_num=page_num, orientation=req.orientation)
            if img is None:
                results.append(HiDreamPageOut(page=page_num, hidream_image_base64=None, error="Generation returned no image."))
                continue

            # convert to base64 PNG
            buf = BytesIO()
            img.save(buf, format="PNG")
            encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
            results.append(HiDreamPageOut(page=page_num, hidream_image_base64=encoded, error=None))

        except Exception as e:
            results.append(HiDreamPageOut(page=page_num, hidream_image_base64=None, error=str(e)))

    return ImageResponse(pages=results, message="HiDream generation completed (SDXL background pending).")

class RegenPageInput(BaseModel):
    page: int
    text: str
    prompt: str
    character_details: str  # REQUIRED


class RegenRequest(BaseModel):
    pages: List[RegenPageInput]
    orientation: str = "Landscape"


@app.post("/images/regenerate")
def regenerate_images(req: RegenRequest):
    results = []

    for page in req.pages:
        # 1️⃣ Regenerate story + prompt + image
        new_story, new_prompt, image_b64 = wrap_regen_page(
            story_text=page.text,
            old_prompt=page.prompt,
            character_details=page.character_details,
            page_num=page.page,
            orientation=req.orientation
        )

        # 2️⃣ 🔥 Regenerate HTML (SINGLE-PAGE LLM CALL)
        html_map = generate_html_for_pages(
            {f"Page {page.page}": new_story},
            genre="Family"   # or page.genre if you pass it
        )

        new_html = html_map.get(f"Page {page.page}", "")

        # 3️⃣ Collect result
        results.append({
            "page": page.page,
            "new_story": new_story,
            "new_html": new_html,     # ✅ HTML regenerated
            "new_prompt": new_prompt,
            "image_base64": image_b64
        })

    return {
        "pages": results,
        "message": "Regeneration completed (story + prompt + HTML)."
    }
# ============================

# ----------------------------
# Run with: uvicorn images_api_hidream:app --reload
# ----------------------------
@app.post("/images/sdxl_generate", response_model=SDXLResponse)
def sdxl_generate(req: SDXLRequest):
    if not req.pages:
        raise HTTPException(status_code=400, detail="No pages provided.")

    # Quick NSFW guard: entire batch should not contain NSFW tokens
    combined_text = " ".join([p.text for p in req.pages])
    if is_nsfw_prompt(combined_text):
        raise HTTPException(status_code=400, detail="NSFW content detected in input texts.")

    # 1) Single LLM call to get final SDXL prompts for all pages
    llm_out = call_llm_get_prompts(req.pages)
    if not llm_out:
        raise HTTPException(status_code=500, detail="LLM failed to produce SDXL prompts.")

    # Validate structure: expecting keys "Page 1", "Page 2", ...
    results: List[SDXLPageOut] = []
    width, height = get_dimensions(req.orientation)

    for p in req.pages:
        page_key = f"Page {p.page}"
        page_result = SDXLPageOut(page=p.page)
        try:
            page_info = llm_out.get(page_key) if isinstance(llm_out, dict) else None
            if not page_info or "sdxl_prompt" not in page_info:
                page_result.error = "LLM did not return prompt for this page."
                results.append(page_result)
                continue

            sdxl_prompt = page_info["sdxl_prompt"]
            page_result.sdxl_prompt = sdxl_prompt

            # per-page NSFW safety check on the produced prompt
            if is_nsfw_prompt(sdxl_prompt):
                page_result.error = "LLM produced NSFW prompt. Skipped."
                results.append(page_result)
                continue

            # call RunPod SDXL
            raw_image_data = run_runpod_sdxl(sdxl_prompt, width, height)

            # raw_image_data may be a URL or a data:image/png;base64,... string
            if raw_image_data.startswith("data:image"):
                b64 = raw_image_data.split(",", 1)[1]
            else:
                # if it's a URL, fetch it
                if raw_image_data.startswith("http"):
                    r = requests.get(raw_image_data, timeout=30)
                    if r.status_code != 200:
                        raise RuntimeError("Failed to fetch image URL from RunPod output.")
                    b64 = base64.b64encode(r.content).decode()
                else:
                    # maybe it's already raw base64 (no header)
                    b64 = raw_image_data

            # decode image and apply fade
            img = Image.open(BytesIO(base64.b64decode(b64)))
            faded_img = fade_left_background(img)

            # encode final image into base64 PNG
            buf = BytesIO()
            faded_img.save(buf, format="PNG")
            final_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

            page_result.sdxl_background_base64 = final_b64
            page_result.error = None
            results.append(page_result)

        except Exception as e:
            page_result.error = str(e)
            results.append(page_result)

    return SDXLResponse(pages=results, message="SDXL generation finished (fade applied).")

# ============================
# 🚀 API ENDPOINTS
# ============================

@app.post("/title/generate", response_model=TitleListResponse)
def title_generate(req: GenerateTitleRequest):
    """
    Generate 5 simple cinematic book titles.
    """
    story = req.story.strip()
    genre = req.genre.strip()

    if not story:
        raise HTTPException(status_code=400, detail="Story text is empty.")

    titles = _generate_titles_internal(story, genre)

    return TitleListResponse(titles=titles, regenerated=False)


@app.post("/title/regenerate", response_model=TitleListResponse)
def title_regenerate(req: RegenerateTitleRequest):
    """
    Regenerate 5 NEW titles that must NOT be similar to previous ones.
    """
    story = req.story.strip()
    genre = req.genre.strip()

    if not story:
        raise HTTPException(status_code=400, detail="Story text is empty.")

    if not req.previous_titles:
        raise HTTPException(status_code=400, detail="previous_titles is required for regeneration.")

    new_titles = _generate_titles_internal(story, genre, avoid_list=req.previous_titles)

    return TitleListResponse(titles=new_titles, regenerated=True)
# ============================

# ----------------------------
# Run: uvicorn images_api_sdxl:app --reload
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
# ============================
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
