/**
 * Export Interface.
 * This will be exposed to plugins using the core sandboxes.
 * The export will expose a base class for the plugin itself and some useful utils.
 */
export {Sandbox} from './Plugin/Sandbox';


/**
 * This will be used to start the ManiaJS via programmatic method.
 */
export function Start() {
  require('./Boot');
}
