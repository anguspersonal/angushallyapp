let calls = 0;

function middleware(_req, _res, _next) {
  calls += 1;
}

middleware.getCalls = () => calls;
middleware.reset = () => {
  calls = 0;
};

module.exports = middleware;
