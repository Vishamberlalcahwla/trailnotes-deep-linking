import { linking } from '../src/navigation/linking';

// The linking config's getStateFromPath is what turns a URL path into
// navigation state. These tests cover the TrailNotes routes and the
// validation that keeps bad input out of TrailScreen.
const toState = (path: string) =>
  linking.getStateFromPath!(path, linking.config as any);

const leaf = (path: string) => {
  const state = toState(path);
  return state?.routes[state.routes.length - 1];
};

describe('TrailNotes linking config', () => {
  it('maps /trail/:id to the Trail screen', () => {
    const route = leaf('trail/42');
    expect(route?.name).toBe('Trail');
    expect(route?.params).toEqual({ id: '42' });
  });

  it('keeps query params such as ?ref=', () => {
    expect(leaf('trail/cedar-falls?ref=newsletter')?.params).toEqual({
      id: 'cedar-falls',
      ref: 'newsletter',
    });
  });

  it('maps /settings to the Settings screen', () => {
    expect(leaf('settings')?.name).toBe('Settings');
  });

  it('sends unknown paths to NotFound', () => {
    expect(leaf('blog/hello')?.name).toBe('NotFound');
  });

  it('rejects trail IDs that fail validation', () => {
    expect(leaf('trail/%3Cscript%3E')?.name).toBe('NotFound');
    expect(leaf('trail/%E0%A4%A')?.name).toBe('NotFound'); // malformed encoding
  });
});
