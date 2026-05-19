// Main widget orchestrator.
// Resolves referrer context from Jelly's Apollo cache.
// Builds the widget inside a Shadow DOM and coordinates HubSpot behaviour.

(function () {
  var HOST_ID = 'jrw-widget-host';
  var MOBILE_SUPPRESS_KEY = 'jrw_mobile_launcher_hidden';
  var MOBILE_LAUNCHER_DELAY_MS = 3000;
  var MOBILE_ALLOWED_PATHS = {
    '/': true,
    '/finance': true,
    '/kitchen': true,
    '/settings': true,
  };
  var MOBILE_ALWAYS_VISIBLE_PATHS = {
    '/settings': true,
  };
  var activeWidgetCleanup = null;
  var activeWidgetTrackVisible = null;
  var routeListenersInstalled = false;

  var SVG_GIFT = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '  <path d="M20 12v10H4V12"></path>',
    '  <path d="M22 7H2v5h20V7z"></path>',
    '  <path d="M12 22V7"></path>',
    '  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>',
    '  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
    '</svg>',
  ].join('');

  var SVG_CLOSE = [
    '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">',
    '  <line x1="1" y1="1" x2="13" y2="13"></line>',
    '  <line x1="13" y1="1" x2="1" y2="13"></line>',
    '</svg>',
  ].join('');

  var SVG_INTRO = [
    '<svg viewBox="0 0 44 44" fill="none" aria-hidden="true">',
    '  <circle cx="16" cy="27" r="5.5" stroke="currentColor" stroke-width="2"></circle>',
    '  <circle cx="29" cy="28" r="5" stroke="currentColor" stroke-width="2"></circle>',
    '  <path d="M7 39c1.4-5 5-8 9-8s7.4 3 8.7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>',
    '  <path d="M22.5 39c1.2-4.2 4.2-6.8 7.5-6.8 3.2 0 6 2.4 7.2 6.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>',
    '  <path d="M13 13l21-7-7.2 20-4.5-8.1L13 13z" fill="#FFFFFF" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>',
    '  <path d="M21.8 17.7L34 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>',
    '  <path d="M9 19h4M11 17v4" stroke="#FF7048" stroke-width="2" stroke-linecap="round"></path>',
    '</svg>',
  ].join('');

  var SVG_ALERT = [
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '  <path d="M10 3.5l7 12H3l7-12z"></path>',
    '  <path d="M10 7.3v3.9"></path>',
    '  <path d="M10 14.1h.01"></path>',
    '</svg>',
  ].join('');

  var SVG_CHECK = [
    '<svg class="jrw-success-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">',
    '  <circle cx="26" cy="26" r="25" fill="#E6F7EF" stroke="#1A9E5C" stroke-width="1.5"></circle>',
    '  <path d="M15 27.5l7 7 15-17" stroke="#1A9E5C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>',
    '</svg>',
  ].join('');

  function init() {
    if (!document.body) {
      return;
    }

    setupRouteChangeListeners();
    syncWidgetForCurrentRoute();
  }

  function syncWidgetForCurrentRoute() {
    if (!shouldShowWidgetOnCurrentRoute()) {
      removeMountedWidget();
      return;
    }

    if (document.getElementById(HOST_ID)) {
      syncMountedWidgetLauncherVisibility();
      return;
    }

    resolveApolloConfigWhenReady(function (initialConfig) {
      if (!shouldShowWidgetOnCurrentRoute() || document.getElementById(HOST_ID)) {
        return;
      }

      if (!hasApolloConfig(initialConfig)) {
        return;
      }

      if (isMobileViewport() && isMobileLauncherSuppressed() && !isMobileAlwaysVisibleRoute()) {
        return;
      }

      mountWidget(initialConfig);
    });
  }

  function mountWidget(initialConfig) {
    var config = initialConfig || emptyConfig();
    var host = document.createElement('div');
    host.id = HOST_ID;

    removeMountedWidget();

    var hubspotTarget = document.createElement('div');
    hubspotTarget.id = 'jrw-hs-target-' + String(Date.now());
    hubspotTarget.slot = 'hubspot';
    hubspotTarget.setAttribute('aria-live', 'polite');
    host.appendChild(hubspotTarget);

    document.body.appendChild(host);
    ensureHubSpotStyles();

    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = [
      '<style>' + JRW_STYLES + '</style>',
      '<div class="jrw-root">',
      '  <div class="jrw-overlay" data-ref="overlay"></div>',
      '  <aside class="jrw-drawer" data-ref="drawer" role="dialog" aria-modal="true" aria-labelledby="jrw-drawer-title">',
      '    <div class="jrw-drawer-panel" data-ref="drawerPanel">',
      '      <div class="jrw-drawer-header">',
      '        <button class="jrw-close-btn" data-ref="closeBtn" aria-label="' + JRW_COPY.ariaCloseDrawer + '">',
      '          ' + SVG_CLOSE,
      '        </button>',
      '      </div>',
      '      <div class="jrw-drawer-body" data-ref="drawerBody">',
      '        <section class="jrw-hero">',
      '          <div class="jrw-hero-copy">',
      '            <h2 class="jrw-drawer-heading" id="jrw-drawer-title">' + JRW_COPY.drawerHeading + '</h2>',
      '            <p class="jrw-drawer-subheading">' + JRW_COPY.drawerSubheading + '</p>',
      '          </div>',
      '        </section>',
      '        <div class="jrw-reward-callout">',
      '          <span class="jrw-reward-icon">' + SVG_INTRO + '</span>',
      '          <p class="jrw-reward-copy"><strong>' + JRW_COPY.rewardDetailHeading + '</strong><span>' + JRW_COPY.rewardDetailBody + '</span></p>',
      '        </div>',
      '        <section class="jrw-form-card">',
      '          <div class="jrw-form-frame" data-ref="formFrame" data-state="loading">',
      '            <div class="jrw-form-status jrw-form-status--loading">',
      '              <span class="jrw-status-icon"><span class="jrw-spinner"></span></span>',
      '              <div class="jrw-status-copy"><strong>' + JRW_COPY.loadingHeading + '</strong><p>' + JRW_COPY.loadingBody + '</p></div>',
      '            </div>',
      '            <div class="jrw-form-status jrw-form-status--error">',
      '              <span class="jrw-status-icon">' + SVG_ALERT + '</span>',
      '              <div class="jrw-status-copy"><strong>' + JRW_COPY.errorHeading + '</strong><p>' + JRW_COPY.errorBody + '</p><button class="jrw-retry-btn" type="button" data-ref="retryBtn">' + JRW_COPY.ctaRetry + '</button></div>',
      '            </div>',
      '            <div class="jrw-form-slot">',
      '              <slot name="hubspot"></slot>',
      '            </div>',
      '          </div>',
      '        </section>',
      '      </div>',
      '      <div class="jrw-success" data-ref="success" aria-live="polite">',
      '        ' + SVG_CHECK,
      '        <h3 class="jrw-success-heading">' + JRW_COPY.successHeading + '</h3>',
      '        <p class="jrw-success-body" data-ref="successBody"></p>',
      '        <button class="jrw-success-cta" data-ref="successBtn" type="button">' + JRW_COPY.successCta + '</button>',
      '      </div>',
      '    </div>',
      '  </aside>',
      '  <div class="jrw-launcher">',
      '    <div class="jrw-trigger-wrap">',
      '      <span class="jrw-icon-label" aria-hidden="true">' + JRW_COPY.iconTooltip + '</span>',
      '      <button class="jrw-icon-btn" type="button" data-ref="trigger" aria-label="' + JRW_COPY.ariaOpenWidget + '" aria-expanded="false">',
      '        ' + SVG_GIFT,
      '        <span class="jrw-trigger-text">' + JRW_COPY.ariaGiftIcon + '</span>',
      '      </button>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('');

    var refs = {
      overlay: shadow.querySelector('[data-ref="overlay"]'),
      drawer: shadow.querySelector('[data-ref="drawer"]'),
      drawerPanel: shadow.querySelector('[data-ref="drawerPanel"]'),
      drawerBody: shadow.querySelector('[data-ref="drawerBody"]'),
      formCard: shadow.querySelector('.jrw-form-card'),
      formFrame: shadow.querySelector('[data-ref="formFrame"]'),
      closeBtn: shadow.querySelector('[data-ref="closeBtn"]'),
      retryBtn: shadow.querySelector('[data-ref="retryBtn"]'),
      successBody: shadow.querySelector('[data-ref="successBody"]'),
      successBtn: shadow.querySelector('[data-ref="successBtn"]'),
      trigger: shadow.querySelector('[data-ref="trigger"]'),
      root: shadow.querySelector('.jrw-root'),
    };

    var state = {
      isOpen: false,
      formReady: false,
      formRequested: false,
      focusFirstFieldOnReady: false,
      successHandled: false,
      lastSubmission: {
        name: '',
        business: '',
      },
      lastSubmitAt: 0,
      visibleRoutes: {},
      isDestroyed: false,
    };

    setupMobileLauncherReveal(refs, trackVisibleIfVisible);
    trackWidgetEvent('referral_widget_loaded');
    trackVisibleIfVisible();

    function handleTriggerClick() {
      if (state.isOpen) {
        closeDrawer();
        return;
      }

      openDrawer();
    }

    function handleRetryClick() {
      loadForm(true);
    }

    function handleSuccessClick() {
      resetToForm();
    }

    function handleKeydown(event) {
      if (state.isOpen && (event.key === 'Escape' || event.key === 'Esc')) {
        closeDrawer();
      }
    }

    function handleMessage(event) {
      var data = event && event.data;

      if (state.isDestroyed) {
        return;
      }

      if (!data || data.type !== 'hsFormCallback' || data.eventName !== 'onFormSubmitted') {
        return;
      }

      if (!state.lastSubmitAt || Date.now() - state.lastSubmitAt > 15000) {
        return;
      }

      handleFormSuccess();
    }

    refs.trigger.addEventListener('click', handleTriggerClick);
    refs.overlay.addEventListener('click', closeDrawer);
    refs.closeBtn.addEventListener('click', closeDrawer);
    refs.retryBtn.addEventListener('click', handleRetryClick);
    refs.successBtn.addEventListener('click', handleSuccessClick);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('message', handleMessage);

    activeWidgetCleanup = function cleanupMountedWidget() {
      state.isDestroyed = true;
      refs.trigger.removeEventListener('click', handleTriggerClick);
      refs.overlay.removeEventListener('click', closeDrawer);
      refs.closeBtn.removeEventListener('click', closeDrawer);
      refs.retryBtn.removeEventListener('click', handleRetryClick);
      refs.successBtn.removeEventListener('click', handleSuccessClick);
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('message', handleMessage);

      if (activeWidgetTrackVisible === trackVisibleIfVisible) {
        activeWidgetTrackVisible = null;
      }

      if (host.parentNode) {
        host.parentNode.removeChild(host);
      }

      if (activeWidgetCleanup === cleanupMountedWidget) {
        activeWidgetCleanup = null;
      }
    };

    activeWidgetTrackVisible = trackVisibleIfVisible;

    function openDrawer() {
      if (state.isDestroyed) {
        return;
      }

      trackWidgetEvent('referral_widget_opened');
      state.isOpen = true;
      refs.drawer.classList.add('jrw-open');
      refs.overlay.classList.add('jrw-open');
      refs.trigger.setAttribute('aria-expanded', 'true');
      revealForm(false, false);

      scrollDrawerToTop();

      window.setTimeout(function () {
        refs.closeBtn.focus();
      }, 320);
    }

    function closeDrawer() {
      var shouldResetSubmittedForm = refs.drawerPanel.classList.contains('jrw-submitted');
      var shouldSuppressMobileLauncher = isMobileViewport() && !isMobileAlwaysVisibleRoute();

      if (state.isDestroyed) {
        return;
      }

      trackWidgetEvent('referral_widget_closed');
      state.isOpen = false;
      refs.drawer.classList.remove('jrw-open');
      refs.overlay.classList.remove('jrw-open');
      refs.drawerPanel.classList.remove('jrw-form-open');
      refs.drawerPanel.classList.remove('jrw-submitted');
      refs.trigger.setAttribute('aria-expanded', 'false');

      if (shouldResetSubmittedForm) {
        state.lastSubmission = {
          name: '',
          business: '',
        };
        state.lastSubmitAt = 0;
        state.formReady = false;
        state.formRequested = false;
        state.successHandled = false;
        refs.formFrame.setAttribute('data-state', 'loading');
        hubspotTarget.innerHTML = '';
      }

      scrollDrawerToTop();

      if (shouldSuppressMobileLauncher) {
        suppressMobileLauncher(refs);
        return;
      }

      refs.trigger.focus();
      trackVisibleIfVisible();
    }

    function loadForm(forceReset, scrollOnReady) {
      var shouldReset = !!forceReset;
      var shouldScrollOnReady = scrollOnReady !== false;

      if (state.isDestroyed) {
        return;
      }

      state.formRequested = true;
      state.formReady = false;
      state.successHandled = false;
      refs.formFrame.setAttribute('data-state', 'loading');

      resolveApolloConfigWhenReady(function (nextConfig) {
        var options;

        if (state.isDestroyed) {
          return;
        }

        config = nextConfig;
        options = {
          target: hubspotTarget,
          hiddenFields: {
            referrer_user_id: config.userId,
            referrer_email: config.userEmail,
            referrer_phone_number: config.userPhone,
            referrer_kitchen_id: config.kitchenId,
            referrer_kitchen_name: config.kitchenName,
          },
          onReady: function () {
            if (state.isDestroyed) {
              return;
            }

            state.formRequested = false;
            state.formReady = true;
            ensureHubSpotStyles();
            refs.formFrame.setAttribute('data-state', 'ready');
            bindFormListeners(0);
            trackWidgetEvent('referral_widget_form_loaded');
            if (shouldScrollOnReady) {
              scrollToFormCard();
            }
          },
          onSubmitted: function () {
            if (state.isDestroyed) {
              return;
            }

            handleFormSuccess();
          },
          onError: function () {
            if (state.isDestroyed) {
              return;
            }

            state.formRequested = false;
            state.formReady = false;
            refs.formFrame.setAttribute('data-state', 'error');
            trackWidgetEvent('referral_widget_form_error');
          },
        };

        if (shouldReset) {
          jrwResetHubSpotForm(options);
          return;
        }

        jrwLoadHubSpotForm(options);
      });
    }

    function revealForm(forceReset, shouldScroll) {
      var shouldScrollNow = shouldScroll !== false;

      if (state.isDestroyed) {
        return;
      }

      refs.drawerPanel.classList.add('jrw-form-open');

      if (shouldScrollNow) {
        scrollToFormCard();
      }

      if (forceReset) {
        loadForm(true, shouldScrollNow);
        return;
      }

      if (!state.formReady && !state.formRequested) {
        loadForm(false, shouldScrollNow);
      }
    }

    function bindFormListeners(attempt) {
      var form = hubspotTarget.querySelector('form');
      var tries = typeof attempt === 'number' ? attempt : 0;

      if (state.isDestroyed) {
        return;
      }

      if (!form) {
        if (tries < 12) {
          window.setTimeout(function () {
            bindFormListeners(tries + 1);
          }, 120);
        }
        return;
      }

      if (!form.getAttribute('data-jrw-bound')) {
        form.setAttribute('data-jrw-bound', '1');
        form.addEventListener('submit', captureSubmission);
      }

      applyFormCopy();

      if (state.focusFirstFieldOnReady) {
        state.focusFirstFieldOnReady = false;
        window.setTimeout(function () {
          var firstInput = hubspotTarget.querySelector('input:not([type="hidden"]), textarea, select');
          if (firstInput) {
            firstInput.focus();
          }
        }, 50);
      }
    }

    function applyFormCopy() {
      setInputPlaceholder('referee_name', JRW_COPY.fieldRefereeNamePlaceholder);
      setInputPlaceholder('referee_business', JRW_COPY.fieldRefereeBusinessPlaceholder);
      setInputPlaceholder('email', JRW_COPY.fieldRefereeEmailPlaceholder);
      setInputPlaceholder('phone', JRW_COPY.fieldRefereePhonePlaceholder);

      var submitButton = hubspotTarget.querySelector('input[type="submit"], button[type="submit"]');

      if (!submitButton) {
        return;
      }

      if (submitButton.tagName === 'INPUT') {
        submitButton.value = JRW_COPY.ctaSubmit;
      } else {
        submitButton.textContent = JRW_COPY.ctaSubmit;
      }
    }

    function setInputPlaceholder(fieldName, placeholder) {
      var input = hubspotTarget.querySelector('[name="' + fieldName + '"]');

      if (input) {
        input.setAttribute('placeholder', placeholder);
      }
    }

    function captureSubmission() {
      config = resolveApolloConfig();
      state.lastSubmission = {
        name: getInputValue('referee_name') || 'your contact',
        business: getInputValue('referee_business') || 'their business',
      };
      state.lastSubmitAt = Date.now();
      state.successHandled = false;
    }

    function handleFormSuccess() {
      var successTemplate;

      if (state.isDestroyed) {
        return;
      }

      if (state.successHandled) {
        return;
      }

      state.successHandled = true;
      trackWidgetEvent('referral_widget_submitted');
      successTemplate = isMobileViewport() ? JRW_COPY.mobileSuccessBody : JRW_COPY.successBody;
      refs.successBody.textContent = successTemplate
        .replace('{name}', state.lastSubmission.name || 'your contact')
        .replace('{business}', state.lastSubmission.business || 'their business');
      refs.drawerPanel.classList.add('jrw-submitted');
      suppressMobileLauncherForSession();
      refs.successBtn.focus();
    }

    function resetToForm() {
      if (state.isDestroyed) {
        return;
      }

      refs.drawerPanel.classList.remove('jrw-submitted');
      state.lastSubmission = {
        name: '',
        business: '',
      };
      state.lastSubmitAt = 0;
      state.formReady = false;
      state.formRequested = false;
      state.successHandled = false;
      state.focusFirstFieldOnReady = true;
      revealForm(true, true);
    }

    function getInputValue(fieldName) {
      var input = hubspotTarget.querySelector('[name="' + fieldName + '"]');
      return input && input.value ? input.value : '';
    }

    function scrollDrawerToTop() {
      if (!refs.drawerBody) {
        return;
      }

      refs.drawerBody.scrollTop = 0;

      window.requestAnimationFrame(function () {
        refs.drawerBody.scrollTop = 0;
      });

      window.setTimeout(function () {
        refs.drawerBody.scrollTop = 0;
      }, 120);
    }

    function scrollToFormCard() {
      if (!refs.drawerBody) {
        return;
      }

      var targetScroll = refs.formCard ? refs.formCard.offsetTop - 6 : 0;

      refs.drawerBody.scrollTop = targetScroll;

      window.requestAnimationFrame(function () {
        refs.drawerBody.scrollTop = targetScroll;
      });
    }

    function trackWidgetEvent(eventName) {
      if (!hasApolloConfig(config)) {
        config = resolveApolloConfig();
      }

      jrwTrackEvent(eventName, config);
    }

    function trackVisibleIfVisible() {
      var route;

      if (state.isDestroyed || !isLauncherVisible(refs)) {
        return;
      }

      route = getNormalizedPathname();

      if (state.visibleRoutes[route]) {
        return;
      }

      state.visibleRoutes[route] = true;
      trackWidgetEvent('referral_widget_visible');
    }
  }

  function resolveApolloConfig() {
    var cache = getApolloCache();
    var refs;
    var userMatch;
    var kitchenMatch;
    var userRecord;
    var kitchenRecord;

    if (!cache) {
      return emptyConfig();
    }

    refs = collectApolloRefs(cache.ROOT_QUERY || {});
    userMatch = findApolloRecord(cache, refs, 'User:', function (value) {
      return value && (value.email || value.firstName || value.phoneNumberNational || value.phoneNumber || value.phone);
    });
    kitchenMatch = findApolloRecord(cache, refs, 'Kitchen:', function (value) {
      return value && value.name;
    });
    userRecord = userMatch ? userMatch.record : null;
    kitchenRecord = kitchenMatch ? kitchenMatch.record : null;

    return {
      userId: readApolloValue(userRecord && userRecord.id, userMatch && userMatch.key),
      userEmail: readApolloValue(userRecord && userRecord.email),
      userName: buildUserName(userRecord),
      userPhone: readApolloValue(
        userRecord && (
          userRecord.phoneNumberNational ||
          userRecord.phoneNumber ||
          userRecord.phone ||
          userRecord.mobile
        )
      ),
      kitchenId: readApolloValue(kitchenRecord && kitchenRecord.id, kitchenMatch && kitchenMatch.key),
      kitchenName: readApolloValue(kitchenRecord && kitchenRecord.name),
    };
  }

  function emptyConfig() {
    return {
      userId: '',
      userEmail: '',
      userName: '',
      userPhone: '',
      kitchenId: '',
      kitchenName: '',
    };
  }

  function getApolloCache() {
    var client = null;

    if (typeof __APOLLO_CLIENT__ !== 'undefined' && __APOLLO_CLIENT__) {
      client = __APOLLO_CLIENT__;
    } else if (typeof window !== 'undefined' && window.__APOLLO_CLIENT__) {
      client = window.__APOLLO_CLIENT__;
    }

    if (!client || !client.cache || typeof client.cache.extract !== 'function') {
      return null;
    }

    try {
      return client.cache.extract();
    } catch (error) {
      return null;
    }
  }

  function collectApolloRefs(value) {
    var refs = [];
    var seen = {};

    function walk(entry) {
      var values;
      var index;
      var ref;

      if (!entry) {
        return;
      }

      if (Array.isArray(entry)) {
        for (index = 0; index < entry.length; index += 1) {
          walk(entry[index]);
        }
        return;
      }

      if (typeof entry !== 'object') {
        return;
      }

      ref = entry.__ref;

      if (typeof ref === 'string' && !seen[ref]) {
        seen[ref] = true;
        refs.push(ref);
      }

      values = Object.keys(entry);

      for (index = 0; index < values.length; index += 1) {
        walk(entry[values[index]]);
      }
    }

    walk(value);
    return refs;
  }

  function findApolloRecord(cache, refs, prefix, predicate) {
    var index;
    var key;
    var record;
    var keys;

    for (index = 0; index < refs.length; index += 1) {
      key = refs[index];

      if (key.indexOf(prefix) !== 0) {
        continue;
      }

      record = cache[key];

      if (record && predicate(record)) {
        return { key: key, record: record };
      }
    }

    keys = Object.keys(cache);

    for (index = 0; index < keys.length; index += 1) {
      key = keys[index];

      if (key.indexOf(prefix) !== 0) {
        continue;
      }

      record = cache[key];

      if (record && predicate(record)) {
        return { key: key, record: record };
      }
    }

    return null;
  }

  function readApolloValue(value, cacheKey) {
    if (value === null || value === undefined) {
      if (cacheKey && cacheKey.indexOf(':') !== -1) {
        return cacheKey.split(':').slice(1).join(':');
      }

      return '';
    }

    return String(value);
  }

  function buildUserName(userRecord) {
    var firstName = readApolloValue(userRecord && userRecord.firstName);
    var lastName = readApolloValue(userRecord && userRecord.lastName);
    var fullName = (firstName + ' ' + lastName).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');

    if (fullName) {
      return fullName;
    }

    return firstName || '';
  }

  function resolveApolloConfigWhenReady(callback) {
    var attempts = 0;
    var maxAttempts = 20;

    function check() {
      var nextConfig = resolveApolloConfig();

      if (hasApolloConfig(nextConfig) || attempts >= maxAttempts) {
        callback(nextConfig);
        return;
      }

      attempts += 1;
      window.setTimeout(check, 250);
    }

    check();
  }

  function hasApolloConfig(config) {
    return !!(
      config &&
      (config.userId || config.userEmail) &&
      (config.kitchenId || config.kitchenName)
    );
  }

  function setupMobileLauncherReveal(refs, onVisible) {
    if (!isMobileViewport() || !refs.root) {
      return;
    }

    refs.root.classList.add('jrw-mobile-pending');

    window.setTimeout(function () {
      refs.root.classList.remove('jrw-mobile-pending');

      if (typeof onVisible === 'function') {
        onVisible();
      }
    }, MOBILE_LAUNCHER_DELAY_MS);
  }

  function suppressMobileLauncher(refs) {
    suppressMobileLauncherForSession();

    if (refs && refs.root) {
      refs.root.classList.add('jrw-session-hidden');
    }
  }

  function isMobileLauncherSuppressed() {
    try {
      return window.sessionStorage.getItem(MOBILE_SUPPRESS_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function suppressMobileLauncherForSession() {
    try {
      window.sessionStorage.setItem(MOBILE_SUPPRESS_KEY, '1');
    } catch (error) {
      // Ignore storage access issues.
    }
  }

  function setupRouteChangeListeners() {
    var originalPushState;
    var originalReplaceState;

    if (routeListenersInstalled || !window.history) {
      return;
    }

    routeListenersInstalled = true;

    function notifyRouteChange() {
      window.setTimeout(syncWidgetForCurrentRoute, 0);
    }

    if (typeof window.history.pushState === 'function') {
      originalPushState = window.history.pushState;
      window.history.pushState = function () {
        var result = originalPushState.apply(window.history, arguments);
        notifyRouteChange();
        return result;
      };
    }

    if (typeof window.history.replaceState === 'function') {
      originalReplaceState = window.history.replaceState;
      window.history.replaceState = function () {
        var result = originalReplaceState.apply(window.history, arguments);
        notifyRouteChange();
        return result;
      };
    }

    window.addEventListener('popstate', notifyRouteChange);
  }

  function removeMountedWidget() {
    var host;
    var cleanup = activeWidgetCleanup;

    if (cleanup) {
      cleanup();
      return;
    }

    host = document.getElementById(HOST_ID);

    if (host && host.parentNode) {
      host.parentNode.removeChild(host);
    }
  }

  function syncMountedWidgetLauncherVisibility() {
    var host = document.getElementById(HOST_ID);
    var root = host && host.shadowRoot && host.shadowRoot.querySelector('.jrw-root');

    if (!root) {
      return;
    }

    if (!isMobileViewport() || isMobileAlwaysVisibleRoute()) {
      root.classList.remove('jrw-session-hidden');
      trackMountedWidgetVisible();
      return;
    }

    if (isMobileLauncherSuppressed()) {
      root.classList.add('jrw-session-hidden');
    } else {
      root.classList.remove('jrw-session-hidden');
      trackMountedWidgetVisible();
    }
  }

  function trackMountedWidgetVisible() {
    if (typeof activeWidgetTrackVisible !== 'function') {
      return;
    }

    window.setTimeout(activeWidgetTrackVisible, 0);
  }

  function isLauncherVisible(refs) {
    if (!refs || !refs.root || !refs.drawer) {
      return false;
    }

    if (refs.root.classList.contains('jrw-mobile-pending')) {
      return false;
    }

    if (refs.root.classList.contains('jrw-session-hidden')) {
      return false;
    }

    return !refs.drawer.classList.contains('jrw-open');
  }

  function shouldShowWidgetOnCurrentRoute() {
    if (!isMobileViewport()) {
      return true;
    }

    return isMobileRouteAllowed();
  }

  function isMobileRouteAllowed() {
    return !!MOBILE_ALLOWED_PATHS[getNormalizedPathname()];
  }

  function isMobileAlwaysVisibleRoute() {
    return isMobileViewport() && !!MOBILE_ALWAYS_VISIBLE_PATHS[getNormalizedPathname()];
  }

  function getNormalizedPathname() {
    var pathname = '/';

    if (window.location && window.location.pathname) {
      pathname = window.location.pathname;
    }

    pathname = pathname.replace(/\/+$/, '');

    return pathname || '/';
  }

  function ensureHubSpotStyles() {
    var styleId = 'jrw-hubspot-styles';
    var existing = document.getElementById(styleId);
    var styleEl = document.createElement('style');

    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    styleEl.id = styleId;
    styleEl.textContent = JRW_HUBSPOT_STYLES;
    document.head.appendChild(styleEl);
  }

  function isMobileViewport() {
    return window.matchMedia && window.matchMedia('(max-width: 480px)').matches;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  init();
})();
