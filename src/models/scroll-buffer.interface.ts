import { Observable } from "rxjs";
import { ScrollPosition } from './scroll-position.interface';

/**
 * Scroll Buffer Object to use in every observer instance
 */
export interface Buffer {
  /**
   * Cache for observables of both positions
   */
  both: {
    [key: number]: Observable<ScrollPosition>;
  };

  /**
   * Cache for observable of x position
   */
  x: {
    [key: number]: Observable<number>;
  };

  /**
   * Cache for observable of x position
   */
  y: {
    [key: number]: Observable<number>;
  };
}