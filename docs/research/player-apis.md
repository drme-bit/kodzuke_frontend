# Kodik and Alloha player API findings

Verified 14 October 2026 against the providers' delivered player JavaScript. Public search did not locate a reliable first-party prose manual for either provider. These findings describe the inspected versions, not a promise about future versions.

## Kodik

Source: [first-party player bundle](https://kodikplayer.com/assets/js/app.player_single.9abf69e8fcd08ec00343f70a42b529a07f728312fe4d74d23d8932a7b288d67f.js).

Send an **object**, not a JSON string:

```js
iframe.contentWindow.postMessage({
  key: 'kodik_player_api',
  value: { method: 'play' }
}, new URL(iframe.src).origin);
```

The complete incoming command switch supports:

| Method | Additional fields in value |
|---|---|
| play / pause | none |
| seek | seconds: number |
| volume | volume: number, 0–1 |
| speed | speed: number, 0.25–2 |
| mute / unmute | none |
| enter_pip / exit_pip | none |
| get_time | none; responds with key kodik_player_time |

A play command can initialize the player if it has not loaded yet. Events include kodik_player_play, kodik_player_pause, kodik_player_time_update, kodik_player_seek, kodik_player_video_ended, volume/speed changes and advert events. Incoming messages should be checked against the iframe window and expected provider origin.

**No quality-selection or hide-controls command exists in this inspected switch.** Internal quality dropdowns exist, but the parent iframe API does not expose them. No supported URL option for hiding all controls was verified. The bundle obtains video links internally; that does not establish a documented direct-stream API or permission to replace its entire player.

## Alloha

Source: [first-party player bundle](https://alloha.yani.tv/build/app.2e840eb6.js). The string table decoder and complete message handler were inspected; the player itself was not executed.

Send a **JSON string**, using `api`, not `event` or `method`:

```js
iframe.contentWindow.postMessage(JSON.stringify({ api: 'play' }), new URL(iframe.src).origin);
```

| api | Additional fields |
|---|---|
| play / pause | none |
| seek | value: seconds; zero is ignored by a truthiness check |
| duration | responds with JSON {event: 'duration', time: duration} |
| getTimeSave | responds with saved-time info/status |

The message listener is installed only after player ready. Early commands can therefore be lost. Outgoing JSON messages have `{event, time}` for play, pause, seek, timeupdate, enterfullscreen and exitfullscreen.

**No volume, quality, or hide-controls command exists in this inspected switch.** The presence of internal CSS classes such as allplay--hide-controls is not a parent-page API. No first-party documented direct-stream endpoint was verified.

## Implementation consequence

Own play/pause and supported seek/volume controls are feasible through provider-specific adapters. A completely custom skin with native provider controls removed is **not verified as supported**. Keep built-in quality/settings accessible and position the site's episode list away from them until a provider-supported hidden-controls mode or authorized direct streams are supplied.

A parent page cannot read or restyle a cross-origin iframe's DOM. See [MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for the supported cross-origin communication mechanism. A blocked iframe or its blocked script cannot be repaired merely by changing the command envelope; playback success should be confirmed by provider events rather than by the click alone.
