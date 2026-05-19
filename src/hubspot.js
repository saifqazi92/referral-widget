// HubSpot form embed — lazy loaded when the drawer first opens.
// The form target lives in the light DOM so HubSpot can find it, then it is slotted into the widget's Shadow DOM.

var HUBSPOT_PORTAL_ID = '8648061';
var HUBSPOT_FORM_ID = '7225718e-cbfc-46f0-9f11-875958d8f543';
var HUBSPOT_REGION = 'na1';

var HS_SCRIPT_URL = 'https://js.hsforms.net/forms/embed/v2.js';
var hsLoadPromise = null;

function jrwEnsureHubSpotScript() {
  if (window.hbspt && window.hbspt.forms && typeof window.hbspt.forms.create === 'function') {
    return Promise.resolve(window.hbspt);
  }

  if (hsLoadPromise) {
    return hsLoadPromise;
  }

  hsLoadPromise = new Promise(function (resolve, reject) {
    var existingScript = document.querySelector('script[src*="js.hsforms.net/forms/embed/v2.js"]');

    function finishResolve() {
      if (window.hbspt && window.hbspt.forms && typeof window.hbspt.forms.create === 'function') {
        resolve(window.hbspt);
        return true;
      }
      return false;
    }

    if (finishResolve()) {
      return;
    }

    var attempts = 0;
    var maxAttempts = 40;
    var interval = setInterval(function () {
      attempts += 1;

      if (finishResolve()) {
        clearInterval(interval);
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error('HubSpot forms API did not become available.'));
      }
    }, 250);

    if (existingScript) {
      return;
    }

    var script = document.createElement('script');
    script.src = HS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      clearInterval(interval);
      reject(new Error('HubSpot form script failed to load.'));
    };
    document.head.appendChild(script);
  });

  return hsLoadPromise;
}

function jrwLoadHubSpotForm(options) {
  var settings = options || {};
  var target = settings.target;
  var hiddenFields = normalizeHiddenFields(settings.hiddenFields || {});
  var onReady = typeof settings.onReady === 'function' ? settings.onReady : function () {};
  var onSubmitted = typeof settings.onSubmitted === 'function' ? settings.onSubmitted : function () {};
  var onError = typeof settings.onError === 'function' ? settings.onError : function () {};

  if (!target || !target.id) {
    onError(new Error('A target element with an id is required.'));
    return;
  }

  jrwEnsureHubSpotScript().then(function () {
    if (!window.hbspt || !window.hbspt.forms || typeof window.hbspt.forms.create !== 'function') {
      onError(new Error('HubSpot forms API is unavailable.'));
      return;
    }

    target.innerHTML = '';

    var readyHandled = false;
    var submittedHandled = false;
    var restoreUrl = applyHiddenFieldsToPageUrl(hiddenFields);
    var removeV4Handlers = registerHubSpotV4HiddenFieldHandlers(hiddenFields, markReady, markSubmitted);

    function markReady($form) {
      if (readyHandled) {
        return;
      }

      readyHandled = true;
      applyHiddenFields($form, target, hiddenFields);
      window.setTimeout(restoreUrl, 1000);
      onReady(target);
    }

    function markSubmitted($form) {
      if (submittedHandled) {
        return;
      }

      submittedHandled = true;
      applyHiddenFields($form, target, hiddenFields);
      restoreUrl();
      removeV4Handlers();
      onSubmitted(target);
    }

    window.hbspt.forms.create({
      region: HUBSPOT_REGION,
      portalId: HUBSPOT_PORTAL_ID,
      formId: HUBSPOT_FORM_ID,
      target: '#' + target.id,
      onFormReady: function ($form) {
        applyHiddenFields($form, target, hiddenFields);
        window.setTimeout(function () {
          applyHiddenFields($form, target, hiddenFields);
          markReady($form);
        }, 250);
      },
      onBeforeFormSubmit: function ($form, submissionValues) {
        applyHiddenFields($form, target, hiddenFields);
        addHiddenFieldsToSubmissionValues(submissionValues, hiddenFields);
      },
      onFormSubmit: function ($form) {
        applyHiddenFields($form, target, hiddenFields);
      },
      onFormSubmitted: function ($form) {
        markSubmitted($form);
      },
    });

    waitForFormAppearance(target, markReady, onError);
    window.setTimeout(restoreUrl, 4000);
  }).catch(function (error) {
    onError(error);
  });
}

