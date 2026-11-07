#!/usr/bin/env python3
"""
Agha Food's — Automated Trending Article Publisher
Uses Google Gemini API to research, write, and auto-publish trending culinary articles
for the Agha Food's Kebab & Pizza website.
"""

import os
import sys
import json
import random
import datetime
import urllib.request
import urllib.error
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTICLES_JSON = os.path.join(ROOT_DIR, "assets", "data", "articles.json")
MAIN_JS = os.path.join(ROOT_DIR, "assets", "js", "main.js")
INDEX_HTML = os.path.join(ROOT_DIR, "index.html")

# Available images in the project that match food articles
IMAGES_POOL = [
    {"img": "assets/images/kebab_charcoal.jpg", "category": "grilling", "categoryBadge": "🍢 Charcoal Mastery"},
    {"img": "assets/images/wood_oven.jpg", "category": "pizza", "categoryBadge": "🍕 Stone Oven Science"},
    {"img": "assets/images/burger_monster.jpg", "category": "grilling", "categoryBadge": "🍔 Smash Innovation"},
    {"img": "assets/images/pizza_pepperoni.jpg", "category": "pizza", "categoryBadge": "🍕 Artisanal Crust"},
    {"img": "assets/images/chef_plating.jpg", "category": "recipes", "categoryBadge": "🌶️ Secret Seasoning"},
    {"img": "assets/images/restaurant_vibe.jpg", "category": "culture", "categoryBadge": "🌙 Midnight Feasts"},
    {"img": "assets/images/platter_grill.jpg", "category": "grilling", "categoryBadge": "🍖 Feast Architecture"},
    {"img": "assets/images/fries_loaded.jpg", "category": "culture", "categoryBadge": "🍟 Squad Cravings"},
    {"img": "assets/images/kebab_doner.jpg", "category": "grilling", "categoryBadge": "🥙 Spit-Roasted Craft"}
]

AUTHORS_POOL = [
    {"name": "Chef Tariq Agha", "role": "Master Pitmaster & Founder", "avatar": "assets/images/avatar_1.jpg"},
    {"name": "Chef Marco Valenti", "role": "Head Pizzaiolo & Dough Specialist", "avatar": "assets/images/avatar_2.jpg"},
    {"name": "Spices Master Tariq", "role": "Flavor Alchemist", "avatar": "assets/images/avatar_3.jpg"},
    {"name": "Agha Culinary Team", "role": "Night Shift Innovation Crew", "avatar": "assets/images/avatar_1.jpg"}
]

