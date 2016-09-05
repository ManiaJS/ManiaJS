/**
 * Inject (core) plugin.
 * @param list
 * @param options
 * @return {(target:any)}
 * @constructor
 */
export function Inject (list: string[] | any[], options?: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptorMap) {
    descriptor['inject'] = list;
    console.log(target);
    // TODO
  }
}
