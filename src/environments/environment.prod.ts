import { IEnvironment } from './environment.interface';
import { Capacitor } from '@capacitor/core';

export const environment: IEnvironment = {
  production: true,
  web: Capacitor.platform === 'web',
  API_OSRS_TRACKER: 'https://api.greendemon.io/osrs-tracker-next'
};
