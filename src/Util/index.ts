
import {BaseFacade} from './Facade';
import * as times from './Times';
import {App} from '../App';

export module Util {
  export class Facade extends BaseFacade {

    public times = times;
    public gbx = null; // todo

    constructor (
      app: App
    ) {
      super(app);
    }

    public async init() {}
    public async run() {}
    public async stop() {}
  }
}
