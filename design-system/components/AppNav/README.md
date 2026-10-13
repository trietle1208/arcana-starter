# AppNav

The app's main navigation: a `parchment` side rail (232px, `nav-width`) on desktop, a bottom bar on mobile.

- Six destinations in this order: Home, Card library, Reading room, Study, Journal, Settings. On mobile show five (Settings moves to a menu on Home) with one-word labels.
- Active item: `surface` pill with `shadow-paper`, a 3px `terracotta-ink` bar at the edge and a `terracotta-ink` icon — position, fill and colour together. It sets `aria-current="page"`.
- The wordmark is "Arcana" set in Fraunces italic with a terracotta full stop — there is no logo file.
- Plain labels, no submenus, no nested tabs.

Consumer provides: `active` (item id), optional `items` `[{id,label,icon,href,shortLabel}]`, `orientation` (`side` | `bottom`), `onNavigate`.
