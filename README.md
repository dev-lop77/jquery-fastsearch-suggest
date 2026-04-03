# fastsearch-suggest

A lightweight jQuery autocomplete / type-ahead plugin. Clean, modern look with no external dependencies beyond jQuery.

**Version:** 0.2.0

---

## Features

- Ghost-text completion inside the input (Tab or → to accept)
- Dropdown with keyboard navigation when 2 or more suggestions are found
- Three data-source modes: inline array, remote JSON file, live AJAX
- Configurable minimum characters, max suggestions, and debounce delay
- Separate CSS file for easy customisation
- Zero external runtime dependencies (jQuery only)

---

## Installation

Include jQuery, then the plugin files:

```html
<link rel="stylesheet" href="dist/jquery.fastsearch-suggest.css">
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="dist/jquery.fastsearch-suggest.min.js"></script>
```

---

## Usage

### Inline data array

```js
$('#my-input').fastsearchSuggest({
  data: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
  minChars: 2,
  maxSuggestions: 5
});
```

Suggestions are filtered with a **case-insensitive prefix match** on every keystroke.

### Remote JSON file (fetched once at init)

```js
$('#my-input').fastsearchSuggest({
  dataUrl: '/data/words.json'   // must return a JSON string array
});
```

The file is fetched once when the plugin initialises and then filtered locally like the inline array.

### Live AJAX endpoint

```js
$('#my-input').fastsearchSuggest({
  url:   '/api/suggest',  // your endpoint
  param: 'q',             // query parameter name (default: 'q')
  debounce: 300           // ms to wait after last keystroke (default: 300)
});
```

The endpoint receives a GET request like `/api/suggest?q=typed` and must respond with a JSON string array, e.g. `["apple", "apricot"]`.

---

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string\|null` | `null` | AJAX endpoint URL |
| `param` | `string` | `'q'` | Query parameter name sent to the AJAX endpoint |
| `data` | `string[]\|null` | `null` | Pre-loaded string array for local filtering |
| `dataUrl` | `string\|null` | `null` | URL of a JSON file to fetch once at init |
| `minChars` | `number` | `2` | Minimum characters before suggestions are triggered |
| `maxSuggestions` | `number` | `5` | Maximum items shown in the dropdown |
| `debounce` | `number` | `300` | AJAX debounce delay in milliseconds |
| `matchLastWord` | `boolean` | `false` | When `true`, suggestions are triggered on the last space-separated word; accepting replaces only that word, preserving the preceding text |
| `onSelect` | `function\|null` | `null` | Callback fired when the user selects a suggestion: `function(value)` |

**Data-source priority:** `data` > `dataUrl` > `url` (AJAX). If more than one is provided, the highest-priority source wins.

---

## Methods

### destroy

Removes all event listeners, the dropdown, and the wrapper element, restoring the original input.

```js
$('#my-input').fastsearchSuggest('destroy');
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab / → | Accept ghost-text suggestion |
| ↑ / ↓ | Navigate the dropdown |
| Enter | Select the highlighted dropdown item (or accept ghost text) |
| Escape | Dismiss the ghost text and close the dropdown |

---

## CSS Classes

Override these in your own stylesheet to theme the plugin:

| Class | Element |
|-------|---------|
| `.fss-wrapper` | `<div>` wrapping the original input |
| `.fss-ghost` | Ghost-text overlay span (light gray type-ahead) |
| `.fss-dropdown` | `<ul>` suggestion list |
| `.fss-item` | `<li>` for each suggestion |
| `.fss-item.fss-active` | Currently keyboard-highlighted item |

---

## Building from Source

```bash
npm install        # install devDependencies
npm run lint       # JSHint on src/
npm run build      # compile src/ → dist/
npm run release    # create a versioned ZIP in release/
```

---

## License

MIT
