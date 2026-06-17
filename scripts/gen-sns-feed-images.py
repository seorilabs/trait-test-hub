#!/usr/bin/env python3
"""Generate PNG images for sns-feed-style test results using pure Python stdlib."""

import struct
import zlib
import math
import os

ASSET_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "content/test-packs/packs/generated-v1/assets/sns-feed-style"
)


def write_png(filename, width, height, get_row):
    """Write a valid PNG file. get_row(y) returns list of (R,G,B) tuples."""

    def make_chunk(tag, data):
        body = tag + data
        crc = zlib.crc32(body) & 0xffffffff
        return struct.pack(">I", len(data)) + body + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)

    raw_rows = []
    for y in range(height):
        row = bytearray([0])  # filter type None
        for r, g, b in get_row(y):
            row += bytes([
                max(0, min(255, int(r))),
                max(0, min(255, int(g))),
                max(0, min(255, int(b))),
            ])
        raw_rows.append(bytes(row))

    compressed = zlib.compress(b"".join(raw_rows), 6)

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(make_chunk(b"IHDR", ihdr))
        f.write(make_chunk(b"IDAT", compressed))
        f.write(make_chunk(b"IEND", b""))

    size = os.path.getsize(filename)
    print(f"  {os.path.basename(filename)}: {size:,} bytes")
    assert size >= 2048, f"File too small: {size}"


