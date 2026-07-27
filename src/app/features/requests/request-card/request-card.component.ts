import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SwapRequestStatus, SwapRequestSummary } from '../../../models/swap-request';

@Component({
  selector: 'app-request-card',
  standalone: true,
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.css'
})
export class RequestCardComponent {
  @Input({ required: true }) requestSummary!: SwapRequestSummary;
  @Input() viewMode: 'sent' | 'received' = 'sent';
  @Output() accept = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  get status(): SwapRequestStatus {
    return this.requestSummary.request.status;
  }

  get avatarLabel(): string {
    return this.requestSummary.counterpartyName.charAt(0).toUpperCase();
  }

  get statusLabel(): string {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1);
  }

  get canAccept(): boolean {
    return this.viewMode === 'received' && this.status === 'pending';
  }

  get canReject(): boolean {
    return this.viewMode === 'received' && this.status === 'pending';
  }

  get canCancel(): boolean {
    return this.viewMode === 'sent' && this.status === 'pending';
  }

  get badgeClass(): string {
    switch (this.status) {
      case 'accepted':
        return 'status-badge status-accepted';
      case 'rejected':
        return 'status-badge status-rejected';
      case 'cancelled':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge status-pending';
    }
  }
}