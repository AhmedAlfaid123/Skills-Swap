import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatchRequestSelection, MatchViewModel } from '../../../models/match';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.css'
})
export class MatchCardComponent implements OnChanges {
  @Input({ required: true }) match!: MatchViewModel;
  @Output() viewProfile = new EventEmitter<string>();
  @Output() sendSwapRequest = new EventEmitter<MatchRequestSelection>();

  protected selectedTeachSkillId = '';
  protected selectedLearnSkillId = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match']) {
      this.selectedTeachSkillId = this.match.learnSkillOptions[0]?.id ?? '';
      this.selectedLearnSkillId = this.match.teachSkillOptions[0]?.id ?? '';
    }
  }

  get avatarLabel(): string {
    return this.match.userName.charAt(0).toUpperCase();
  }

  sendRequest(): void {
    this.sendSwapRequest.emit({
      match: this.match,
      teachSkillId: this.selectedTeachSkillId,
      learnSkillId: this.selectedLearnSkillId
    });
  }
}
