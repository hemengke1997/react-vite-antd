import { useEffect, useRef, useState } from 'react';

interface NProgressOptions {
  animationDuration?: number;
  incrementDuration?: number;
  isAnimating?: boolean;
  minimum?: number;
}

const Settings: NProgressOptions = {
  minimum: 0.08,
  incrementDuration: 200,
  animationDuration: 200,
};

type Next = () => void;

type Fn = (next: Next) => void;

class NProgress {
  settings: NProgressOptions;
  status: number | null = null;
  isFinished: boolean = false;
  progress: number = 0;

  private pending: Fn[] = [];
  private workTimeout: NodeJS.Timeout | null = null;
  private endTimeout: NodeJS.Timeout | null = null;
  private nextTimeout: NodeJS.Timeout | null = null;

  constructor(options?: NProgressOptions) {
    this.settings = this.configure(options);
  }

  private clamp(n: number, min: number, max: number) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  private queue = (() => {
    const next = () => {
      const fn = this.pending.shift();
      if (fn) {
        fn(next);
      }
    };

    return (fn: Fn) => {
      this.pending.push(fn);
      if (this.pending.length === 1) next();
    };
  })();

  /** @name 配置NProgress */
  configure(options?: Partial<NProgressOptions>) {
    for (let key in options) {
      const value = options[key];
      if (value !== undefined && options.hasOwnProperty(key))
        Settings[key] = value;
    }
    return Settings;
  }

  /** @name 设置progress */
  set(n: number) {
    const { animationDuration, minimum } = this.settings;

    n = this.clamp(n, minimum!, 1);

    this.setProgress(n);

    this.status = n === 1 ? null : n;

    this.queue((next) => {
      if (n === 1) {
        this.endTimeout = setTimeout(() => {
          this.nextTimeout = setTimeout(() => {
            this.setIsFinished(true);
            this.clearup();
          }, animationDuration);
        }, animationDuration);
      } else {
        this.nextTimeout = setTimeout(() => {
          next();
        }, animationDuration);
      }
    });

    return this;
  }

  clearup() {
    clearTimeout(this.endTimeout as NodeJS.Timeout);
    clearTimeout(this.workTimeout as NodeJS.Timeout);
    clearTimeout(this.nextTimeout as NodeJS.Timeout);
  }

  setIsFinished(f: boolean) {
    this.isFinished = f;
    return this;
  }

  setProgress(n: number) {
    this.progress = n;
    return this;
  }

  trickle() {
    return this.inc();
  }

  /** @name 开始NProgress */
  start() {
    if (!this.status) {
      this.clearup();
      this.setIsFinished(false);
      this.set(0);
    }

    const work = () => {
      this.workTimeout = setTimeout(() => {
        if (!this.status) return;
        this.trickle();
        work();
      }, this.settings.incrementDuration);
    };

    work();

    return this;
  }

  /** @name 结束NProgress */
  done() {
    if (!this.status) return this;

    return this.inc(0.3 + 0.5 * Math.random())?.set(1);
  }

  /** @description Increments by a random amount. */
  inc(amount?: number | undefined) {
    let n = this.status;

    if (!n) {
      return this.start();
    } else if (n > 1) {
      return;
    } else {
      if (typeof amount !== 'number') {
        if (n >= 0 && n < 0.2) {
          amount = 0.1;
        } else if (n >= 0.2 && n < 0.5) {
          amount = 0.04;
        } else if (n >= 0.5 && n < 0.8) {
          amount = 0.02;
        } else if (n >= 0.8 && n < 0.99) {
          amount = 0.005;
        } else {
          amount = 0;
        }
      }

      n = this.clamp(n + amount, 0, 0.994);

      return this.set(n);
    }
  }
}

function useNProgress({
  animationDuration = 200,
  incrementDuration = 2000,
  isAnimating = false,
  minimum = 0.08,
}: NProgressOptions = {}) {
  const nprogressRef = useRef<NProgress>();
  const setProgressRef = useRef<NProgress['set']>();
  const setIsFinishedRef = useRef<NProgress['setIsFinished']>();

  const [value, setValue] = useState<number>();

  const [isFinished, setIsFinished] = useState<boolean>(!isAnimating || false);

  useEffect(() => {
    nprogressRef.current = new NProgress({
      animationDuration,
      incrementDuration,
      minimum,
    });
    setProgressRef.current = nprogressRef.current.setProgress;
    setIsFinishedRef.current = nprogressRef.current.setIsFinished;
    nprogressRef.current.setProgress = (n: number) => {
      setValue(n);
      return setProgressRef.current!.call(nprogressRef.current, n);
    };
    nprogressRef.current.setIsFinished = (f: boolean) => {
      setIsFinished(f);
      return setIsFinishedRef.current!.call(nprogressRef.current, f);
    };
  }, []);

  useEffect(() => {
    if (isAnimating) {
      nprogressRef.current?.start();
    } else {
      nprogressRef.current?.done();
    }
  }, [isAnimating]);

  return {
    isFinished,
    progress: value,
    animationDuration,
    incrementDuration,
  };
}

export default useNProgress;
