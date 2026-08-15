import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appReveal]',
    standalone: true
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
    /**
     * Animation direction: 'up' | 'down' | 'left' | 'right'
     */
    @Input() appReveal: 'up' | 'down' | 'left' | 'right' = 'up';

    /**
     * Delay in ms before the animation starts (for staggering siblings)
     */
    @Input() revealDelay: number = 0;

    /**
     * Duration of the animation in ms
     */
    @Input() revealDuration: number = 700;

    /**
     * Distance in px the element travels during reveal
     */
    @Input() revealDistance: number = 40;

    private observer: IntersectionObserver | null = null;

    constructor(
        private el: ElementRef<HTMLElement>,
        private renderer: Renderer2
    ) {}

    ngAfterViewInit(): void {
        const element = this.el.nativeElement;

        // Set initial hidden state
        this.renderer.setStyle(element, 'opacity', '0');
        this.renderer.setStyle(element, 'transform', this.getInitialTransform());
        this.renderer.setStyle(element, 'willChange', 'opacity, transform');

        // Force reflow so the initial hidden state is rendered by the browser
        void element.offsetHeight;

        // Set the CSS transition
        this.renderer.setStyle(
            element,
            'transition',
            `opacity ${this.revealDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${this.revealDelay}ms, transform ${this.revealDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${this.revealDelay}ms`
        );

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Defer setting visible styles to next frame to guarantee animation runs on page refresh
                        requestAnimationFrame(() => {
                            this.renderer.setStyle(element, 'opacity', '1');
                            this.renderer.setStyle(element, 'transform', 'translate3d(0, 0, 0)');
                        });

                        // Clean up will-change after animation completes
                        setTimeout(() => {
                            this.renderer.removeStyle(element, 'willChange');
                        }, this.revealDuration + this.revealDelay + 150);

                        // Unobserve after reveal (animate only once)
                        this.observer?.unobserve(element);
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: '0px 0px -20px 0px'
            }
        );

        this.observer.observe(element);
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
        this.observer = null;
    }

    private getInitialTransform(): string {
        switch (this.appReveal) {
            case 'up':
                return `translate3d(0, ${this.revealDistance}px, 0)`;
            case 'down':
                return `translate3d(0, -${this.revealDistance}px, 0)`;
            case 'left':
                return `translate3d(${this.revealDistance}px, 0, 0)`;
            case 'right':
                return `translate3d(-${this.revealDistance}px, 0, 0)`;
            default:
                return `translate3d(0, ${this.revealDistance}px, 0)`;
        }
    }
}
