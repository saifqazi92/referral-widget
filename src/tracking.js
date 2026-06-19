// Lightweight analytics client for the referral widget.
// Sends only funnel metadata to the Cloudflare Pages Function; no PII or form values.

var JRW_WIDGET_VERSION = '2026-06-19-universal-close';
var JRW_TRACKING_SESSION_KEY = 'jrw_tracking_session_id';
var JRW_TRACKING_ENDPOINT_PATH = '/api/referral-events';
var JRW_LAUNCH_CARD_ENDPOINT_PATH = '/api/referral-launch-card-state';
var JRW_TRACKING_SCRIPT_URL = jrwResolveCurrentScriptUrl();
var jrwInMemoryTrackingSessionId = '';

var JRW_TRACKING_ALLOWED_EVENTS = {
  referral_widget_loaded: true,
  referral_widget_visible: true,
  referral_widget_pill_visible: true,
  referral_widget_pill_clicked: true,
  referral_widget_opened: true,
  referral_widget_form_loaded: true,
  referral_widget_submitted: true,
  referral_widget_closed: true,
  referral_widget_form_error: true,
  referral_widget_launch_card_shown: true,
  referral_widget_launch_card_cta_clicked: true,
  referral_widget_launch_card_dismissed: true,
  referral_widget_launch_card_state_error: true,
};

function jrwTrackEvent(eventName, config) {
  var endpoint;
  var payload;

  if (!JRW_TRACKING_ALLOWED_EVENTS[eventName]) {
    return;
  }

  endpoint = jrwGetEndpointForPath(JRW_TRACKING_ENDPOINT_PATH);

  if (!endpoint) {
    return;
  }

  payload = jrwBuildTrackingPayload(eventName, config || {});

  try {
    window.fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(function () {});
  } catch (error) {
    // Tracking must never block or break the referral flow.
  }
}

function jrwBuildTrackingPayload(eventName, config) {
  return {
    event_id: jrwCreateTrackingId(),
    event_name: eventName,
    session_id: jrwGetTrackingSessionId(),
    user_id: jrwString(config.userId),
    kitchen_id: jrwString(config.kitchenId),
    kitchen_name: jrwString(config.kitchenName),
    route: jrwGetTrackingRoute(),
    device: jrwGetTrackingDevice(),
    viewport_width: jrwGetViewportWidth(),
    viewport_height: jrwGetViewportHeight(),
    widget_version: JRW_WIDGET_VERSION,
    script_url: JRW_TRACKING_SCRIPT_URL,
    occurred_at: new Date().toISOString(),
  };
}

function jrwCheckLaunchCardState(config, callback) {
  var endpoint = jrwGetEndpointForPath(JRW_LAUNCH_CARD_ENDPOINT_PATH);
  var payload;

  if (!endpoint || !window.fetch || !config || !config.kitchenId) {
    callback(false, true);
    return;
  }

  payload = {
    action: 'check',
    kitchen_id: jrwString(config.kitchenId),
  };

  try {
    window.fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Launch card state check failed');
        }

        return response.json();
      })
      .then(function (body) {
        callback(!!(body && body.showLaunchCard), false);
      })
      .catch(function () {
        callback(false, true);
      });
  } catch (error) {
    callback(false, true);
  }
}

function jrwDismissLaunchCardState(config, reason, callback) {
  var endpoint = jrwGetEndpointForPath(JRW_LAUNCH_CARD_ENDPOINT_PATH);
  var payload;

  if (!endpoint || !window.fetch || !config || !config.kitchenId) {
    if (typeof callback === 'function') {
      callback(true);
    }
    return;
  }

  payload = {
    action: 'dismiss',
    kitchen_id: jrwString(config.kitchenId),
    kitchen_name: jrwString(config.kitchenName),
    first_user_id: jrwString(config.userId),
    dismissed_reason: reason === 'cta' ? 'cta' : 'close',
    widget_version: JRW_WIDGET_VERSION,
  };

  try {
    window.fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Launch card dismiss failed');
        }

        if (typeof callback === 'function') {
          callback(false);
        }
      })
      .catch(function () {
        if (typeof callback === 'function') {
          callback(true);
        }
      });
  } catch (error) {
    if (typeof callback === 'function') {
      callback(true);
    }
  }
}

function jrwGetEndpointForPath(pathname) {
  var url;

  if (!JRW_TRACKING_SCRIPT_URL) {
    return '';
  }

  try {
    url = new URL(JRW_TRACKING_SCRIPT_URL, window.location.href);
    url.pathname = pathname;
    url.search = '';
    url.hash = '';
    return url.href;
  } catch (error) {
    return '';
  }
}

function jrwResolveCurrentScriptUrl() {
  var script = document.currentScript;
  var scripts;
  var index;

  if (script && script.src) {
    return script.src;
  }

  scripts = document.getElementsByTagName('script');

  for (index = scripts.length - 1; index >= 0; index -= 1) {
    if (scripts[index] && /\/referral\.js(?:[?#].*)?$/.test(scripts[index].src || '')) {
      return scripts[index].src;
    }
  }

  return '';
}

function jrwGetTrackingSessionId() {
  var existing;
  var nextId;

  try {
    existing = window.sessionStorage.getItem(JRW_TRACKING_SESSION_KEY);

    if (existing) {
      return existing;
    }

    nextId = jrwCreateTrackingId();
    window.sessionStorage.setItem(JRW_TRACKING_SESSION_KEY, nextId);
    return nextId;
  } catch (error) {
    if (!jrwInMemoryTrackingSessionId) {
      jrwInMemoryTrackingSessionId = jrwCreateTrackingId();
    }

    return jrwInMemoryTrackingSessionId;
  }
}

function jrwCreateTrackingId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return [
    String(Date.now()),
    Math.random().toString(16).slice(2),
    Math.random().toString(16).slice(2),
  ].join('-');
}

function jrwGetTrackingRoute() {
  var pathname = '/';

  if (window.location && window.location.pathname) {
    pathname = window.location.pathname;
  }

  pathname = pathname.replace(/\/+$/, '');

  return pathname || '/';
}

function jrwGetTrackingDevice() {
  if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
    return 'mobile';
  }

  return 'desktop';
}

function jrwGetViewportWidth() {
  return window.innerWidth || document.documentElement.clientWidth || 0;
}

function jrwGetViewportHeight() {
  return window.innerHeight || document.documentElement.clientHeight || 0;
}

function jrwString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}
