
declare module 'gbxremote' {
  import {EventEmitter} from 'events';

  export interface Client extends EventEmitter {
    constructor (port: number, address: string);

    connect (): Promise<any>;

    query (name: string, params?: any[]): Promise<any>;
  }
  export function createClient (port, host): Client;
}