function jrwResetHubSpotForm(options) {
  var settings = options || {};

  if (settings.target) {
    settings.target.innerHTML = '';
  }

  jrwLoadHubSpotForm(settings);
}

function waitForFormAppearance(target, onReady, onError) {
  var attempts = 0;
  var maxAttempts = 40;
  var interval = setInterval(function () {
    attempts += 1;

    if (target.querySelector('form, iframe')) {
      clearInterval(interval);
      onReady();
      return;
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
      onError(new Error('HubSpot form did not render.'));
    }
  }, 150);
}

function registerHubSpotV4HiddenFieldHandlers(hiddenFields, onReady, onSubmitted) {
  function handleReady(event) {
    if (!isCurrentHubSpotV4FormEvent(event)) {
      return;
    }

    applyHiddenFieldsToHubSpotV4Event(event, hiddenFields);
    onReady();
  }

  function handleSuccess(event) {
    if (!isCurrentHubSpotV4FormEvent(event)) {
      return;
    }

    applyHiddenFieldsToHubSpotV4Event(event, hiddenFields);
    onSubmitted();
  }

  window.addEventListener('hs-form-event:on-ready', handleReady);
  window.addEventListener('hs-form-event:on-submission:success', handleSuccess);

  return function removeHubSpotV4HiddenFieldHandlers() {
    window.removeEventListener('hs-form-event:on-ready', handleReady);
    window.removeEventListener('hs-form-event:on-submission:success', handleSuccess);
  };
}

function isCurrentHubSpotV4FormEvent(event) {
  var detail = event && event.detail ? event.detail : {};
  return !detail.formId || detail.formId === HUBSPOT_FORM_ID;
}

function applyHiddenFieldsToHubSpotV4Event(event, hiddenFields) {
  var form = getHubSpotV4FormFromEvent(event);

  if (!form) {
    return;
  }

  applyHiddenFieldsToHubSpotV4Form(form, hiddenFields);
}

function getHubSpotV4FormFromEvent(event) {
  if (!window.HubSpotFormsV4 || typeof window.HubSpotFormsV4.getFormFromEvent !== 'function') {
    return null;
  }

  try {
    return window.HubSpotFormsV4.getFormFromEvent(event);
  } catch (error) {
    return null;
  }
}

function applyHiddenFieldsToHubSpotV4Form(form, hiddenFields) {
  if (!form || typeof form.setFieldValue !== 'function') {
    return;
  }

  if (typeof form.getFormFieldValues === 'function') {
    form.getFormFieldValues()
      .then(function (fieldValues) {
        setHubSpotV4HiddenFields(form, hiddenFields, fieldValues);
      })
      .catch(function () {
        setHubSpotV4HiddenFields(form, hiddenFields, []);
      });
    return;
  }

  setHubSpotV4HiddenFields(form, hiddenFields, []);
}

function setHubSpotV4HiddenFields(form, hiddenFields, fieldValues) {
  var names = Object.keys(hiddenFields);
  var index;

  for (index = 0; index < names.length; index += 1) {
    setHubSpotV4HiddenField(form, names[index], hiddenFields[names[index]], fieldValues || []);
  }
}

function setHubSpotV4HiddenField(form, name, value, fieldValues) {
  var matches = resolveHubSpotV4FieldMatches(name, fieldValues);
  var index;

  for (index = 0; index < matches.length; index += 1) {
    try {
      form.setFieldValue(matches[index].name, getHubSpotV4FieldValue(matches[index].value, value));
    } catch (error) {
      // Ignore fields that the current HubSpot form instance does not expose.
    }
  }
}

