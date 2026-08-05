import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RequestCardComponent } from './request-card/request-card.component';
import { RequestService } from './request.service';
import { SwapRequestSummary } from '../../models/swap-request';


@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, RequestCardComponent],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css'
})
export class RequestsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  protected activeTab: 'sent' | 'received' = 'sent';
  protected sentRequests: SwapRequestSummary[] = [];
  protected receivedRequests: SwapRequestSummary[] = [];
  protected sentLoading = true;
  protected receivedLoading = true;
  protected sentError = '';
  protected receivedError = '';
  protected toastMessage = '';
  protected toastVisible = false;

  constructor(
    private readonly requestService: RequestService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSentRequests();
    this.loadReceivedRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: 'sent' | 'received'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  loadSentRequests(): void {
    this.sentLoading = true;
    this.sentError = '';

    this.requestService
      .getSentRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.sentRequests = requests;
          this.sentLoading = false;
          this.sentError = '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.sentLoading = false;
          this.sentError = this.getErrorMessage(error, 'We could not load sent requests right now.');
          this.cdr.detectChanges();
        }
      });
  }

  loadReceivedRequests(): void {
    this.receivedLoading = true;
    this.receivedError = '';

    this.requestService
      .getReceivedRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.receivedRequests = requests;
          this.receivedLoading = false;
          this.receivedError = '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.receivedLoading = false;
          this.receivedError = this.getErrorMessage(error, 'We could not load received requests right now.');
          this.cdr.detectChanges();
        }
      });
  }

  retryCurrentTab(): void {
    if (this.activeTab === 'sent') {
      this.loadSentRequests();
      return;
    }

    this.loadReceivedRequests();
  }

  acceptRequest(requestId: string): void {
    this.requestService
      .acceptRequest(requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.receivedRequests = this.receivedRequests.map((requestSummary) =>
            requestSummary.request._id === requestId
              ? { ...requestSummary, request: { ...requestSummary.request, status: 'accepted' } }
              : requestSummary
          );
          this.receivedError = '';
          this.showToast('Swap request accepted.');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.receivedError = this.getErrorMessage(error, 'We could not accept that request. Please try again.');
          this.cdr.detectChanges();
        }
      });
  }

  rejectRequest(requestId: string): void {
    this.requestService
      .rejectRequest(requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.receivedRequests = this.receivedRequests.map((requestSummary) =>
            requestSummary.request._id === requestId
              ? { ...requestSummary, request: { ...requestSummary.request, status: 'rejected' } }
              : requestSummary
          );
          this.receivedError = '';
          this.showToast('Swap request rejected.');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.receivedError = this.getErrorMessage(error, 'We could not reject that request. Please try again.');
          this.cdr.detectChanges();
        }
      });
  }

  cancelRequest(requestId: string): void {
    this.requestService
      .cancelRequest(requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.sentRequests = this.sentRequests.map((requestSummary) =>
            requestSummary.request._id === requestId
              ? { ...requestSummary, request: { ...requestSummary.request, status: 'cancelled' } }
              : requestSummary
          );
          this.sentError = '';
          this.showToast('Swap request cancelled.');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.sentError = this.getErrorMessage(error, 'We could not cancel that request. Please try again.');
          this.cdr.detectChanges();
        }
      });
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    this.cdr.detectChanges();

    window.setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 2800);
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const responseError = (error as { error?: { message?: unknown } }).error;
      if (typeof responseError?.message === 'string' && responseError.message.trim().length > 0) {
        return responseError.message;
      }
    }

    return fallbackMessage;
  }
}