
#!/usr/bin/env python3

import json
import os
import re
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup


# Configuration
CHANNEL = "spbueu"
URL = f"https://t.me/s/{CHANNEL}"
MAX_ITEMS = 20

OUTPUT = Path(__file__).resolve().parents[2] / "news.json"


def fetch_news():
    """Download and extract public Telegram posts."""

    request = Request(
        URL,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/html",
        },
    )

    with urlopen(request, timeout=30) as response:
        soup = BeautifulSoup(
            response.read(),
            "html.parser",
        )

    items = {}

    for post in soup.select(
        ".tgme_widget_message[data-post]"
    ):
        post_id = post.get("data-post", "")

        match = re.fullmatch(
            rf"{re.escape(CHANNEL)}/(\d+)",
            post_id,
            re.IGNORECASE,
        )

        if not match:
            continue

        message_id = int(match.group(1))

        text = post.select_one(
            ".tgme_widget_message_text"
        )

        date = post.select_one("time[datetime]")

        if text:
            for br in text.find_all("br"):
                br.replace_with("\n")

            content = text.get_text().strip()
        else:
            content = "Media post — view on Telegram."

        items[message_id] = {
            "title": "View post on Telegram",
            "url": f"https://t.me/{CHANNEL}/{message_id}",
            "date_published": (
                date.get("datetime") if date else None
            ),
            "content_text": content,
        }

    if not items:
        raise RuntimeError(
            "No Telegram posts found. Existing cache preserved."
        )

    return {
        "items": [
            items[key]
            for key in sorted(items, reverse=True)[:MAX_ITEMS]
        ]
    }


def save_news(data):
    """Save news safely without unnecessary changes."""

    content = json.dumps(
        data,
        ensure_ascii=False,
        indent=2,
    ) + "\n"

    if OUTPUT.exists():
        if OUTPUT.read_text(encoding="utf-8") == content:
            print("No news changes.")
            return

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=OUTPUT.parent,
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)
            temp_file.write(content)

        os.chmod(temp_path, 0o644)
        os.replace(temp_path, OUTPUT)

    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)

    print(f"Saved {len(data['items'])} Telegram posts.")


def main():
    data = fetch_news()
    save_news(data)


if __name__ == "__main__":
    main()
