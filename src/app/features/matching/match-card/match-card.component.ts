import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchViewModel } from '../../../models/match';

@Component({
  selector: 'app-match-card',
  standalone: true,
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.css'
})
export class MatchCardComponent {
  @Input({ required: true }) match!: MatchViewModel;
  @Output() viewProfile = new EventEmitter<string>();
  @Output() sendSwapRequest = new EventEmitter<MatchViewModel>();

  get avatarLabel(): string {
    return this.match.userName.charAt(0).toUpperCase();
  }
}