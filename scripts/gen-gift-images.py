"""
선물 고르는 스타일 테스트 (gift-selection-style) 결과 이미지 생성 스크립트.
PIL로 결과별 팔레트가 다른 추상 그래픽을 생성합니다.
"""
import os
import math
from PIL import Image, ImageDraw

OUTPUT_DIR = "content/test-packs/packs/generated-v1/assets/gift-selection-style"
MAIN_SIZE = (960, 640)
SHARE_SIZE = (1200, 630)

# 결과별 팔레트
RESULTS = {
    "instinct-picker": {
        "bg": "#FFF3E0",
        "primary": "#FF6D00",
        "secondary": "#FFB300",
        "accent": "#FF8F00",
        "highlight": "#FFF8E1",
        "shape_color": "#FFCC80",
    },
    "warm-memory-type": {
        "bg": "#FCE4EC",
        "primary": "#E91E63",
        "secondary": "#F48FB1",
        "accent": "#AD1457",
        "highlight": "#FFF0F5",
        "shape_color": "#F8BBD0",
    },
    "curated-practical": {
        "bg": "#E3F2FD",
        "primary": "#1565C0",
        "secondary": "#42A5F5",
        "accent": "#0D47A1",
        "highlight": "#F0F8FF",
        "shape_color": "#90CAF9",
    },
    "detail-researcher": {
        "bg": "#E8F5E9",
        "primary": "#2E7D32",
        "secondary": "#66BB6A",
        "accent": "#1B5E20",
        "highlight": "#F1F8F2",
        "shape_color": "#A5D6A7",
    },
}


def hex_to_rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def draw_gift_box(draw, cx, cy, size, color_primary, color_secondary, color_accent):
    """선물 상자 추상 아이콘을 그립니다."""
    half = size // 2
    third = size // 3
    sixth = size // 6

    # 상자 본체
    box_rect = [cx - half, cy - third, cx + half, cy + third]
    draw.rectangle(box_rect, fill=color_primary, outline=color_accent, width=3)

    # 상자 뚜껑
    lid_rect = [cx - half - 4, cy - third - sixth, cx + half + 4, cy - third + 4]
    draw.rectangle(lid_rect, fill=color_secondary, outline=color_accent, width=3)

    # 리본 세로
    ribbon_x1 = cx - sixth // 2
    ribbon_x2 = cx + sixth // 2
    draw.rectangle(
        [ribbon_x1, cy - third - sixth - 4, ribbon_x2, cy + third],
        fill=color_accent,
    )

    # 리본 가로
    ribbon_y1 = cy - third - sixth // 3
    ribbon_y2 = cy - third + sixth // 3
    draw.rectangle(
        [cx - half - 4, ribbon_y1, cx + half + 4, ribbon_y2],
        fill=color_accent,
    )

    # 리본 매듭 원
    knot_r = sixth // 2
    draw.ellipse(
        [cx - knot_r, cy - third - sixth - knot_r, cx + knot_r, cy - third - sixth + knot_r],
        fill=color_accent,
        outline=color_primary,
        width=2,
    )


def draw_sparkles(draw, cx, cy, radius, color, count=6):
    """별 모양 반짝임 포인트를 그립니다."""
    for i in range(count):
        angle = math.radians(i * 360 / count)
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        r = 6
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)
        # 작은 선
        x2 = cx + (radius + 14) * math.cos(angle)
        y2 = cy + (radius + 14) * math.sin(angle)
        draw.line([x, y, x2, y2], fill=color, width=2)


def draw_circles_bg(draw, w, h, color_shape, alpha_step=60):
    """배경 장식 원을 여러 개 그립니다."""
    positions = [
        (w * 0.08, h * 0.12, 80),
        (w * 0.92, h * 0.88, 100),
        (w * 0.15, h * 0.80, 60),
        (w * 0.85, h * 0.15, 70),
        (w * 0.50, h * 0.06, 45),
        (w * 0.50, h * 0.94, 50),
    ]
    r, g, b = hex_to_rgb(color_shape)
    for px, py, pr in positions:
        fill = (r, g, b, 80)
        overlay = Image.new("RGBA", (int(pr * 2 + 2), int(pr * 2 + 2)), (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)
        odraw.ellipse([0, 0, pr * 2, pr * 2], fill=fill)
        draw._image.paste(overlay, (int(px - pr), int(py - pr)), overlay)


def make_image(result_code: str, palette: dict, size: tuple, is_share: bool) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", (w, h), hex_to_rgb(palette["bg"]) + (255,))
    draw = ImageDraw.Draw(img, "RGBA")

    # 배경 원 장식
    draw_circles_bg(draw, w, h, palette["shape_color"])

    # 메인 선물 박스
    cx, cy = w // 2, h // 2
    box_size = min(w, h) // 3
    draw_gift_box(
        draw,
        cx,
        cy,
        box_size,
        color_primary=palette["primary"],
        color_secondary=palette["secondary"],
        color_accent=palette["accent"],
    )

    # 반짝임 포인트
    sparkle_radius = box_size * 0.85
    draw_sparkles(draw, cx, cy, int(sparkle_radius), palette["accent"], count=8)

    # 상단 장식 선
    for i in range(3):
        y_offset = 18 + i * 10
        alpha = 180 - i * 40
        r, g, b = hex_to_rgb(palette["secondary"])
        draw.rectangle([40, y_offset, w - 40, y_offset + 3], fill=(r, g, b, alpha))

    # 하단 장식 선
    for i in range(3):
        y_offset = h - 18 - i * 10
        alpha = 180 - i * 40
        r, g, b = hex_to_rgb(palette["secondary"])
        draw.rectangle([40, y_offset - 3, w - 40, y_offset], fill=(r, g, b, alpha))

    return img.convert("RGB")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for code, palette in RESULTS.items():
        # 대표 이미지 960×640
        img_main = make_image(code, palette, MAIN_SIZE, is_share=False)
        path_main = os.path.join(OUTPUT_DIR, f"{code}.png")
        img_main.save(path_main, "PNG")
        size_main = os.path.getsize(path_main)
        print(f"  {code}.png  {size_main:,}B")

        # 공유 이미지 1200×630
        img_share = make_image(code, palette, SHARE_SIZE, is_share=True)
        path_share = os.path.join(OUTPUT_DIR, f"{code}-share.png")
        img_share.save(path_share, "PNG")
        size_share = os.path.getsize(path_share)
        print(f"  {code}-share.png  {size_share:,}B")

    print("Done.")


if __name__ == "__main__":
    main()
