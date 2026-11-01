"""
Demo recording — v3 — Compozy design rebuild.
Viewport: 393x852 CSS pixels at 2x device scale.
"""
from playwright.sync_api import sync_playwright
import time, os, glob, cv2, numpy as np

VIDEO_DIR = "/Users/whitzy/safe-wallet-expo/demo-screens/rec_v3"
OUT_MP4   = "/Users/whitzy/safe-wallet-expo/demo-screens/safe_wallet_demo_v3.mp4"
os.makedirs(VIDEO_DIR, exist_ok=True)

COORDS = {
    "send_btn":     (95,  329),   # approx position of Send button in balance card
    "receive_btn":  (196, 329),
    "back_btn":     (42,  42),
    "tab_wallet":   (65,  828),
    "tab_activity": (196, 828),
    "tab_settings": (327, 828),
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(
        viewport={"width": 393, "height": 852},
        device_scale_factor=2,
        record_video_dir=VIDEO_DIR,
        record_video_size={"width": 393, "height": 852},
    )
    page = ctx.new_page()

    def tap(name):
        x, y = COORDS[name]
        page.mouse.click(x, y)

    def pause(s):
        time.sleep(s)

    # ── Onboarding ─────────────────────────────────────────────────────
    page.goto("http://localhost:8099/onboarding")
    page.get_by_text("Safe Wallet").wait_for(timeout=15000)
    pause(2.5)                               # entrance animations

    # ── Tap Create Wallet — Face ID overlay appears
    page.get_by_text("Create Wallet with Face ID").click()
    pause(0.5)                               # scan starts

    # ── Wait for Face ID animation to complete + navigate to home
    page.get_by_text("Portfolio Value").wait_for(timeout=12000)
    pause(0.4)                               # brief landing

    # ── Wallet Home — let it settle and read balance
    pause(3.0)

    # ── Send screen
    tap("send_btn")
    page.get_by_text("Amount").wait_for(timeout=5000)
    pause(0.8)
    page.mouse.click(196, 295)
    page.keyboard.type("0.05")
    pause(0.5)
    page.mouse.click(196, 410)
    page.keyboard.type("0x3B9A14Fc7E2d8C5F1A0B4D6E8F2C1A7B5D3E9F0C")
    pause(2.0)

    tap("back_btn")
    page.get_by_text("Portfolio Value").wait_for(timeout=6000)
    pause(0.8)

    # ── Receive screen
    tap("receive_btn")
    page.get_by_text("Wallet address").wait_for(timeout=5000)
    pause(3.0)

    tap("back_btn")
    page.get_by_text("Portfolio Value").wait_for(timeout=5000)
    pause(0.6)

    # ── Activity tab
    tap("tab_activity")
    page.get_by_text("Activity").wait_for(timeout=5000)
    pause(3.0)

    # ── Settings tab
    tap("tab_settings")
    page.get_by_text("Settings").wait_for(timeout=5000)
    pause(3.0)

    # ── Back to wallet
    tap("tab_wallet")
    page.get_by_text("Portfolio Value").wait_for(timeout=5000)
    pause(2.0)

    ctx.close()
    browser.close()
    print("Recording done.")

# ── Convert webm → H.264 mp4 ─────────────────────────────────────────
files = glob.glob(VIDEO_DIR + "/*.webm")
if not files:
    print("ERROR: no webm found")
    exit(1)

src = files[0]
print(f"Source: {src} ({os.path.getsize(src)//1024} KB)")

cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS) or 25
w   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"  {w}x{h} @ {fps:.1f}fps")

writer = cv2.VideoWriter(
    OUT_MP4,
    cv2.VideoWriter_fourcc(*"avc1"),
    fps,
    (w, h),
)

skipped = 0
written = 0
while True:
    ok, frame = cap.read()
    if not ok:
        break
    if np.mean(frame) > 245:
        skipped += 1
        continue
    writer.write(frame)
    written += 1

cap.release()
writer.release()

sz = os.path.getsize(OUT_MP4)
print(f"Output: {OUT_MP4}")
print(f"  {written} frames written, {skipped} blank skipped")
print(f"  {sz//1024} KB, {written/fps:.1f}s")
