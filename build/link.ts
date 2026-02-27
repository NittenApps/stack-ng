import { exec, PACKAGES } from './util';

PACKAGES.forEach((name) => {
  const pkgPath = `${__dirname}/../dist/nittenapps/${name}`;

  exec(`cd ${pkgPath} && npm link`);
});
