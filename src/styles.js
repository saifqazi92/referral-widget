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
.jrw-launch-card-overlay,
.jrw-launch-card,
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

.jrw-launch-card-overlay {
  position: fixed;
  inset: 0;
  z-index: 4;
  background: rgba(16, 34, 70, 0.3);
  opacity: 0;
  visibility: hidden;
  transition: opacity 200ms ease, visibility 0s linear 200ms;
}

.jrw-launch-card {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 5;
  width: min(430px, calc(100vw - 32px));
  padding: 24px;
  border-radius: 28px;
  background:
    radial-gradient(circle at 88% 0%, rgba(255, 225, 166, 0.44), transparent 30%),
    linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 100%);
  border: 1px solid rgba(226, 230, 239, 0.96);
  box-shadow: 0 32px 80px rgba(16, 34, 70, 0.28);
  color: var(--jrw-text-primary);
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, calc(-50% + 16px)) scale(0.98);
  transition: opacity 220ms ease, transform 260ms ease, visibility 0s linear 220ms;
}

.jrw-root.jrw-launch-card-open .jrw-launch-card-overlay,
.jrw-root.jrw-launch-card-open .jrw-launch-card {
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
}

.jrw-root.jrw-launch-card-open .jrw-launch-card {
  transform: translate(-50%, -50%) scale(1);
}

.jrw-root.jrw-launch-card-open .jrw-launcher {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(8px);
  transition-delay: 0s;
}

.jrw-launch-card-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
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

.jrw-launch-card-close:hover,
.jrw-launch-card-close:focus-visible {
  background: #EBEDF0;
  color: var(--jrw-text-primary);
  transform: rotate(90deg);
  outline: none;
}

.jrw-launch-card-close svg {
  width: 14px;
  height: 14px;
}

.jrw-launch-card-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #FFF3D9;
  color: var(--jrw-text-primary);
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.jrw-launch-card-title {
  margin: 16px 38px 10px 0;
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.05em;
  color: var(--jrw-text-primary);
}

.jrw-launch-card-body {
  margin: 0;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  color: var(--jrw-text-secondary);
}

.jrw-launch-card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.jrw-launch-card-cta,
.jrw-launch-card-dismiss {
  min-height: 46px;
  border: 0;
  border-radius: 999px;
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 160ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
}

.jrw-launch-card-cta {
  flex: 1 1 auto;
  padding: 0 22px;
  background: linear-gradient(180deg, #132A54 0%, #071A3A 100%);
  color: #FFFFFF;
  box-shadow: 0 14px 24px rgba(16, 34, 70, 0.18);
}

.jrw-launch-card-dismiss {
  flex: 0 0 auto;
  padding: 0 16px;
  background: #F3F5F8;
  color: var(--jrw-text-secondary);
}

.jrw-launch-card-cta:hover,
.jrw-launch-card-cta:focus-visible,
.jrw-launch-card-dismiss:hover,
.jrw-launch-card-dismiss:focus-visible {
  transform: translateY(-1px);
  outline: none;
}

.jrw-launch-card-cta:hover,
.jrw-launch-card-cta:focus-visible {
  background: linear-gradient(180deg, #1B315E 0%, #102246 100%);
  box-shadow: 0 18px 28px rgba(16, 34, 70, 0.22);
}

.jrw-launch-card-dismiss:hover,
.jrw-launch-card-dismiss:focus-visible {
  background: #EBEDF0;
  color: var(--jrw-text-primary);
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
  width: auto;
  min-width: 0;
  height: 52px;
  padding: 0 18px 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--jrw-primary);
  color: #FFFFFF;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: var(--jrw-shadow-icon);
  font-family: 'Rubik', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.01em;
  transition: transform 160ms ease, background 200ms ease, box-shadow 200ms ease;
  animation: jrw-bounce 420ms ease-in-out 500ms both;
}

.jrw-icon-btn:hover,
.jrw-icon-btn:focus-visible {
  background: var(--jrw-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 22px 38px rgba(27, 43, 75, 0.3);
  outline: none;
}

.jrw-icon-btn:active {
  transform: translateY(0) scale(0.98);
}

.jrw-icon-btn svg {
  width: 20px;
  height: 20px;
  display: block;
  flex: 0 0 auto;
}

.jrw-trigger-text {
  display: inline-block;
  white-space: nowrap;
}

.jrw-icon-label {
  display: none;
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
  .jrw-launch-card {
    top: auto;
    left: 10px;
    right: 10px;
    bottom: calc(var(--jrw-mobile-nav-height) + 16px + env(safe-area-inset-bottom));
    width: auto;
    padding: 18px;
    border-radius: 24px;
    transform: translateY(18px) scale(0.98);
  }

  .jrw-root.jrw-launch-card-open .jrw-launch-card {
    transform: translateY(0) scale(1);
  }

  .jrw-launch-card-title {
    margin: 14px 38px 8px 0;
    font-size: 24px;
    line-height: 1.08;
  }

  .jrw-launch-card-body {
    font-size: 14px;
    line-height: 1.45;
  }

  .jrw-launch-card-actions {
    margin-top: 16px;
    gap: 8px;
  }

  .jrw-launch-card-cta,
  .jrw-launch-card-dismiss {
    min-height: 44px;
    font-size: 13px;
  }

  .jrw-launch-card-dismiss {
    padding: 0 13px;
  }

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
    gap: 0;
    border-radius: 999px;
    box-shadow: 0 10px 22px rgba(27, 43, 75, 0.18);
    font-size: 0;
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

@media print {
  :host,
  .jrw-root {
    display: none;
    visibility: hidden;
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

@media print {
  #jrw-widget-host {
    display: none;
    visibility: hidden;
  }
}
`;
