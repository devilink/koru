export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface TouchEvents {
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
}

export class TouchManager {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private isLongPress = false;
  
  private events: TouchEvents = {};
  private lastAction: string = 'None';
  private isActive = false;

  public start(events: TouchEvents) {
    this.events = events;
    // Attach to document to capture all touches
    document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.isActive = true;
    console.log('[TouchManager] Started tracking touch events.');
  }

  public stop() {
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchmove', this.handleTouchMove);
    this.clearLongPress();
    this.isActive = false;
    console.log('[TouchManager] Stopped.');
  }

  public getStatus(): string {
    return this.isActive ? 'READY' : 'OFF';
  }

  public getLastAction(): string {
    return this.lastAction;
  }

  private clearLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    this.isLongPress = false;

    this.clearLongPress();
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.lastAction = 'Long Press';
      if (this.events.onLongPress) this.events.onLongPress();
    }, 800); // 800ms for long press
  };

  private handleTouchMove = (e: TouchEvent) => {
    // If they move their finger significantly, it's not a long press anymore
    const touch = e.touches[0];
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      this.clearLongPress();
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    this.clearLongPress();
    
    if (this.isLongPress) return; // Handled by timeout

    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    const duration = Date.now() - this.startTime;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (duration < 500 && Math.max(absDx, absDy) > 30) {
      // It's a swipe
      if (absDx > absDy) {
        const dir = dx > 0 ? 'right' : 'left';
        this.lastAction = `Swipe ${dir}`;
        if (this.events.onSwipe) this.events.onSwipe(dir);
      } else {
        const dir = dy > 0 ? 'down' : 'up';
        this.lastAction = `Swipe ${dir}`;
        if (this.events.onSwipe) this.events.onSwipe(dir);
      }
    } else if (duration < 500 && Math.max(absDx, absDy) < 10) {
      // It's a tap
      this.lastAction = 'Tap';
      if (this.events.onTap) this.events.onTap();
    }
  };
}
