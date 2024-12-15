import { CallHandler } from '@nestjs/common';
import { tap, throwError } from 'rxjs';

const SUCCESS_THRESHOLD = 3;
const FAILURE_THRESHOLD = 3;
const OPEN_TO_HALF_OPEN_WAIT_TIME = 6000;

enum CircuitBreakerState {
  Close,
  Open,
  HalfOpen,
}

export class CircuitBreaker {
  private state = CircuitBreakerState.Close;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastError: Error = new Error();
  private nextAttempt: number = 0;

  exec(next: CallHandler) {
    if (this.state === CircuitBreakerState.Open) {
      if (this.nextAttempt > Date.now()) {
        return throwError(() => this.lastError);
      }
      this.state = CircuitBreakerState.HalfOpen;
    }

    return next.handle().pipe(
      tap({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      }),
    );
  }

  private handleSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitBreakerState.HalfOpen) {
      this.successCount++;

      if (this.successCount >= SUCCESS_THRESHOLD) {
        this.successCount = 0;
        this.state = CircuitBreakerState.Close;
      }
    }
  }

  private handleError(err: Error) {
    this.failureCount++;
    if (
      this.failureCount >= FAILURE_THRESHOLD ||
      this.state === CircuitBreakerState.HalfOpen
    ) {
      this.state = CircuitBreakerState.Open;
      this.lastError = err;
      this.nextAttempt = Date.now() + OPEN_TO_HALF_OPEN_WAIT_TIME;
    }
  }
}
