/**
 * Export Interface.
 * This will be exposed to plugins using the core sandboxes.
 * The export will expose a base class for the plugin itself and some useful utils.
 */
export {Sandbox} from './Plugin/Sandbox';
export {Plugin} from './Plugin/Plugin';

/**
 * Use Start for starting ManiaJS programmatically.
 */
export function Start() {
  require('./Boot');
}