TRENDING_IDEAS = [
    {
        "topic": "The Royal Secrets of Pakistani Charcoal Seekh & Shinwari Flame",
        "category": "grilling",
        "categoryBadge": "🇵🇰 Pakistani Heritage",
        "tabTitle": "🇵🇰 Pakistani Feast",
        "image": "assets/images/kebab_charcoal.jpg",
        "author": AUTHORS_POOL[0],
        "title": "Pakistani Charcoal Heritage: From Gawalmandi Smoke to Shinwari Fire",
        "excerpt": "Exploring the legendary barbecue culture of Pakistan: how live lump wood embers, hand-tempered spices, and clay tandoor flatbreads forged an iconic street food legacy.",
        "p1": "Few places on earth understand live-fire cooking like the historic food streets of Pakistan. From the smoke-canopied bazaars of Lahore's Gawalmandi to the rugged live-coal pits of Peshawar's Namak Mandi, barbecue is not merely cooking — it is an ancient theatrical art form passed down through generations of pitmasters.",
        "h4": "1. The Raw Spice Alchemy of Lahore & Peshawar",
        "p2": "Authentic Pakistani seekh kebabs owe their legendary juiciness to two sacred rules: cold-ground meat fat ratios (precisely 75% lean to 25% kidney fat) and hand-crushed whole spices. Rather than powdered seasonings, our pitmasters toast green coriander seeds, roasted cumin, pomegranate anardana, and sun-dried Kashmiri chilies. Over glowing mangrove charcoal, the fat vaporizes and permeates every fiber with intoxicating woodsmoke.",
        "quote": "In Pakistan, the flame is family. When the coals glow white and skewers start singing, strangers become brothers around the dastarkhwan.",
        "p3": "Served piping hot straight from the embers alongside fresh mint-coriander raita, pickled sumac onions, and pillow-soft tandoori roghni naan baked inside scorching clay walls.",
        "takeaways": [
            "100% authentic Pakistani street food recipe honoring Lahore & Peshawar grilling traditions.",
            "Hand-skewered with stone-crushed whole roasted spices and fresh ginger-garlic paste.",
            "Served piping hot with clay tandoor roghni naan and house-made mint yogurt raita."
        ]
    },
    {
        "topic": "The Science of Bone Marrow Butter on Sizzling Charcoal Seekh",
        "category": "grilling",
        "categoryBadge": "🍢 Pitmaster Lab",
        "tabTitle": "🧈 Marrow Seekh",
        "image": "assets/images/kebab_charcoal.jpg",
        "author": AUTHORS_POOL[0],
        "title": "Bone Marrow Butter Glaze: Why Basting Over Live Coals Changes Everything",
        "excerpt": "How emulsion basting with whipped bone marrow butter prevents surface drying, creating a lacquered caramelized crust that traps steam inside skewers.",
        "p1": "When lean beef or lamb hits intense radiant charcoal heat, surface moisture vaporizes rapidly. While this creates the beloved Maillard crunch, it risks drying the outermost millimeter of meat. Our solution: an emulsion of rendered beef bone marrow whipped with garlic, smoked paprika, and wild thyme.",
        "h4": "1. The Lipid Barrier and Caramelization",
        "p2": "Brushing skewers with hot marrow butter every 60 seconds creates a thermal barrier. The fats melt into microscopic crevices, frying the spices on the skewer's exterior while preventing juices from escaping. The dripping fats also feed the coals beneath, sending aromatic smoke right back into the meat.",
        "quote": "Basting with bone marrow isn't an indulgence — it's thermodynamic insurance against dry kebab skewers.",
        "p3": "The final glaze delivers a deep, velvet mouthfeel that balances the sharp acidity of pickled red sumac onions and fresh clay-oven bread.",
        "takeaways": [
            "100% grass-fed bone marrow rendered slow and whipped with aromatic herbs.",
            "Applied at 45-second intervals during prime charcoal sear.",
            "Creates a glossy, caramelized outer shell that seals in all natural juices."
        ]
    },
    {
        "topic": "The 72-Hour Sourdough Bigatella for Wood-Fired Pizza",
        "category": "pizza",
        "categoryBadge": "🍕 Dough Chemistry",
        "tabTitle": "🌾 72h Bigatella",
        "image": "assets/images/pizza_special.jpg",
        "author": AUTHORS_POOL[1],
        "title": "72-Hour Sourdough Bigatella: Unlocking The Ultimate Airy Cornicione",
        "excerpt": "Exploring why a stiff pre-ferment (Biga) combined with wild sourdough cultures produces a lightweight, digestible crust with leopard blisters.",
        "p1": "Most commercial pizzas rely on fast direct doughs that inflate quickly but leave your stomach heavy. By building a stiff 50% hydration pre-ferment known as a biga, we allow yeast to feed in a low-moisture environment, producing complex lactic and acetic acid profiles.",
        "h4": "1. Volcanic Gas Traps in Stone Ovens",
        "p2": "When dough fermented for 72 hours hits our 900°F stone hearth, the trapped micro-bubbles of gas expand instantly. The gluten network, softened by natural enzymes over three days, stretches without tearing, forming huge airy pockets and delicate charred leopard spots.",
        "quote": "True pizza should feel as light as air. If you feel weighed down after eating, the dough was rushed.",
        "p3": "Every bite crackles crisply on the tooth before melting away, leaving behind a subtle wheaty aroma and pleasant natural sweetness.",
        "takeaways": [
            "Italian Tipo 00 flour fermented with a heritage sourdough biga starter.",
            "Cold conditioned at 4°C for 72 hours for complete carbohydrate breakdown.",
            "Baked for 90 seconds on cordierite stones at 900°F."
        ]
    },
    {
        "topic": "The Smash Burger Maillard Explosion: Wagyu Tallow & Cast Iron",
        "category": "grilling",
        "categoryBadge": "🍔 Smash Mastery",
        "tabTitle": "🍔 Tallow Smash",
        "image": "assets/images/burger_monster.jpg",
        "author": AUTHORS_POOL[2],
        "title": "Wagyu Tallow Smash: The Physics Behind Our Crispy Lace Patty Edges",
        "excerpt": "Why smashing fresh ground chuck against a 450°F cast-iron surface with hot Wagyu tallow creates the crispiest, juiciest burger in town.",
        "p1": "The secret to a monster smash burger isn't thickness — it's surface contact. By searing a 4 oz beef ball onto a scorching 450°F seasoned cast-iron plancha and applying 15 pounds of direct downward pressure with a weighted steel press, we maximize contact down to the millimeter.",
        "h4": "1. The Lacey Edge Phenomenon",
        "p2": "The edges spread paper-thin, frying in rendering Wagyu tallow until they turn into crisp, crunchy lace. Trapped steam cooks the center in under two minutes, leaving the double-stack burger dripping with juice when assembled with melted American cheese and house secret burger relish.",
        "quote": "A great smash patty is all about contrast: lacy, crispy edges on the outside, succulent melt-in-your-mouth beef inside.",
        "p3": "Served inside a butter-toasted potato brioche bun that absorbs the meat drippings without getting soggy.",
        "takeaways": [
            "80/20 fresh chuck and brisket blend, never frozen.",
            "High-pressure smash with 450°F surface heat creates instant Maillard crust.",
            "Crispy lace edges paired with double sharp melted cheese."
        ]
    },
    {
        "topic": "The Midnight Street Food Ritual: Why Sizzle Culture Connects Us",
        "category": "culture",
        "categoryBadge": "🌙 Food Culture",
        "tabTitle": "🌙 Late Night Vibe",
        "image": "assets/images/restaurant_vibe.jpg",
        "author": AUTHORS_POOL[3],
        "title": "Sizzle Culture at 1:00 AM: Why Late-Night Dining Is A Modern Community Ritual",
        "excerpt": "Exploring why food tastes exponentially better in good company after midnight, and how street grill culture unites night owls across the city.",
        "p1": "When the sun goes down and city traffic clears, the rhythm of dining shifts completely. Daytime dining is often rushed between meetings; late-night dining is pure social connection. Squads gather around sizzling grill platters, laughter echoes across the heated terrace, and time slows down.",
        "h4": "1. The Magic of Shared Feasting",
        "p2": "Food shared from a giant central platter breaks down barriers. Breaking fresh flatbread, dipping into fiery garlic toum, and passing skewers across the table turns a simple midnight craving into a shared memory.",
        "quote": "The best conversations happen after midnight over a smoking grill and fresh garlic naan.",
        "p3": "Our kitchen stays fully staffed and live grills keep glowing until 2:00 AM every night to serve night owls, gamers, creators, and third-shift heroes.",
        "takeaways": [
            "Fresh, made-from-scratch food served until 2:00 AM every single night.",
            "Vibrant heated terrace and private squad booths.",
            "Shared platter dining that brings friends together."
        ]
    }
]


