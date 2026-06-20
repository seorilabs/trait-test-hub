"""
범용 결과 이미지 제너레이터.

draft(`content/test-packs/drafts/<testId>.json`)의 결과 code를 읽어,
결과마다 색과 구도(모티프)가 모두 다른 추상 그래픽을 생성합니다.
테스트별로 손으로 팔레트를 박던 gen-<topic>-images.py들을 대체합니다.

사용법:
    python3 scripts/gen-result-images.py --testId=<testId>
    python3 scripts/gen-result-images.py --draft=content/test-packs/drafts/<testId>.json

산출물 (결과 code마다 2장):
    content/test-packs/packs/<packId>/assets/<testId>/<code>.png         960x640
    content/test-packs/packs/<packId>/assets/<testId>/<code>-share.png   1200x630

설계 원칙:
- 한글 텍스트는 폰트 렌더링이 보장되지 않으므로 이미지에 넣지 않는다.
- 결과 code의 해시로 팔레트 hue와 모티프를 결정해, 같은 이미지의 색만 바꾼 복제를 피한다.
- 외부 에셋/네트워크 의존 없이 PIL만으로 생성한다.
"""
import argparse
import colorsys
import hashlib
import json
import math
import os
import sys

from PIL import Image, ImageDraw

MAIN_SIZE = (960, 640)
SHARE_SIZE = (1200, 630)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def stable_hash(text: str) -> int:
    """플랫폼/실행에 무관하게 동일한 정수 해시를 만든다."""
    return int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16)


def hsv_hex(h: float, s: float, v: float) -> tuple:
    r, g, b = colorsys.hsv_to_rgb(h % 1.0, max(0.0, min(1.0, s)), max(0.0, min(1.0, v)))
    return (int(r * 255), int(g * 255), int(b * 255))


def build_palette(test_id: str, code: str, index: int, total: int) -> dict:
    """결과별 팔레트. hue는 테스트 시드 + 결과 위치로 고르게 분산한다."""
    seed_hue = (stable_hash(test_id) % 360) / 360.0
    spread = index / max(1, total)
    jitter = ((stable_hash(code) % 40) - 20) / 360.0
    base_hue = (seed_hue + spread + jitter) % 1.0
    return {
        "base_hue": base_hue,
        "bg": hsv_hex(base_hue, 0.18, 0.98),
        "bg2": hsv_hex((base_hue + 0.03) % 1.0, 0.30, 0.95),
        "primary": hsv_hex(base_hue, 0.70, 0.82),
        "secondary": hsv_hex((base_hue + 0.08) % 1.0, 0.55, 0.92),
        "accent": hsv_hex((base_hue - 0.06) % 1.0, 0.78, 0.62),
        "shape": hsv_hex((base_hue + 0.04) % 1.0, 0.45, 0.90),
        "light": hsv_hex(base_hue, 0.10, 1.0),
    }


def vertical_gradient(size: tuple, top: tuple, bottom: tuple) -> Image.Image:
    w, h = size
    base = Image.new("RGB", (w, h), top)
    grad = Image.new("L", (1, h))
    for y in range(h):
        grad.putpixel((0, y), int(255 * (y / max(1, h - 1))))
    grad = grad.resize((w, h))
    bottom_img = Image.new("RGB", (w, h), bottom)
    return Image.composite(bottom_img, base, grad)


def soft_circles(img: Image.Image, palette: dict, seed: int):
    """배경 장식용 반투명 원."""
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    rnd = seed
    for i in range(7):
        rnd = (rnd * 1103515245 + 12345) & 0x7FFFFFFF
        px = (rnd % 1000) / 1000.0 * w
        rnd = (rnd * 1103515245 + 12345) & 0x7FFFFFFF
        py = (rnd % 1000) / 1000.0 * h
        rnd = (rnd * 1103515245 + 12345) & 0x7FFFFFFF
        pr = 50 + (rnd % 120)
        color = palette["shape"] if i % 2 == 0 else palette["secondary"]
        od.ellipse([px - pr, py - pr, px + pr, py + pr], fill=color + (40,))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0))


# ---- 모티프 (결과 code 해시로 선택) -------------------------------------------

def motif_concentric(d, cx, cy, r, p):
    rings = 6
    for i in range(rings):
        rr = r * (1 - i / rings)
        color = p["primary"] if i % 2 == 0 else p["accent"]
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=color, width=10)


def motif_petals(d, cx, cy, r, p):
    petals = 8
    for i in range(petals):
        a = math.radians(i * 360 / petals)
        ox = cx + math.cos(a) * r * 0.45
        oy = cy + math.sin(a) * r * 0.45
        d.ellipse([ox - r * 0.4, oy - r * 0.4, ox + r * 0.4, oy + r * 0.4],
                  fill=p["secondary"], outline=p["accent"], width=4)
    d.ellipse([cx - r * 0.3, cy - r * 0.3, cx + r * 0.3, cy + r * 0.3],
              fill=p["primary"], outline=p["accent"], width=5)