function resolveHubSpotV4FieldMatches(name, fieldValues) {
  var matches = [];
  var seen = {};
  var index;
  var field;
  var candidateNames = [
    name,
    '0-1/' + name,
  ];

  for (index = 0; index < fieldValues.length; index += 1) {
    field = fieldValues[index];

    if (!field || !field.name) {
      continue;
    }

    if (field.name === name || field.name.slice(-1 * (name.length + 1)) === '/' + name) {
      addHubSpotV4FieldMatch(matches, seen, field.name, field.value);
    }
  }

  for (index = 0; index < candidateNames.length; index += 1) {
    addHubSpotV4FieldMatch(matches, seen, candidateNames[index], '');
  }

  return matches;
}

function addHubSpotV4FieldMatch(matches, seen, name, value) {
  if (seen[name]) {
    return;
  }

  seen[name] = true;
  matches.push({
    name: name,
    value: value,
  });
}

function getHubSpotV4FieldValue(currentValue, value) {
  if (Array.isArray(currentValue)) {
    return value ? [value] : [];
  }

  return value || '';
}

function normalizeHiddenFields(hiddenFields) {
  return {
    referrer_user_id: hiddenFields.referrer_user_id || '',
    referrer_email: hiddenFields.referrer_email || '',
    referrer_phone_number: hiddenFields.referrer_phone_number || '',
    referrer_kitchen_id: hiddenFields.referrer_kitchen_id || '',
    referrer_kitchen_name: hiddenFields.referrer_kitchen_name || '',
  };
}

function applyHiddenFields($form, target, hiddenFields) {
  var form = getHubSpotFormElement($form, target);
  var names = Object.keys(hiddenFields);
  var index;

  if (!form) {
    return;
  }

  for (index = 0; index < names.length; index += 1) {
    setHiddenInputValue(form, names[index], hiddenFields[names[index]]);
  }
}

function getHubSpotFormElement($form, target) {
  if ($form && $form.nodeType === 1) {
    return $form;
  }

  if ($form && $form[0] && $form[0].nodeType === 1) {
    return $form[0];
  }

  if (target) {
    return target.querySelector('form');
  }

  return null;
}

function setHiddenInputValue(form, name, value) {
  var input = form.querySelector('[name="' + name + '"]');
  var eventOptions = { bubbles: true };

  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    form.appendChild(input);
  }

  input.value = value || '';
  input.dispatchEvent(new Event('input', eventOptions));
  input.dispatchEvent(new Event('change', eventOptions));
}

function addHiddenFieldsToSubmissionValues(submissionValues, hiddenFields) {
  var names;
  var index;

  if (!Array.isArray(submissionValues)) {
    return;
  }

  names = Object.keys(hiddenFields);

  for (index = 0; index < names.length; index += 1) {
    upsertSubmissionValue(submissionValues, names[index], hiddenFields[names[index]]);
  }
}

function upsertSubmissionValue(submissionValues, name, value) {
  var index;

  for (index = 0; index < submissionValues.length; index += 1) {
    if (submissionValues[index] && submissionValues[index].name === name) {
      submissionValues[index].value = value || '';
      return;
    }
  }

  submissionValues.push({
    name: name,
    value: value || '',
  });
}

function applyHiddenFieldsToPageUrl(hiddenFields) {
  var originalUrl;
  var url;
  var names;
  var index;

  if (!window.history || typeof window.history.replaceState !== 'function' || typeof URL !== 'function') {
    return function noop() {};
  }

  try {
    originalUrl = window.location.href;
    url = new URL(originalUrl);
    names = Object.keys(hiddenFields);

    for (index = 0; index < names.length; index += 1) {
      if (hiddenFields[names[index]]) {
        url.searchParams.set(names[index], hiddenFields[names[index]]);
      }
    }

    if (url.href !== originalUrl) {
      window.history.replaceState(window.history.state, document.title, url.href);
    }

    return function restorePageUrl() {
      if (window.location.href !== originalUrl) {
        window.history.replaceState(window.history.state, document.title, originalUrl);
      }
    };
  } catch (error) {
    return function noop() {};
  }
}
