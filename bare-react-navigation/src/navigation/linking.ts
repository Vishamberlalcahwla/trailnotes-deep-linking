import { Linking } from 'react-native';
import {
  LinkingOptions,
  getStateFromPath as defaultGetStateFromPath,
} from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { isValidTrailId } from '../utils/validation';

/**
 * Every URL root this app answers to.
 * Replace https://trailnotes.app with a domain you control before
 * enabling Universal Links / App Links.
 */
export const PREFIXES = ['trailnotes://', 'https://trailnotes.app'];

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: PREFIXES,

  config: {
    screens: {
      Home: '',
      Trail: {
        path: 'trail/:id',
        parse: { id: (id: string) => decodeURIComponent(id) },
      },
      Settings: 'settings',
      NotFound: '*',
    },
  },

  // Reject anything that doesn't look like a real trail ID.
  getStateFromPath(path, options) {
    const match = path.match(/^\/?trail\/([^/?#]+)/);
    if (match) {
      let raw = match[1];
      try {
        raw = decodeURIComponent(raw);
      } catch {
        // Malformed percent-encoding: fall through to NotFound.
        return defaultGetStateFromPath('not-found', options);
      }
      if (!isValidTrailId(raw)) {
        return defaultGetStateFromPath('not-found', options);
      }
    }
    return defaultGetStateFromPath(path, options);
  },

  // Cold start: the URL that launched the app (null if none).
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (__DEV__ && url) {
      console.log('[TrailNotes] initial URL:', url);
    }
    return url;
  },

  // Warm start: URLs that arrive while the app is running.
  subscribe(listener) {
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (__DEV__) {
        console.log('[TrailNotes] incoming URL:', url);
      }
      listener(url);
    });
    return () => sub.remove(); // cleanup on unmount
  },
};