def motif_polygon(d, cx, cy, r, p):
    sides = 5 + (int(p["base_hue"] * 6) % 3)
    for layer, scale in enumerate((1.0, 0.62, 0.3)):
        pts = []
        for i in range(sides):
            a = math.radians(i * 360 / sides - 90 + layer * 12)
            pts.append((cx + math.cos(a) * r * scale, cy + math.sin(a) * r * scale))
        fill = (p["primary"], p["secondary"], p["accent"])[layer]
        d.polygon(pts, fill=fill, outline=p["accent"])


def motif_bars(d, cx, cy, r, p):
    n = 7
    bw = (r * 2) / (n * 1.6)
    for i in range(n):
        x = cx - r + i * bw * 1.6
        bh = r * (0.4 + ((i * 37) % 100) / 100.0 * 1.1)
        color = p["primary"] if i % 2 == 0 else p["secondary"]
        d.rounded_rectangle([x, cy + r - bh, x + bw, cy + r], radius=int(bw / 3), fill=color)


def motif_dots(d, cx, cy, r, p):
    grid = 5
    step = (r * 2) / (grid - 1)
    for i in range(grid):
        for j in range(grid):
            x = cx - r + i * step
            y = cy - r + j * step
            dr = 10 + ((i + j) % 3) * 9
            color = (p["primary"], p["secondary"], p["accent"])[(i + j) % 3]
            d.ellipse([x - dr, y - dr, x + dr, y + dr], fill=color)


def motif_burst(d, cx, cy, r, p):
    rays = 12
    for i in range(rays):
        a = math.radians(i * 360 / rays)
        x2 = cx + math.cos(a) * r
        y2 = cy + math.sin(a) * r
        color = p["primary"] if i % 2 == 0 else p["accent"]
        d.line([cx, cy, x2, y2], fill=color, width=14)
    d.ellipse([cx - r * 0.3, cy - r * 0.3, cx + r * 0.3, cy + r * 0.3],
              fill=p["secondary"], outline=p["accent"], width=6)


MOTIFS = [motif_concentric, motif_petals, motif_polygon, motif_bars, motif_dots, motif_burst]


def make_image(test_id: str, code: str, palette: dict, size: tuple) -> Image.Image:
    w, h = size
    img = vertical_gradient(size, palette["bg"], palette["bg2"])
    soft_circles(img, palette, stable_hash(code))
    draw = ImageDraw.Draw(img, "RGBA")

    cx, cy = w // 2, h // 2
    r = int(min(w, h) * 0.30)
    motif = MOTIFS[stable_hash(code) % len(MOTIFS)]
    motif(draw, cx, cy, r, palette)

    # 상/하단 장식 라인
    for i in range(3):
        a = 200 - i * 60
        draw.rectangle([48, 22 + i * 12, w - 48, 25 + i * 12], fill=palette["accent"] + (a,))
        draw.rectangle([48, h - 25 - i * 12, w - 48, h - 22 - i * 12], fill=palette["accent"] + (a,))
    return img.convert("RGB")


def load_draft(args) -> dict:
    if args.draft:
        path = args.draft if os.path.isabs(args.draft) else os.path.join(ROOT, args.draft)
    else:
        path = os.path.join(ROOT, "content/test-packs/drafts", f"{args.testId}.json")
    if not os.path.exists(path):
        sys.exit(f"draft not found: {path}")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(description="범용 결과 이미지 제너레이터")
    parser.add_argument("--testId", help="draft testId (drafts/<testId>.json)")
    parser.add_argument("--draft", help="draft 파일 경로 직접 지정")
    parser.add_argument("--packId", default=None, help="기본값: draft.packId 또는 generated-v1")
    args = parser.parse_args()
    if not args.testId and not args.draft:
        sys.exit("usage: gen-result-images.py --testId=<testId>")

    draft = load_draft(args)
    test = draft.get("test", {})
    test_id = test.get("id") or args.testId
    pack_id = args.packId or draft.get("packId") or "generated-v1"
    results = test.get("results", [])
    if not results:
        sys.exit(f"draft has no results: {test_id}")

    out_dir = os.path.join(ROOT, "content/test-packs/packs", pack_id, "assets", test_id)
    os.makedirs(out_dir, exist_ok=True)

    total = len(results)
    for index, result in enumerate(results):
        code = result["code"]
        palette = build_palette(test_id, code, index, total)
        main_img = make_image(test_id, code, palette, MAIN_SIZE)
        main_path = os.path.join(out_dir, f"{code}.png")
        main_img.save(main_path, "PNG")
        share_img = make_image(test_id, code, palette, SHARE_SIZE)
        share_path = os.path.join(out_dir, f"{code}-share.png")
        share_img.save(share_path, "PNG")
        print(f"  {code}.png {os.path.getsize(main_path):,}B  "
              f"{code}-share.png {os.path.getsize(share_path):,}B")

    print(f"Done. {total} results -> {os.path.relpath(out_dir, ROOT)}")


if __name__ == "__main__":
    main()
