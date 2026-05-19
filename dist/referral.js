/*!
 * Jelly Referral Widget
 * getjelly.co.uk
 *
 * Install with one script tag:
 *   <script
 *     src="https://cdn.getjelly.co.uk/referral.js"
 *     defer
 *   ></script>
 *
 * This build reads the current user and kitchen from Jelly's Apollo cache.
 */

(function () {
  "use strict";

// All user-facing strings for the Jelly Referral Widget.
// Edit here — nothing is hardcoded in widget.js or hubspot.js.

var JRW_COPY = {
  iconTooltip: 'Refer a kitchen, earn \u00a3200',

  drawerHeading: 'Know another restaurant that should use Jelly?',
  drawerSubheading: 'Refer them and get a <span class="jrw-reward-highlight">\u00a3200 Amazon gift card</span> once they become a paying customer',
  rewardDetailHeading: 'You make the intro.',
  rewardDetailBody: 'We handle the follow-up.',

  fieldRefereeNamePlaceholder: 'e.g. Alex Smith',
  fieldRefereeBusinessPlaceholder: 'e.g. The Green House',
  fieldRefereeEmailPlaceholder: 'e.g. alex@greenhouse.com',
  fieldRefereePhonePlaceholder: 'e.g. 07700 900123',

  ctaSubmit: 'Send referral',
  ctaRetry: 'Try again',

  loadingHeading: 'Loading referral form',
  loadingBody: 'Getting the referral form ready.',

  errorHeading: 'We could not load the form',
  errorBody: 'Please refresh and try again, or email letscook@getjelly.co.uk.',

  successHeading: 'Referral sent',
  successBody: 'We will follow up with {name} at {business}. If they become a paying Jelly customer, we will send your \u00a3200 Amazon gift card.',
  mobileSuccessBody: 'We will follow up with {name}.',
  successCta: 'Send another referral',

  ariaOpenWidget: 'Open referral programme',
  ariaCloseDrawer: 'Close referral drawer',
  ariaGiftIcon: 'Refer a kitchen',
};

// All widget styles. Injected into the widget's Shadow DOM.
// The HubSpot target is slotted into the Shadow DOM so the embed script can still find it.

var JRW_STYLES = `
:host {
  font-family: inherit;
}

.jrw-root,
.jrw-root *,
.jrw-root *::before,
.jrw-root *::after {
  box-sizing: border-box;
}

.jrw-root {
  --jrw-primary: #102246;
  --jrw-primary-hover: #1B315E;
  --jrw-accent: #FFE1A6;
  --jrw-orange: #FF7048;
  --jrw-cream: #FFF8EC;
  --jrw-surface: #FFFFFF;
  --jrw-surface-subtle: #F7F8FB;
  --jrw-text-primary: #102246;
  --jrw-text-secondary: #647089;
  --jrw-text-tertiary: #8E98AC;
  --jrw-border: #E2E6EF;
  --jrw-success: #1A9E5C;
  --jrw-overlay: rgba(16, 34, 70, 0.34);
  --jrw-shadow-drawer: 0 34px 92px rgba(16, 34, 70, 0.22);
  --jrw-shadow-icon: 0 16px 32px rgba(27, 43, 75, 0.24);
  --jrw-shadow-card: 0 22px 44px rgba(16, 34, 70, 0.1);
  --jrw-mobile-nav-height: 56px;
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  color: var(--jrw-text-primary);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

.jrw-root button,
.jrw-root input,
.jrw-root textarea,
.jrw-root select {
  font: inherit;
}

.jrw-overlay,
.jrw-drawer,
.jrw-launcher {
  pointer-events: auto;
}

.jrw-overlay {
  position: fixed;
  inset: 0;
  background: var(--jrw-overlay);
  opacity: 0;
  visibility: hidden;
  transition: opacity 200ms ease, visibility 0s linear 200ms;
}

.jrw-overlay.jrw-open {
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
}

.jrw-launcher {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1;
  transition: opacity 180ms ease, transform 180ms ease, visibility 0s linear 180ms;
}

.jrw-root.jrw-mobile-pending .jrw-launcher,
.jrw-root.jrw-session-hidden .jrw-launcher {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(8px);
}

.jrw-trigger-wrap {
  position: relative;
}

.jrw-icon-btn {
  position: relative;
  width: 58px;
  height: 58px;
  border: 0;
  border-radius: 999px;
  background: var(--jrw-primary);
  color: #FFFFFF;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--jrw-shadow-icon);
  transition: transform 160ms ease, background 200ms ease, box-shadow 200ms ease;
  animation: jrw-bounce 420ms ease-in-out 500ms both;
}

.jrw-icon-btn:hover,
.jrw-icon-btn:focus-visible {
  background: var(--jrw-primary-hover);
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 22px 38px rgba(27, 43, 75, 0.3);
  outline: none;
}

.jrw-icon-btn:active {
  transform: scale(0.98);
}

.jrw-icon-btn svg {
  width: 24px;
  height: 24px;
  display: block;
}

.jrw-trigger-text {
  display: none;
}

.jrw-icon-label {
  position: absolute;
  right: 72px;
  top: 50%;
  transform: translateY(calc(-50% + 4px));
  background: var(--jrw-primary);
  color: #FFFFFF;
  border-radius: 999px;
  padding: 8px 12px;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.01em;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease, transform 180ms ease;
}

.jrw-icon-label::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  width: 10px;
  height: 10px;
  background: var(--jrw-primary);
  transform: translateY(-50%) rotate(45deg);
  border-radius: 2px;
}

.jrw-trigger-wrap:hover .jrw-icon-label,
.jrw-trigger-wrap:focus-within .jrw-icon-label {
  opacity: 1;
  transform: translateY(-50%);
}

.jrw-drawer {
  position: fixed;
  top: 24px;
  right: 24px;
  bottom: 24px;
  width: min(560px, calc(100vw - 48px));
  opacity: 0;
  visibility: hidden;
  transform: translateX(calc(100% + 28px));
  transition: transform 300ms ease-out, opacity 200ms ease, visibility 0s linear 300ms;
}

.jrw-drawer.jrw-open {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  transition-delay: 0s;
}

.jrw-drawer.jrw-open ~ .jrw-launcher {
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  pointer-events: none;
  transition-delay: 0s;
}

.jrw-drawer-panel {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 78% 4%, rgba(255, 225, 166, 0.22), transparent 28%),
    var(--jrw-surface);
  border: 1px solid rgba(226, 230, 239, 0.92);
  border-radius: 32px;
  box-shadow: var(--jrw-shadow-drawer);
  overflow: hidden;
  overflow-x: hidden;
}

.jrw-drawer-header {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  padding: 0;
}

.jrw-close-btn {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: #F3F5F8;
  color: var(--jrw-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, transform 160ms ease;
}

.jrw-close-btn:hover,
.jrw-close-btn:focus-visible {
  background: #EBEDF0;
  color: var(--jrw-text-primary);
  transform: rotate(90deg);
  outline: none;
}

.jrw-close-btn svg {
  width: 14px;
  height: 14px;
}

.jrw-drawer-body {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.jrw-hero {
  position: relative;
  padding: 16px 54px 16px 18px;
  border-radius: 22px;
  background:
    radial-gradient(circle at 82% 26%, rgba(226, 231, 239, 0.9), transparent 24%),
    linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 100%);
  border: 1px solid rgba(226, 230, 239, 0.96);
  overflow: hidden;
}

.jrw-hero::before {
  content: '';
  position: absolute;
  top: -82px;
  right: -94px;
  width: 190px;
  height: 190px;
  background: radial-gradient(circle, rgba(242, 245, 250, 0.96), rgba(242, 245, 250, 0));
  filter: blur(2px);
  border-radius: 999px;
}

.jrw-hero-copy {
  position: relative;
  z-index: 1;
}

.jrw-drawer-heading {
  margin: 0 0 7px;
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 27px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
  color: var(--jrw-text-primary);
}

.jrw-drawer-subheading {
  margin: 0;
  max-width: 450px;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.42;
  color: var(--jrw-text-secondary);
}

.jrw-reward-highlight {
  color: var(--jrw-orange);
  font-weight: 800;
}

.jrw-reward-callout {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 13px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 10% 0%, rgba(255, 225, 166, 0.78), transparent 38%),
    var(--jrw-cream);
  border: 1px solid rgba(255, 207, 122, 0.72);
}

.jrw-reward-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #FFF1CA;
  color: var(--jrw-primary);
  box-shadow: inset 0 0 0 8px rgba(255, 255, 255, 0.46);
}

.jrw-reward-icon svg {
  width: 30px;
  height: 30px;
  display: block;
}

.jrw-reward-copy {
  margin: 0;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.25;
  color: var(--jrw-text-primary);
}

.jrw-reward-copy strong {
  display: inline;
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;
}

.jrw-reward-copy span {
  display: inline;
  margin-top: 0;
}

.jrw-reward-copy strong::after {
  content: ' ';
}

.jrw-form-card {
  padding: 16px;
  border-radius: 22px;
  background: #FFFFFF;
  border: 1px solid rgba(226, 230, 239, 0.96);
  box-shadow: 0 16px 32px rgba(16, 34, 70, 0.055);
}

.jrw-form-frame {
  margin-top: 0;
  padding: 0;
  border-radius: 18px;
  background: transparent;
  border: 0;
}

.jrw-form-status {
  display: none;
  align-items: flex-start;
  gap: 12px;
  padding: 2px 0;
}

.jrw-form-frame[data-state='loading'] .jrw-form-status--loading,
.jrw-form-frame[data-state='error'] .jrw-form-status--error {
  display: flex;
}

.jrw-form-frame[data-state='loading'] .jrw-form-slot {
  display: none;
}

.jrw-form-frame[data-state='error'] .jrw-form-slot {
  display: none;
}

.jrw-form-frame[data-state='ready'] .jrw-form-status {
  display: none;
}

.jrw-status-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(27, 43, 75, 0.08);
  color: var(--jrw-primary);
}

.jrw-spinner {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid rgba(27, 43, 75, 0.16);
  border-top-color: var(--jrw-primary);
  animation: jrw-spin 1s linear infinite;
}

.jrw-status-copy strong {
  display: block;
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.jrw-status-copy p {
  margin: 4px 0 0;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.45;
  color: var(--jrw-text-secondary);
}

.jrw-retry-btn {
  margin-top: 12px;
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: var(--jrw-primary);
  color: #FFFFFF;
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.jrw-form-slot {
  min-height: 270px;
}

.jrw-form-slot slot {
  display: block;
}

::slotted([slot='hubspot']) {
  display: block;
  width: 100%;
  min-height: 270px;
  color: var(--jrw-text-primary);
  font-family: 'Lato', system-ui, sans-serif;
  --hsf-global__font-family: 'Lato', system-ui, sans-serif;
  --hsf-global__font-size: 14px;
  --hsf-global__color: #1B2B4B;
  --hsf-field-label__font-family: 'Lato', system-ui, sans-serif;
  --hsf-field-label__font-size: 13px;
  --hsf-field-label__color: #1B2B4B;
  --hsf-field-label-requiredindicator__color: #FF7048;
  --hsf-field-input__font-family: 'Lato', system-ui, sans-serif;
  --hsf-field-input__color: #1B2B4B;
  --hsf-field-input__background-color: #FFFFFF;
  --hsf-field-input__placeholder-color: #98A2B3;
  --hsf-field-input__border-color: #DDE3EC;
  --hsf-field-input__border-width: 1px;
  --hsf-field-input__border-style: solid;
  --hsf-field-input__border-radius: 16px;
  --hsf-field-input__padding: 15px 16px;
  --hsf-button__font-family: 'Rubik', system-ui, sans-serif;
  --hsf-button__font-size: 14px;
  --hsf-button__color: #FFFFFF;
  --hsf-button__background-color: #1B2B4B;
  --hsf-button__border-radius: 999px;
  --hsf-button__padding: 15px 24px;
  --hsf-button__box-shadow: 0 14px 24px rgba(16, 34, 70, 0.18);
  --hsf-background__background-color: transparent;
  --hsf-background__border-radius: 0;
  --hsf-background__padding: 0;
  --hsf-row__vertical-spacing: 14px;
  --hsf-global-error__color: #D93025;
}

.jrw-success {
  display: none;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  gap: 13px;
  padding: 34px 28px 38px;
}

.jrw-drawer-panel.jrw-submitted .jrw-success {
  display: flex;
}

.jrw-drawer-panel.jrw-submitted .jrw-drawer-body {
  display: none;
}

.jrw-success-icon {
  width: 68px;
  height: 68px;
  display: block;
}

.jrw-success-heading {
  margin: 0;
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 27px;
  font-weight: 800;
  line-height: 1.15;
}

.jrw-success-body {
  margin: 0;
  max-width: 330px;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.55;
  color: var(--jrw-text-secondary);
}

.jrw-success-cta {
  margin-top: 6px;
  min-height: 48px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(180deg, #132A54 0%, #071A3A 100%);
  color: #FFFFFF;
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 24px rgba(16, 34, 70, 0.18);
}

@keyframes jrw-bounce {
  0% { transform: scale(1); }
  45% { transform: scale(1.13); }
  100% { transform: scale(1); }
}

@keyframes jrw-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .jrw-launcher {
    left: auto;
    right: 14px;
    bottom: calc(var(--jrw-mobile-nav-height) + 14px + env(safe-area-inset-bottom));
    transform: none;
  }

  .jrw-drawer {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    max-width: 100vw;
    transform: translateY(calc(100% + 20px));
  }

  .jrw-drawer.jrw-open {
    transform: translateY(0);
  }

  .jrw-drawer.jrw-open ~ .jrw-launcher {
    transform: translateY(10px);
  }

  .jrw-drawer-panel {
    height: auto;
    border-radius: 26px 26px 0 0;
    max-height: calc(92vh + env(safe-area-inset-bottom));
  }

  .jrw-drawer-header {
    top: 12px;
    right: 12px;
  }

  .jrw-icon-label {
    display: none;
  }

  .jrw-drawer-body {
    padding: 16px 16px calc(18px + env(safe-area-inset-bottom));
    gap: 12px;
  }

  .jrw-trigger-wrap {
    width: auto;
  }

  .jrw-icon-btn {
    width: 46px;
    height: 46px;
    min-height: 0;
    padding: 0;
    border-radius: 999px;
    box-shadow: 0 10px 22px rgba(27, 43, 75, 0.18);
    animation: none;
  }

  .jrw-icon-btn svg {
    width: 20px;
    height: 20px;
  }

  .jrw-trigger-text {
    display: none;
  }

  .jrw-hero {
    padding: 16px 46px 16px 16px;
    border-radius: 22px;
  }

  .jrw-hero::before {
    width: 150px;
    height: 150px;
    top: -62px;
    right: -78px;
  }

  .jrw-drawer-heading {
    margin: 0 0 8px;
    font-size: 24px;
    line-height: 1.12;
  }

  .jrw-drawer-subheading {
    display: block;
    margin: 0;
    max-width: none;
    font-size: 14px;
    line-height: 1.45;
    color: var(--jrw-text-secondary);
  }

  .jrw-reward-callout {
    display: flex;
    padding: 10px 12px;
    border-radius: 18px;
  }

  .jrw-reward-icon {
    width: 36px;
    height: 36px;
  }

  .jrw-reward-icon svg {
    width: 28px;
    height: 28px;
  }

  .jrw-reward-copy {
    font-size: 14px;
  }

  .jrw-reward-copy strong {
    font-size: 14px;
  }

  .jrw-form-card {
    padding: 12px;
    border-radius: 22px;
    box-shadow: none;
  }

  .jrw-drawer-panel.jrw-form-open {
    max-height: calc(92vh + env(safe-area-inset-bottom));
  }

  .jrw-form-frame {
    margin-top: 0;
    padding: 0;
    border-radius: 16px;
  }

  .jrw-success {
    padding: 16px 16px calc(20px + env(safe-area-inset-bottom));
    gap: 10px;
  }

  .jrw-success-heading {
    font-size: 22px;
  }

  .jrw-success-body {
    max-width: none;
  }

}

@media (prefers-reduced-motion: reduce) {
  .jrw-overlay,
  .jrw-drawer,
  .jrw-icon-btn,
  .jrw-icon-label,
  .jrw-close-btn,
  .jrw-spinner {
    animation: none;
    transition: none;
  }
}
`;

var JRW_HUBSPOT_STYLES = `
#jrw-widget-host [slot='hubspot'] {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  color: #1B2B4B;
  font-family: 'Lato', system-ui, sans-serif;
}

#jrw-widget-host [slot='hubspot'] .hbspt-form,
#jrw-widget-host [slot='hubspot'] form,
#jrw-widget-host [slot='hubspot'] .hs-form,
#jrw-widget-host [slot='hubspot'] fieldset {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
}

#jrw-widget-host [slot='hubspot'] form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

#jrw-widget-host [slot='hubspot'] .hs-form-field,
#jrw-widget-host [slot='hubspot'] .hs-richtext,
#jrw-widget-host [slot='hubspot'] .legal-consent-container,
#jrw-widget-host [slot='hubspot'] .hs_submit,
#jrw-widget-host [slot='hubspot'] .actions {
  margin: 0;
}

#jrw-widget-host [slot='hubspot'] label {
  display: block;
  margin: 0 0 8px;
  color: #102246;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
}

#jrw-widget-host [slot='hubspot'] input[type='text'],
#jrw-widget-host [slot='hubspot'] input[type='email'],
#jrw-widget-host [slot='hubspot'] input[type='tel'],
#jrw-widget-host [slot='hubspot'] input[type='number'],
#jrw-widget-host [slot='hubspot'] select,
#jrw-widget-host [slot='hubspot'] textarea {
  display: block;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 15px 16px;
  border: 1px solid #DDE3EC;
  border-radius: 16px;
  background: #FFFFFF;
  color: #102246;
  box-shadow: none;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.45;
  appearance: none;
}

#jrw-widget-host [slot='hubspot'] input::placeholder,
#jrw-widget-host [slot='hubspot'] textarea::placeholder {
  color: #98A2B3;
}

#jrw-widget-host [slot='hubspot'] input:focus,
#jrw-widget-host [slot='hubspot'] select:focus,
#jrw-widget-host [slot='hubspot'] textarea:focus {
  outline: none;
  border-color: #102246;
  box-shadow: 0 0 0 3px rgba(16, 34, 70, 0.08);
}

#jrw-widget-host [slot='hubspot'] .actions input[type='submit'],
#jrw-widget-host [slot='hubspot'] .actions button,
#jrw-widget-host [slot='hubspot'] input[type='submit'],
#jrw-widget-host [slot='hubspot'] button[type='submit'] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 52px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(180deg, #132A54 0%, #071A3A 100%);
  color: #FFFFFF;
  box-shadow: 0 14px 24px rgba(16, 34, 70, 0.18);
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  cursor: pointer;
}

#jrw-widget-host [slot='hubspot'] .actions input[type='submit']:hover,
#jrw-widget-host [slot='hubspot'] .actions button:hover,
#jrw-widget-host [slot='hubspot'] input[type='submit']:hover,
#jrw-widget-host [slot='hubspot'] button[type='submit']:hover {
  filter: brightness(1.06);
}

#jrw-widget-host [slot='hubspot'] .hs-error-msgs {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
}

#jrw-widget-host [slot='hubspot'] .hs-error-msg,
#jrw-widget-host [slot='hubspot'] .hs-error-msgs label {
  color: #D93025;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}

#jrw-widget-host [slot='hubspot'] .hs-richtext,
#jrw-widget-host [slot='hubspot'] .legal-consent-container,
#jrw-widget-host [slot='hubspot'] .submitted-message {
  color: #647089;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.5;
}

#jrw-widget-host [slot='hubspot'] .submitted-message {
  margin: 0;
  padding: 0;
}
`;

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
      isDestroyed: false,
    };

    setupMobileLauncherReveal(refs);

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

      if (host.parentNode) {
        host.parentNode.removeChild(host);
      }

      if (activeWidgetCleanup === cleanupMountedWidget) {
        activeWidgetCleanup = null;
      }
    };

    function openDrawer() {
      if (state.isDestroyed) {
        return;
      }

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

  function setupMobileLauncherReveal(refs) {
    if (!isMobileViewport() || !refs.root) {
      return;
    }

    refs.root.classList.add('jrw-mobile-pending');

    window.setTimeout(function () {
      refs.root.classList.remove('jrw-mobile-pending');
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
      return;
    }

    if (isMobileLauncherSuppressed()) {
      root.classList.add('jrw-session-hidden');
    } else {
      root.classList.remove('jrw-session-hidden');
    }
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
