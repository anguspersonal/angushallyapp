let calls = 0;

function dummyRouter() {
  calls += 1;
}

dummyRouter.use = () => {};
dummyRouter.stack = [];
dummyRouter.getCalls = () => calls;
dummyRouter.reset = () => {
  calls = 0;
};

module.exports = dummyRouter;
