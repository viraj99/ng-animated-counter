import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription, timer, Subject } from 'rxjs';
import { mapTo, scan, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { NgAnimatedCounterParams } from './ng-animated-counter-params';

@Component({
  selector: 'ng-animated-counter',
  templateUrl: 'ng-animated-counter.component.html',
  styleUrls: ['ng-animated-counter.component.scss']
})
export class NgAnimatedCounter implements OnDestroy {
  @Input() set params(value: NgAnimatedCounterParams) {
    if (this._counterSubscription) {
      this._counterSubscription.unsubscribe();
    }

    this.current = value.start;
    this._counterSubscription = this._counterSubject$
      .pipe(
        switchMap(end => {
          return timer(0, value.interval)
            .pipe(
              mapTo(this.positiveOrNegative(end, this.current)),
              startWith(this.current),
              scan((acc: number, curr: number) => acc + curr),
              takeWhile(this.isApproachingRange(end, this.current))
            )
        })
      )
      .subscribe((val: number) => this.current = val);
      
    this._counterSubject$.next(value.end);
  }

  public current: number = 0;

  private _counterSubject$: Subject<number> = new Subject();
  private _counterSubscription: Subscription;

  ngOnDestroy(): void {
    if (this._counterSubscription) {
      this._counterSubscription.unsubscribe();
    }
  }

  private positiveOrNegative(endRange, currentNumber): number {
    return endRange > currentNumber ? 1 : -1;
  }

  private isApproachingRange(endRange, currentNumber): (val: number) => boolean {
    return endRange > currentNumber
      ? val => val <= endRange
      : val => val >= endRange;
  }
}