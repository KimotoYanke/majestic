import { getItBlocks } from './util';
import { ItBlock } from './types/ItBlock';
import { Config } from './types/Config';
const chokidar = require('chokidar');

export default class Watcher {
  public watcher: any;
  public onAddHandler: (path: string) => void = () => ({});
  public onDeleteHandler: (path: string) => void = () => ({});
  public onChangeHandler: (
    path: string,
    itBlocks?: ItBlock[]
  ) => void = () => ({});

  constructor(root: string, { jest: { modulePathIgnorePatterns } }: Config) {
    const ignoredPaths = [
      'node_modules',
      '.git',
      ...(modulePathIgnorePatterns ? modulePathIgnorePatterns : [])
    ];

    this.watcher = chokidar.watch(root, {
      ignored: new RegExp(ignoredPaths.join('|')),
      ignoreInitial: true
    });

    this.watcher
      .on('add', (path: string) => {
        this.onAddHandler(path);
      })
      .on('change', (path: string) => {
        try {
          this.onChangeHandler(path, getItBlocks(path));
        } catch (e) {
          this.onChangeHandler(path);
        }
      })
      .on('unlink', (path: string) => {
        this.onDeleteHandler(path);
      });
  }

  public handlers(
    onAdd: (path: string) => void,
    onDelete: (path: string) => void,
    onChange: (path: string, itBlocks?: ItBlock[]) => void
  ) {
    this.onChangeHandler = onChange;
    this.onAddHandler = onAdd;
    this.onDeleteHandler = onDelete;
  }
}
