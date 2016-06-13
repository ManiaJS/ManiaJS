
import {createLogger, Logger as Bunyan} from 'bunyan';
import PrettyStream = require('bunyan-prettystream');

export class Logger {
  private bunyan: Bunyan;
  private pretty: PrettyStream;

  public log: Bunyan;

  constructor () {
    this.pretty = new PrettyStream();
    this.pretty.pipe(process.stdout);

    this.bunyan = createLogger({
      name: 'maniajs',
      streams: [
        {
          level: 'debug',
          type: 'raw',
          stream: this.pretty
        },
        {
          level: 'info',
          path: __dirname + '/../../log/application.log'
        }
      ]
    });

    this.log = this.bunyan;
  }
}
