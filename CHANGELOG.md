# Changelog

## [0.2.1] - 2026-04-03

### Fixed
- `destroy` no longer leaks the document click listener (double `fss-` prefix in namespace was preventing removal)
- `dataUrl` race condition: typed input now queues while the JSON fetch is in-flight and suggestions appear immediately on load
- `dataUrl` fetch failure now clears the pending queue silently instead of leaving it dangling
- AJAX stale-response overwrite: out-of-order responses are discarded via a monotonic sequence counter
- `ArrowRight` now only accepts ghost text when the cursor is at the end of the input

### Changed
- `_getGhost` helper removed; `_clearGhost` inlines the DOM lookup directly
- Duplicated `fss-prefix` reads in `_buildDropdown` and `keydown` handler unified via `_prefix` helper

## [0.2.0] - 2026-04-03

### Added
- `matchLastWord` option (default `false`): when `true`, suggestions are triggered on the last space-separated word in the input; accepting a suggestion replaces only that word while preserving the preceding text

## [0.1.2] - 2026-04-03

### Fixed
- Ghost text overlapping typed text: the ghost span now renders a transparent prefix span (same width as the typed text) followed by the visible gray suffix, eliminating the double-rendering artifact

## [0.1.1] - 2026-04-03

### Fixed
- Backspace not working after accepting a suggestion: replaced `setSelectionRange` ghost-text implementation with an absolutely-positioned `.fss-ghost` overlay span; the input now only contains user-typed text so all native editing (Backspace, Delete, etc.) works normally
- Ghost text is now rendered as light gray (`#9ca3af`) rather than a browser text selection

## [0.1.0] - 2026-04-03

### Added
- Initial release of fastsearch-suggest jQuery plugin
- Ghost-text (type-ahead) completion via `setSelectionRange`; Tab or → to accept
- Dropdown with up to `maxSuggestions` items when 2 or more matches are found
- AJAX data source: debounced GET request with configurable URL and query parameter
- Inline data source: pass a pre-loaded string array via `data` option; case-insensitive prefix match
- Remote JSON data source: fetch a JSON file once at init via `dataUrl` option; then filter locally
- Configurable `minChars` (default 2) before triggering suggestions
- Keyboard navigation in dropdown: ↑/↓ to move, Enter to select, Escape to close
- Click outside to close dropdown
- `destroy` method for clean teardown
- Separate CSS file (`jquery.fastsearch-suggest.css`) for easy customisation
