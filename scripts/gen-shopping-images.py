#!/usr/bin/env python3
"""Generate PNG images for shopping-decision-style test results using pure Python."""
import struct
import zlib
import math
import os

TEST_ID = "shopping-decision-style"
OUT_DIR = f"content/test-packs/packs/generated-v1/assets/{TEST_ID}"


def create_png(width, height, pixel_fn):
    def chunk(name, data):
        c = name + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    signature = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    ihdr = chunk(b"IHDR", ihdr_data)

    rows = []
    for y in range(height):
        row = b"\x00"  # filter byte: None
        for x in range(width):
            r, g, b = pixel_fn(x, y, width, height)
            row += bytes([max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))])
        rows.append(row)

    raw = b"".join(rows)
    compressed = zlib.compress(raw, 6)
    idat = chunk(b"IDAT", compressed)
    iend = chunk(b"IEND", b"")

    return signature + ihdr + idat + iend


def lerp(a, b, t):
    return int(a + (b - a) * clamp(t, 0, 1))


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def blend(c1, c2, t):
    return (lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t))


# -------------------------------------------------------------------
# spec-hunter: 진한 네이비 + 격자 분석 패턴 (분석적·신뢰감)
# -------------------------------------------------------------------
def spec_hunter_pixel(x, y, w, h):
    tx = x / w
    ty = y / h
    t = tx * 0.55 + ty * 0.45
    bg = blend((10, 18, 72), (38, 68, 148), t)

    # 수평·수직 격자선
    gx = (x % 56) < 2
    gy = (y % 56) < 2
    if gx or gy:
        return blend(bg, (70, 110, 240), 0.55)

    # 중앙 다이아몬드
    cx, cy = w // 2, h // 2
    dx = abs(x - cx) / (w * 0.17)
    dy = abs(y - cy) / (h * 0.22)
    if dx + dy < 1.0:
        inner_t = 1.0 - (dx + dy)
        return blend((28, 50, 130), (90, 150, 255), inner_t * inner_t)

    # 대각선 강조선
    diag = (x + y) % 120
    if diag < 3:
        return blend(bg, (60, 100, 200), 0.35)

    return bg


# -------------------------------------------------------------------
# review-sleuth: 호박색·앰버 + 동심원 (탐정·수집)
# -------------------------------------------------------------------
def review_sleuth_pixel(x, y, w, h):
    tx = x / w
    ty = y / h
    t = tx * 0.45 + ty * 0.55
    bg = blend((90, 35, 5), (190, 100, 15), t)

    cx, cy = w // 2, h // 2
    dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    ring_idx = int(dist / 45)

    # 동심원 링
    if ring_idx % 2 == 0:
        brightness = clamp(1.0 - dist / (max(w, h) * 0.7), 0, 1)
        bg = blend(bg, (245, 160, 25), brightness * 0.30)

    # 중앙 원
    if dist < min(w, h) * 0.18:
        inner_t = 1.0 - dist / (min(w, h) * 0.18)
        return blend((160, 80, 10), (255, 200, 60), inner_t)

    # 확대경 렌즈 테두리 느낌
    if abs(dist - min(w, h) * 0.22) < 4:
        return blend(bg, (255, 180, 40), 0.70)

    return bg


# -------------------------------------------------------------------
# flash-buyer: 전기 라임그린 + 방사형 번개 (즉흥·에너지)
# -------------------------------------------------------------------
def flash_buyer_pixel(x, y, w, h):
    ty = y / h
    bg = blend((8, 52, 12), (22, 88, 22), ty)

    cx, cy = w // 2, h // 2
    dx, dy = x - cx, y - cy
    angle = math.atan2(dy, dx) if (dx or dy) else 0
    dist = math.sqrt(dx ** 2 + dy ** 2)
    max_r = min(w, h) * 0.48

    # 방사형 세그먼트
    seg = int((angle + math.pi) * 12 / (2 * math.pi)) % 2
    if dist < max_r and seg == 0:
        fade = clamp(1.0 - dist / max_r, 0, 1)
        bg = blend(bg, (140, 255, 20), fade * 0.50)

    # 중앙 코어
    if dist < min(w, h) * 0.12:
        t = 1.0 - dist / (min(w, h) * 0.12)
        return blend((50, 180, 20), (210, 255, 80), t)

    # 가로 줄무늬 액센트
    if (y % 70) < 5:
        return blend(bg, (90, 220, 15), 0.45)

    return bg


# -------------------------------------------------------------------
# vibe-follower: 소프트 라벤더·퍼플 + 웨이브 (감성·취향)
# -------------------------------------------------------------------
def vibe_follower_pixel(x, y, w, h):
    tx = x / w
    ty = y / h
    t = tx * 0.38 + ty * 0.62
    bg = blend((48, 6, 80), (110, 45, 168), t)

    # 겹치는 웨이브
    wave1 = math.sin(x / 75.0 + y / 48.0) * 0.5 + 0.5
    wave2 = math.sin(x / 48.0 - y / 65.0 + 1.8) * 0.5 + 0.5
    wave3 = math.sin(x / 100.0 + y / 90.0 + 0.9) * 0.5 + 0.5
    combined = (wave1 + wave2 + wave3) / 3.0

    if combined > 0.60:
        strength = (combined - 0.60) / 0.40
        bg = blend(bg, (210, 148, 255), strength * 0.55)

    # 중앙 소프트 글로우
    cx, cy = w // 2, h // 2
    dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    glow_r = min(w, h) * 0.32
    if dist < glow_r:
        glow_t = clamp(1.0 - dist / glow_r, 0, 1)
        bg = blend(bg, (200, 130, 255), glow_t * 0.38)

    return bg


PIXEL_FNS = {
    "spec-hunter": spec_hunter_pixel,
    "review-sleuth": review_sleuth_pixel,
    "flash-buyer": flash_buyer_pixel,
    "vibe-follower": vibe_follower_pixel,
}

os.makedirs(OUT_DIR, exist_ok=True)

for code, fn in PIXEL_FNS.items():
    for w, h, suffix in [(960, 640, ""), (1200, 630, "-share")]:
        data = create_png(w, h, fn)
        path = os.path.join(OUT_DIR, f"{code}{suffix}.png")
        with open(path, "wb") as f:
            f.write(data)
        print(f"  {path}  ({len(data):,} bytes)")

print("Done.")
