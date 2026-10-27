# Huskie Roundtable

An independent, student-built guide to resources and opportunities at East Los Angeles College. Designed in huskie green, with a responsive layout and no account requirement.

## Features

- Searchable directory of 43 resources in eight need-based categories.
- Access notes distinguish free services, eligibility-limited support, and services with potential fees.
- Category, access type, online access, saved-resource, and alphabetical filters.
- Browser-local bookmarks, resource detail dialogs, source links, and contact actions.
- Shareable search/filter URLs, keyboard support, reduced-motion support, and mobile layouts.
- No backend, analytics, student applications, accounts, or build dependencies.

## Preview

Run `python3 -m http.server 4173` from this folder, then open http://localhost:4173.

## Publish on GitHub Pages

In this repository’s **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/(root)**, and save. The website uses relative file paths so it works under a GitHub Pages project URL.

Expected project URL after GitHub Pages deployment: https://zcheng31.github.io/huskie-roundtable/

## Updating the directory

Edit `resources.js`. Each resource has a stable ID, category, description, access type, eligibility explanation, official source URL, and next steps. Preserve stable IDs so existing saved lists continue to work. `index.html` contains the presentation and FAQ; `styles.css` controls the design; `app.js` handles search, filters, saves, and dialogs.

Official pages and ELAC library guides were researched October 27, 2026. Hours and dated events are intentionally linked to their official pages rather than copied into a calendar. No service availability or awards are guaranteed. Recheck official sources before updating claims; do not label health care, childcare, paid courses, club dues, printing, or housing as universally free.

This growing directory is not an official ELAC or LACCD website and does not claim to include every service. Suggestions and corrections can be submitted using the resource update issue form. Do not post student IDs or private records in issues.

## Privacy

Saved resource IDs stay in the visitor’s local browser storage. No bookmarks are sent to the repository or synced across devices. Google Fonts may be requested for typography; external resource websites have their own privacy practices. Device restrictions or private browsing may prevent persistent saves.
