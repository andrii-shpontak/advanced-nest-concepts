import { Controller, Get, Query } from '@nestjs/common';
import { resolve } from 'path';
import Piscina from 'piscina';
// import { FibonacciWorkerHost } from './fibonacci-worker.host';

@Controller('fibonacci')
export class FibonacciController {
  // constructor(private readonly fibonacciWorkerHost: FibonacciWorkerHost) {}
  fibonacciWorker = new Piscina({
    filename: resolve(__dirname, 'fibonacci.worker.js'),
  });

  @Get()
  fibonacci(@Query('n') n = 10) {
    return this.fibonacciWorker.run(n);
    // return this.fibonacciWorkerHost.run(n);
  }
}
