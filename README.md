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

## Getting started (Docker)

Arcana runs entirely in containers, so only Docker (with Compose) and pnpm are needed on the host.

```bash
pnpm docker:dev     # dev server with hot reload -> http://localhost:3100
pnpm docker:check   # install + typecheck + lint + unit tests
pnpm docker:e2e     # build, serve and run the Playwright tests
pnpm docker:prod    # production image in the background, restarts automatically
pnpm docker:sh      # a shell inside the dev container
```

- The port is `ARCANA_PORT` (default 3100, because 3000 is often taken). Put it in a `.env` file next to `compose.yaml` to change it.
- Run one-off commands in the container: `docker compose run --rm app pnpm add <package>`. Do not run `pnpm install` on the host.
- If hot reload does not pick up changes, start with `WATCHPACK_POLLING=true pnpm docker:dev`.
- Copy `.env.example` to `.env.local` for app settings (nothing is required).
- Dates in the journal use the time zone of the container, which is UTC unless you say otherwise: put `ARCANA_TZ=Asia/Ho_Chi_Minh` (your own zone) in `.env`.

## Your data

Everything you write (readings, journal entries, settings) lives in one SQLite file, `data/arcana.db`, next to its backups in `data/backups/`. Both are bind-mounted into the containers and gitignored.

- The database is created and brought up to date by `pnpm db:migrate`, which runs before `pnpm dev` and `pnpm start` (and before the production image starts). When a migration is pending it first copies the file to `data/backups/pre-migrate-<time>.db`.
- **Back up:** `pnpm db:backup` writes `data/backups/arcana-<time>.db` (safe while the app runs). Settings → *Export journal* downloads the same data as readable JSON; *Import* adds an export back, leaving entries that are already there as they are.
- **Restore:** stop the app, then `pnpm db:restore data/backups/<file>.db`. The current database is copied to `data/backups/pre-restore-<time>.db` first.
- **Change the schema:** edit `src/server/db/schema.ts`, run `pnpm db:generate --name <what-changed>`, review the SQL in `drizzle/` and commit it. Never use `drizzle-kit push` on a real journal.
- Run the db scripts in the container, like any other: `docker compose run --rm app pnpm db:backup`. Keep a copy of `data/backups/` in a folder you already sync; syncing the live `arcana.db` itself is not recommended.
- The tests never touch `data/`: unit tests use a temp file per test file, and the e2e run builds throw-away databases of its own.
