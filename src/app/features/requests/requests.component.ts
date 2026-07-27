import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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

  constructor(private readonly requestService: RequestService) {}

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
        },
        error: () => {
          this.sentLoading = false;
          this.sentError = 'We could not load sent requests right now.';
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
        },
        error: () => {
          this.receivedLoading = false;
          this.receivedError = 'We could not load received requests right now.';
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
          this.showToast('Swap request accepted.');
        },
        error: () => {
          this.receivedError = 'We could not accept that request. Please try again.';
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
          this.showToast('Swap request rejected.');
        },
        error: () => {
          this.receivedError = 'We could not reject that request. Please try again.';
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
          this.showToast('Swap request cancelled.');
        },
        error: () => {
          this.sentError = 'We could not cancel that request. Please try again.';
        }
      });
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;

    window.setTimeout(() => {
      this.toastVisible = false;
    }, 2800);
  }
}
