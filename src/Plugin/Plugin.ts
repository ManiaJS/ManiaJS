
import {EventEmitter} from 'events';


export abstract class Plugin extends EventEmitter {

  public constructor () {
    super();
    super.setMaxListeners(0);
  }

}