def blend(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return (c1[0] + (c2[0] - c1[0]) * t,
            c1[1] + (c2[1] - c1[1]) * t,
            c1[2] + (c2[2] - c1[2]) * t)


def clamp_rgb(c):
    return (max(0, min(255, int(c[0]))),
            max(0, min(255, int(c[1]))),
            max(0, min(255, int(c[2]))))


# ──────────────────────────────────────────────────────────────────────────────
# feed-connector  |  Orange/amber  |  Network node motif
# ──────────────────────────────────────────────────────────────────────────────
def make_feed_connector(width, height):
    nodes = [
        (0.20, 0.28), (0.50, 0.18), (0.80, 0.28),
        (0.15, 0.58), (0.50, 0.50), (0.85, 0.58),
        (0.33, 0.80), (0.67, 0.80),
    ]
    edges = [
        (0,1),(1,2),(0,4),(2,4),(3,4),(4,5),
        (4,6),(4,7),(3,6),(5,7),(0,3),(2,5),(6,7),
    ]
    node_r = min(width, height) * 0.042
    line_half = min(width, height) * 0.006

    def get_row(y):
        fy = y / height
        row = []
        for x in range(width):
            fx = x / width
            # diagonal gradient: top-left warm orange → bottom-right amber
            t = fx * 0.4 + fy * 0.6
            base = blend((255, 135, 50), (255, 210, 90), t)

            # edge lines
            on_line = False
            for i, j in edges:
                ax, ay = nodes[i][0] * width, nodes[i][1] * height
                bx, by = nodes[j][0] * width, nodes[j][1] * height
                dx, dy = bx - ax, by - ay
                seg_len2 = dx*dx + dy*dy
                if seg_len2 < 1:
                    continue
                tp = max(0.0, min(1.0, ((x - ax)*dx + (y - ay)*dy) / seg_len2))
                px, py = ax + tp*dx, ay + tp*dy
                dist = math.sqrt((x - px)**2 + (y - py)**2)
                if dist < line_half:
                    on_line = True
                    break

            if on_line:
                base = blend(base, (255, 255, 255), 0.65)

            # node circles
            for nx, ny in nodes:
                dx = x - nx * width
                dy = y - ny * height
                dist = math.sqrt(dx*dx + dy*dy)
                if dist < node_r:
                    t2 = 1.0 - dist / node_r
                    if dist < node_r * 0.55:
                        base = blend(base, (255, 255, 255), 0.92)
                    else:
                        base = blend(base, (255, 255, 255), t2 * 0.6)

            row.append(clamp_rgb(base))
        return row
    return get_row


# ──────────────────────────────────────────────────────────────────────────────
# self-curator  |  Teal/emerald  |  Concentric rectangle frames
# ──────────────────────────────────────────────────────────────────────────────
def make_self_curator(width, height):
    frame_margins = [0.05, 0.13, 0.21, 0.29]
    frame_thick = min(width, height) * 0.006

    def get_row(y):
        fy = y / height
        row = []
        for x in range(width):
            fx = x / width
            t = fx * 0.3 + fy * 0.7
            base = blend((18, 185, 165), (8, 95, 125), t)

            # concentric frames
            brightened = False
            for m in frame_margins:
                mx = m * width
                my = m * height
                ex = (1 - m) * width
                ey = (1 - m) * height
                if mx <= x <= ex and my <= y <= ey:
                    # distance to nearest border
                    dl = abs(x - mx)
                    dr = abs(x - ex)
                    dt = abs(y - my)
                    db = abs(y - ey)
                    d_border = min(dl, dr, dt, db)
                    if d_border < frame_thick:
                        alpha = max(0.0, 1.0 - d_border / frame_thick)
                        base = blend(base, (210, 255, 245), alpha * 0.55)
                        brightened = True
                        break

            # center accent circle
            cx, cy = width * 0.5, height * 0.5
            cr = min(width, height) * 0.09
            dist = math.sqrt((x - cx)**2 + (y - cy)**2)
            if dist < cr:
                base = blend(base, (180, 255, 235), (1 - dist / cr) * 0.75)

            row.append(clamp_rgb(base))
        return row
    return get_row


# ──────────────────────────────────────────────────────────────────────────────
# silent-supporter  |  Purple/lavender  |  Overlapping soft circles
# ──────────────────────────────────────────────────────────────────────────────
def make_silent_supporter(width, height):
    # Circle specs: (cx_ratio, cy_ratio, radius_ratio, brightness)
    circles = [
        (0.50, 0.45, 0.24, 0.30),
        (0.22, 0.38, 0.15, 0.25),
        (0.78, 0.38, 0.15, 0.25),
        (0.35, 0.74, 0.12, 0.20),
        (0.65, 0.74, 0.12, 0.20),
        (0.50, 0.16, 0.10, 0.22),
    ]
    ring_thick_ratio = 0.018

    def get_row(y):
        fy = y / height
        row = []
        for x in range(width):
            fx = x / width
            t = fx * 0.25 + fy * 0.75
            base = blend((190, 130, 235), (100, 55, 165), t)

            for cx, cy, r_r, bright in circles:
                px, py = cx * width, cy * height
                r = r_r * min(width, height)
                ring_thick = ring_thick_ratio * min(width, height)
                dist = math.sqrt((x - px)**2 + (y - py)**2)
                if dist < r:
                    # soft fill
                    fill_alpha = bright * (1 - dist / r) * 0.6
                    base = blend(base, (255, 230, 255), fill_alpha)
                if abs(dist - r) < ring_thick:
                    ring_alpha = (1 - abs(dist - r) / ring_thick) * 0.65
                    base = blend(base, (255, 255, 255), ring_alpha)

            row.append(clamp_rgb(base))
        return row
    return get_row


# ──────────────────────────────────────────────────────────────────────────────
# quiet-observer  |  Dark navy  |  Minimal horizontal lines + lens circle
# ──────────────────────────────────────────────────────────────────────────────
def make_quiet_observer(width, height):
    line_ys = [0.20, 0.35, 0.50, 0.65, 0.80]
    line_half_thick = min(width, height) * 0.004
    lens_r = min(width, height) * 0.22
    lens_thick = min(width, height) * 0.014
    dot_r = min(width, height) * 0.030

    def get_row(y):
        fy = y / height
        row = []
        cx, cy = width * 0.5, height * 0.5
        for x in range(width):
            fx = x / width
            t = fx * 0.3 + fy * 0.7
            base = blend((14, 28, 62), (28, 48, 88), t)

            # horizontal ruled lines
            for ly in line_ys:
                dist_y = abs(y - ly * height)
                if dist_y < line_half_thick:
                    # line shorter at edges
                    half_w = width * (0.42 - abs(fx - 0.5) * 0.25)
                    if abs(x - cx) < half_w:
                        alpha = (1 - dist_y / line_half_thick) * 0.55
                        base = blend(base, (90, 145, 210), alpha)

            # lens ring
            dist = math.sqrt((x - cx)**2 + (y - cy)**2)
            if abs(dist - lens_r) < lens_thick:
                alpha = (1 - abs(dist - lens_r) / lens_thick) * 0.50
                base = blend(base, (80, 140, 205), alpha)

            # center dot
            if dist < dot_r:
                alpha = (1 - dist / dot_r) * 0.75
                base = blend(base, (160, 210, 255), alpha)

            row.append(clamp_rgb(base))
        return row
    return get_row


def generate_all():
    results = [
        ("feed-connector",  make_feed_connector),
        ("self-curator",    make_self_curator),
        ("silent-supporter",make_silent_supporter),
        ("quiet-observer",  make_quiet_observer),
    ]

    sizes = [
        ("", 960, 640),
        ("-share", 1200, 630),
    ]

    for code, maker_fn in results:
        print(f"\n[{code}]")
        for suffix, W, H in sizes:
            fn = os.path.join(ASSET_DIR, f"{code}{suffix}.png")
            get_row = maker_fn(W, H)
            write_png(fn, W, H, get_row)

    print("\nAll images generated successfully.")


if __name__ == "__main__":
    generate_all()
