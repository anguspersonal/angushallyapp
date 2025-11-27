describe('loadRoute', () => {
  let loadRoute;

  beforeEach(() => {
    jest.resetModules();
    ({ loadRoute } = require('../bootstrap/routes'));
  });

  test('returns express routers without invoking them', () => {
    const routerPath = '../tests/fixtures/dummyRouter';
    jest.resetModules();
    const router = require('./fixtures/dummyRouter');
    router.reset();

    const loadedRoute = loadRoute(routerPath);

    expect(loadedRoute).toBe(router);
    expect(router.getCalls()).toBe(0);
  });

  test('invokes factory functions with dependencies', () => {
    const deps = { example: true };
    const route = loadRoute('../tests/fixtures/routeFactory', deps);

    expect(route).toEqual({ name: 'factoryRoute', deps });
  });
});
