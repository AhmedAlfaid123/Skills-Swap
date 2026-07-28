import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class profileComponent {
  protected readonly userId: string;

  constructor(private readonly route: ActivatedRoute) {
    this.userId = this.route.snapshot.paramMap.get('id') ?? 'Unknown';
  }
}