const fs = require('fs');
const path = require('path');

function attachNext(app) {
  const NEXT_UI_DIR = path.join(__dirname, '..', '..', 'next-ui');
  const nextBuildDir = path.join(NEXT_UI_DIR, '.next');
  const nextPublicDir = path.join(NEXT_UI_DIR, 'public');

  console.log('🔎 Server start diagnostics ⬇');
  console.log('  __dirname      :', __dirname);
  console.log('  NEXT_UI_DIR    :', NEXT_UI_DIR);
  console.log('  nextBuildDir   :', nextBuildDir);
  console.log('  nextPublicDir  :', nextPublicDir);
  console.log('  build exists?  :', fs.existsSync(nextBuildDir));
  console.log('  public exists? :', fs.existsSync(nextPublicDir));

  if (!fs.existsSync(nextBuildDir)) {
    console.warn('⚠️  .next folder missing – SSR routes disabled');
    return;
  }

  const next = require('next');
  const nextApp = next({ dev: false, dir: NEXT_UI_DIR });

  nextApp
    .prepare()
    .then(() => {
      app.all('*', (req, res) => nextApp.getRequestHandler()(req, res));
      console.log('✅ Next.js prepared – all routes now handled by Next');
    })
    .catch((err) => {
      console.error('❌ Next.js prepare() failed:', err);
    });
}

module.exports = { attachNext };
