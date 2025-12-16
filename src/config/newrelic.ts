import logger from '../utils/logger';

let newRelicEnabled = false;

export const initializeNewRelic = (): boolean => {
  try {
    const enabled = process.env.NEW_RELIC_ENABLED === 'true';
    const licenseKey = process.env.NEW_RELIC_LICENSE_KEY;
    const appName = process.env.NEW_RELIC_APP_NAME || 'wallet-service';

    if (!enabled) {
      logger.info('New Relic monitoring is disabled');
      return false;
    }

    if (!licenseKey) {
      logger.warn(
        'New Relic license key not found. Monitoring will be disabled.',
      );
      return false;
    }

    const newrelic = require('newrelic');

    newRelicEnabled = true;
    logger.info(`New Relic initialized successfully for app: ${appName}`);

    return true;
  } catch (error) {
    logger.error('Failed to initialize New Relic', { error });
    return false;
  }
};

export const isNewRelicEnabled = (): boolean => {
  return newRelicEnabled;
};

export const recordMetric = (name: string, value: number): void => {
  if (!newRelicEnabled) return;

  try {
    const newrelic = require('newrelic');
    newrelic.recordMetric(name, value);
  } catch (error) {
    logger.error('Failed to record New Relic metric', { error, name, value });
  }
};

export const recordEvent = (
  eventType: string,
  attributes: Record<string, any>,
): void => {
  if (!newRelicEnabled) return;

  try {
    const newrelic = require('newrelic');
    newrelic.recordCustomEvent(eventType, attributes);
  } catch (error) {
    logger.error('Failed to record New Relic event', { error, eventType });
  }
};

export const addCustomAttribute = (
  key: string,
  value: string | number | boolean,
): void => {
  if (!newRelicEnabled) return;

  try {
    const newrelic = require('newrelic');
    newrelic.addCustomAttribute(key, value);
  } catch (error) {
    logger.error('Failed to add New Relic custom attribute', { error, key });
  }
};

export const noticeError = (
  error: Error,
  customAttributes?: Record<string, any>,
): void => {
  if (!newRelicEnabled) return;

  try {
    const newrelic = require('newrelic');
    newrelic.noticeError(error, customAttributes);
  } catch (err) {
    logger.error('Failed to notice error in New Relic', { error: err });
  }
};
