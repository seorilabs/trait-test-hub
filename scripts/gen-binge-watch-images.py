#!/usr/bin/env python3
"""Generate PNG images for binge-watch-style test results using pure Python."""
import struct
import zlib
import math
import os

TEST_ID = "binge-watch-style"
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
# storm-binger: 강렬한 빨강·주황 + 방사형 에너지 폭발 패턴 (몰입·열기)
# -------------------------------------------------------------------
def storm_binger_pixel(x, y, w, h):
    tx = x / w
    ty = y / h
    t = tx * 0.4 + ty * 0.6
    bg = blend((100, 10, 5), (200, 55, 10), t)

    cx, cy = w // 2, h // 2
    dx, dy = x - cx, y - cy
    dist = math.sqrt(dx * dx + dy * dy)
    angle = math.atan2(dy, dx) if (dx or dy) else 0

    # 방사형 광선
    ray_count = 18
    ray_angle = (angle % (2 * math.pi / ray_count)) / (2 * math.pi / ray_count)
    if ray_angle < 0.25:
        ray_strength = clamp(1.0 - dist / (min(w, h) * 0.55), 0, 1)
        bg = blend(bg, (255, 180, 30), ray_strength * 0.60)

    # 중앙 코어 글로우
    if dist < min(w, h) * 0.16:
        inner_t = 1.0 - dist / (min(w, h) * 0.16)
        return blend((220, 60, 10), (255, 230, 80), inner_t * inner_t)

    # 동심원 링
    ring = dist % 55
    if ring < 4:
        fade = clamp(1.0 - dist / (min(w, h) * 0.70), 0, 1)
        bg = blend(bg, (255, 120, 20), fade * 0.40)

    # 대각선 섬광
    diag = abs((x - cx) - (y - cy))
    if diag < 5 and dist < min(w, h) * 0.45:
        bg = blend(bg, (255, 240, 100), 0.55)

    return bg


# -------------------------------------------------------------------
# slow-savorer: 차분한 청록·딥블루 + 물결·음표 패턴 (깊이·음미)
# -------------------------------------------------------------------
def slow_savorer_pixel(x, y, w, h):
    tx = x / w
    ty = y / h
    t = tx * 0.35 + ty * 0.65
    bg = blend((5, 30, 80), (15, 80, 140), t)

    # 잔잔한 수평 파동
    wave1 = math.sin(x / 60.0 + ty * 4.0) * 0.5 + 0.5
    wave2 = math.sin(x / 90.0 - ty * 3.0 + 1.2) * 0.5 + 0.5
    wave = (wave1 + wave2) / 2.0
    if wave > 0.55:
        strength = (wave - 0.55) / 0.45
        bg = blend(bg, (60, 180, 240), strength * 0.45)

    # 중앙 부드러운 글로우
    cx, cy = w // 2, h // 2
    dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    glow_r = min(w, h) * 0.35
    if dist < glow_r:
        glow_t = clamp(1.0 - dist / glow_r, 0, 1)
        bg = blend(bg, (100, 200, 255), glow_t * glow_t * 0.45)

    # 음표 모양 점들 (구분점 패턴)
    mx = x % 100
    my = y % 80
    note_cx, note_cy = 50, 40
    ndist = math.sqrt((mx - note_cx) ** 2 + (my - note_cy) ** 2)
    if ndist < 8:
        return blend(bg, (200, 240, 255), (1.0 - ndist / 8) * 0.70)

    # 수직 줄무늬 (부드러운 조율)
    vert = math.sin(x / 35.0) * 0.5 + 0.5
    if vert > 0.80:
        bg = blend(bg, (40, 130, 200), 0.25)

    return bg


# -------------------------------------------------------------------
# speed-skipper: 밝은 노랑·라임 + 화살표·대각선 패턴 (속도·효율)
# -------------------------------------------------------------------
def speed_skipper_pixel(x, y, w, h):
    ty = y / h
    bg = blend((15, 55, 10), (40, 110, 20), ty)

    # 좌→우 방향 사선 줄무늬 (속도감)
    diagonal = (x + y * 2) % 80
    if diagonal < 10:
        strength = 1.0 - abs(diagonal - 5) / 5
        bg = blend(bg, (180, 255, 40), strength * 0.60)

    # 중앙 삼각형 화살표 모양
    cx, cy = w // 2, h // 2
    dx = x - cx
    dy = y - cy
    # 오른쪽 방향 삼각형: dx > 0 이고 |dy| < dx * 0.5
    if dx > 0 and abs(dy) < dx * 0.50 and dx < min(w, h) * 0.28:
        inner_t = clamp(1.0 - dx / (min(w, h) * 0.28), 0, 1)
        return blend((120, 230, 20), (230, 255, 80), inner_t)

    # 왼쪽 보조 화살표 (작게)
    dx2 = x - (cx - w // 5)
    dy2 = y - cy
    if dx2 > 0 and abs(dy2) < dx2 * 0.45 and dx2 < min(w, h) * 0.18:
        inner_t = clamp(1.0 - dx2 / (min(w, h) * 0.18), 0, 1)
        return blend((80, 180, 20), (180, 240, 60), inner_t * 0.75)

    # 수평 빠른 라인
    if (y % 50) < 3:
        bg = blend(bg, (140, 255, 40), 0.45)

    return bg


# -------------------------------------------------------------------
# ambient-viewer: 소프트 라벤더·보라 + 별·구름 패턴 (편안·배경)
# -------------------------------------------------------------------
def ambient_viewer_pixel(x, y, w, h):
    tx = x / w
    ty = y / h
    t = tx * 0.30 + ty * 0.70
    bg = blend((35, 15, 65), (80, 40, 130), t)

    # 부드러운 구름 같은 블롭
    blob1_x, blob1_y = w * 0.30, h * 0.40
    blob2_x, blob2_y = w * 0.70, h * 0.55
    blob3_x, blob3_y = w * 0.50, h * 0.25

    for bx, by, radius in [
        (blob1_x, blob1_y, min(w, h) * 0.22),
        (blob2_x, blob2_y, min(w, h) * 0.18),
        (blob3_x, blob3_y, min(w, h) * 0.15),
    ]:
        bdist = math.sqrt((x - bx) ** 2 + (y - by) ** 2)
        if bdist < radius:
            blob_t = clamp(1.0 - bdist / radius, 0, 1)
            bg = blend(bg, (170, 120, 255), blob_t * blob_t * 0.45)

    # 작은 별 패턴
    sx = x % 75
    sy = y % 65
    star_dist = math.sqrt((sx - 37) ** 2 + (sy - 32) ** 2)
    if star_dist < 4:
        return blend(bg, (240, 220, 255), (1.0 - star_dist / 4) * 0.85)

    # 부드러운 가로 그라데이션 웨이브
    wave = math.sin(x / 80.0 + ty * 2.5) * 0.5 + 0.5
    if wave > 0.72:
        bg = blend(bg, (200, 160, 255), (wave - 0.72) / 0.28 * 0.35)

    return bg


PIXEL_FNS = {
    "storm-binger": storm_binger_pixel,
    "slow-savorer": slow_savorer_pixel,
    "speed-skipper": speed_skipper_pixel,
    "ambient-viewer": ambient_viewer_pixel,
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
