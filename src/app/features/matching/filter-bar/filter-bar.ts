import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterOption } from '../../../models/match';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css'
})
export class FilterBarComponent {
  @Input() searchTerm = '';
  @Input() selectedTrack = 'all';
  @Input() selectedSkill = 'all';
  @Input() trackOptions: FilterOption[] = [];
  @Input() skillOptions: FilterOption[] = [];

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() selectedTrackChange = new EventEmitter<string>();
  @Output() selectedSkillChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();
}
