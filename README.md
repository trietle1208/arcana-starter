# Arcana — starter kit

Bộ khởi đầu để code Arcana bằng Claude Code trong VS Code.

| Thư mục / file | Nội dung |
| --- | --- |
| `CLAUDE.md` | Luật dự án Claude Code tự đọc mỗi phiên: stack, kiến trúc, quy tắc UI, quy trình, ngôn ngữ trả lời |
| `docs/TECH_DESIGN.md` | Tài liệu kỹ thuật (kiến trúc, schema, reading engine, test, roadmap) |
| `docs/PROMPTS.md` | Prompt cho từng phase, dán lần lượt vào Claude Code |
| `design-system/README.md` | Brand book: màu, chữ, chuyển động, giọng văn, màn hình |
| `design-system/tokens.css`, `tokens.json` | Design tokens |
| `design-system/components/` | `bundle.js` + `bundle.css` (bản tham chiếu chạy được của 23 component), `index.d.ts` (props), README cho từng component |
| `design-system/index.html` | Mở bằng trình duyệt để xem preview sống của từng component và 7 màn hình (cần mạng để tải font Google) |
| `design-system/screenshots/` | Ảnh chụp mọi preview và từng bước nghi thức bốc bài, để Claude so sánh |
| `assets/cards/` | 78 lá Rider–Waite–Smith (WebP 284×511), Phase 0 sẽ copy vào `public/cards/` |

## Bắt đầu

1. Cài Node.js 24 LTS, Git, pnpm (`corepack enable`), VS Code và extension **Claude Code** (đăng nhập bằng tài khoản Claude).
2. Giải nén vào một thư mục trống, ví dụ `D:\Projects\arcana`, rồi:
   ```bash
   git init && git add -A && git commit -m "chore: add starter kit"
   ```
3. Mở thư mục bằng VS Code → mở panel Claude Code → dán **Prompt 0** trong `docs/PROMPTS.md`.
4. Trả lời các câu hỏi của Claude, sau đó dán prompt **Phase 0**. Duyệt kế hoạch → Claude code → bạn xem diff, chạy `pnpm dev` → commit.
5. Lặp lại với Phase 1 → 5. Prompt **Content** dùng để viết nội dung 56 lá minor arcana, mỗi lần một bộ.

Windows: nếu `pnpm install` báo lỗi build `better-sqlite3` (Phase 3), cài "Visual Studio Build Tools" với workload "Desktop development with C++" và giữ Node ở bản LTS.