def load_articles():
    if os.path.exists(ARTICLES_JSON):
        with open(ARTICLES_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def generate_with_gemini(api_key, existing_titles):
    """Attempt to generate a new article using Gemini API."""
    models_to_try = [
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
        "gemini-1.5-flash"
    ]
    
    prompt = f"""You are the head food writer and culinary scientist for 'Agha Food\\'s Kebab & Pizza'.
Write an authentic, high-energy, mouth-watering culinary masterclass article about a trending food topic related to:
- live charcoal kebabs / seekh grilling
- wood-fired artisan pizza & dough fermentation
- gourmet smash burgers & loaded fries
- secret spice blending & marinades
- late-night street food culture & midnight feasts.

Existing articles already cover: {json.dumps(existing_titles)}
Choose a FRESH, unique, trending culinary concept!

Return ONLY a valid JSON object with EXACTLY this structure:
{{
  "title": "Engaging Headline (under 80 chars)",
  "category": "grilling" or "pizza" or "recipes" or "culture",
  "categoryBadge": "emoji + Category (e.g. 🍢 Charcoal Mastery)",
  "tabTitle": "emoji + 2-3 word short tab title (e.g. 🍢 Bone Marrow)",
  "readTime": "⏱️ X min read",
  "excerpt": "Compelling 2-sentence summary (under 160 chars)",
  "p1": "Detailed paragraph 1 introducing the cooking science and technique...",
  "h4": "1. Subheading for the core secret...",
  "p2": "Detailed paragraph 2 explaining the chemistry, flame action, or fermentation...",
  "quote": "Inspiring quote from the chef about this culinary craft...",
  "p3": "Paragraph 3 wrapping up the textural experience and taste pairing...",
  "takeaways": [
    "Key actionable takeaway 1",
    "Key actionable takeaway 2",
    "Key actionable takeaway 3"
  ]
}}
Do NOT wrap in markdown fences or backticks. Return raw JSON only."""

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "responseMimeType": "application/json"
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Clean any markdown fences if present
                text = re.sub(r"^```json\s*", "", text)
                text = re.sub(r"^```\s*", "", text)
                text = re.sub(r"\s*```$", "", text)
                parsed = json.loads(text)
                return parsed
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            print(f"Gemini API ({model}) returned {e.code}: {err_body}")
        except Exception as e:
            print(f"Error calling {model}: {e}")

    return None


def generate_fallback(existing_titles):
    """Fallback generator picking a fresh curated topic not yet published."""
    for idea in TRENDING_IDEAS:
        if idea["title"] not in existing_titles:
            return idea
    # If all used, tweak one
    idea = random.choice(TRENDING_IDEAS).copy()
    idea["title"] = f"{idea['title']} (2026 Edition)"
    return idea


def build_article_object(article_data, new_id):
    """Build standardized article dictionary."""
    today = datetime.datetime.now().strftime("%b %d, %Y")
    author = random.choice(AUTHORS_POOL)
    
    # Pick matching image
    cat = article_data.get("category", "grilling")
    matching_images = [item["img"] for item in IMAGES_POOL if item["category"] == cat]
    selected_img = random.choice(matching_images) if matching_images else "assets/images/kebab_charcoal.jpg"
    
    p1 = article_data.get("p1", "")
    h4 = article_data.get("h4", "1. The Culinary Science")
    p2 = article_data.get("p2", "")
    quote = article_data.get("quote", "Fire and passion turn simple ingredients into unforgettable feasts.")
    p3 = article_data.get("p3", "")
    takeaways = article_data.get("takeaways", ["Authentic fresh ingredients.", "Hand-crafted technique.", "Cooked fresh to order."])
    
    takeaways_items = "".join([f"<li>{t}</li>" for t in takeaways])
    
    story_html = f"""<p>{p1}</p><h4>{h4}</h4><p>{p2}</p><div class="reader-quote-box">"{quote}"</div><p>{p3}</p><div class="reader-takeaways-box"><div class="reader-takeaways-title">🔥 Pitmaster Takeaways</div><ul class="reader-takeaways-list">{takeaways_items}</ul></div>"""
    
    return {
        "id": new_id,
        "category": cat,
        "categoryBadge": article_data.get("categoryBadge", "🍢 Flame Craft"),
        "tabTitle": article_data.get("tabTitle", "🔥 Chef Special"),
        "readTime": article_data.get("readTime", "⏱️ 5 min read"),
        "date": today,
        "title": article_data.get("title", "The Secrets of Wood-Fired Perfection"),
        "excerpt": article_data.get("excerpt", "Discover the authentic culinary methods that make Agha Food's dishes unforgettable."),
        "author": author["name"],
        "authorRole": author["role"],
        "authorAvatar": author["avatar"],
        "image": article_data.get("image", selected_img),
        "likes": random.randint(140, 240),
        "storyHtml": story_html
    }


def update_main_js(articles):
    """Update articlesData dictionary inside main.js."""
    if not os.path.exists(MAIN_JS):
        return False
        
    with open(MAIN_JS, "r", encoding="utf-8") as f:
        content = f.read()

    # Build JS object string
    js_entries = []
    for a in articles:
        # Escape backticks in storyHtml
        clean_html = a["storyHtml"].replace("`", "\\`")
        entry = f"""  '{a["id"]}': {{
    id: '{a["id"]}',
    category: '{a["category"]}',
    categoryBadge: '{a["categoryBadge"]}',
    tabTitle: '{a["tabTitle"]}',
    readTime: '{a["readTime"]}',
    date: '{a["date"]}',
    title: {json.dumps(a["title"])},
    author: {json.dumps(a["author"])},
    authorRole: {json.dumps(a["authorRole"])},
    authorAvatar: '{a["authorAvatar"]}',
    image: '{a["image"]}',
    likes: {a["likes"]},
    storyHtml: `{clean_html}`
  }}"""
        js_entries.append(entry)

    new_articles_js = "const articlesData = {\n" + ",\n".join(js_entries) + "\n};"
    
    # Replace articlesData block safely using lambda to avoid escape sequence errors
    pattern = r"const articlesData = \{[\s\S]*?\n\};"
    if re.search(pattern, content):
        content = re.sub(pattern, lambda _: new_articles_js, content)
        with open(MAIN_JS, "w", encoding="utf-8") as f:
            f.write(content)
        print("Updated assets/js/main.js successfully.")
        return True
    else:
        print("Warning: could not locate articlesData in main.js")
        return False


def update_index_html_cache_buster():
    """Bump cache-buster version in index.html to force fresh load."""
    if not os.path.exists(INDEX_HTML):
        return
        
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        html = f.read()
        
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M")
    html = re.sub(r'assets/css/style\.css\?v=[^"]*', f'assets/css/style.css?v={timestamp}', html)
    
    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated index.html cache-buster: v={timestamp}")


def main():
    print("==================================================")
    print("🚀 Agha Food's Automated Article Publisher")
    print(f"Time: {datetime.datetime.now().isoformat()}")
    print("==================================================")
    
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    
    articles = load_articles()
    existing_titles = [a["title"] for a in articles]
    print(f"Current articles count: {len(articles)}")
    
    article_data = None
    if api_key:
        print("Calling Gemini API to research & generate trending food article...")
        article_data = generate_with_gemini(api_key, existing_titles)
        if article_data:
            print("Gemini generated new article:", article_data.get("title"))
    
    if not article_data:
        print("Using smart culinary trending generator...")
        article_data = generate_fallback(existing_titles)
        print("Generated trending topic:", article_data.get("title"))

    new_id = f"article-{len(articles) + 1}"
    new_article = build_article_object(article_data, new_id)
    
    # Prepend as newest lead article
    articles.insert(0, new_article)
    
    # Save JSON
    with open(ARTICLES_JSON, "w", encoding="utf-8") as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print(f"Saved new article to {ARTICLES_JSON}")
    
    # Update main.js
    update_main_js(articles)
    
    # Update cache buster
    update_index_html_cache_buster()
    
    print("==================================================")
    print(f"🎉 Successfully published article: '{new_article['title']}'!")
    print("==================================================")
    return 0


if __name__ == "__main__":
    sys.exit(main())
