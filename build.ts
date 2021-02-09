import * as del from 'del';
import * as fs from 'fs';
import { copySync } from 'fs-extra';
import { ngPackagr } from 'ng-packagr';
import * as sass from 'sass';
import { join } from 'path';

async function main() {
  // cleanup dist
  try {
    del.sync(join(process.cwd(), '/dist'));
    del.sync(join(process.cwd(), '/node_modules/@nutrify/ngx-simple-spinner'));
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.info('Ignoring: Could not delete previous build.');
  }

  await ngPackagr()
    .forProject(join(process.cwd(), 'projects/simple-spinner/package.json'))
    .build();

  // put it in node modules so the path resolves
  // proper path support eventually
  copySync(
    join(process.cwd(), 'README.md'),
    join(process.cwd(), '/dist/simple-spinner/README.md')
  );
  copySync(
    join(process.cwd(), 'LICENSE'),
    join(process.cwd(), '/dist/simple-spinner/LICENSE')
  );
  copySync(
    join(process.cwd(), 'projects/simple-spinner/src/lib/styles.scss'),
    join(process.cwd(), '/dist/simple-spinner/scss/styles.scss')
  );

  // Copy SCSS and create CSS file
  const cssDir = join(process.cwd(), '/dist/simple-spinner/css');
  const scssFile = join(process.cwd(), 'projects/simple-spinner/src/lib/styles.scss');
  const cssOutFile = cssDir + '/styles.css';

  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir);
  }

  sass.render({
    file: scssFile,
    outFile: cssOutFile
  }, (error: any, result: any) => {
    if (!error) {
      fs.writeFile(cssOutFile, result.css, () => {});
    }
  });

  copySync(
    join(process.cwd(), '/dist/simple-spinner'),
    join(process.cwd(), '/node_modules/@nutrify/ngx-simple-spinner')
  );
}

main()
  .then(() => console.log('success'))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
