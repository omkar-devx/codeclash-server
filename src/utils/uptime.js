import { setInterval } from 'node:timers';

class ServerStartTime {
  startTime = 0;

  constructor() {
    setInterval(() => {
      this.startTime += 1;
    }, 1000);
  }

  getStartTime() {
    return this.startTime;
  }
}

export const serverStartTimeInstance = new ServerStartTime();
