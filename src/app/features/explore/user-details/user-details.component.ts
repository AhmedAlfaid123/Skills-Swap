import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DiscoveryService, UserProfile } from '../../../services/discovery.service';

interface Skill {
  name: string;
  icon: string;
  color: string;
}

const TRACK_ICONS: Record<string, { icon: string; color: string }> = {
  HTML: { icon: 'simple-icons:html5', color: '#E34F26' },
  CSS: { icon: 'simple-icons:css3', color: '#1572B6' },
  JavaScript: { icon: 'simple-icons:javascript', color: '#F0B90B' },
  TypeScript: { icon: 'simple-icons:typescript', color: '#3178C6' },
  React: { icon: 'simple-icons:react', color: '#149ECA' },
  Angular: { icon: 'simple-icons:angular', color: '#DD0031' },
  'Vue.js': { icon: 'simple-icons:vuedotjs', color: '#41B883' },
  Bootstrap: { icon: 'simple-icons:bootstrap', color: '#7952B3' },
  'Tailwind CSS': { icon: 'simple-icons:tailwindcss', color: '#06B6D4' },
  'Node.js': { icon: 'simple-icons:nodedotjs', color: '#339933' },
  Express: { icon: 'simple-icons:express', color: '#000000' },
  MongoDB: { icon: 'simple-icons:mongodb', color: '#47A248' },
  PostgreSQL: { icon: 'simple-icons:postgresql', color: '#4169E1' },
  MySQL: { icon: 'simple-icons:mysql', color: '#4479A1' },
  Docker: { icon: 'simple-icons:docker', color: '#2496ED' },
  Kubernetes: { icon: 'simple-icons:kubernetes', color: '#326CE5' },
  AWS: { icon: 'simple-icons:amazonaws', color: '#FF9900' },
  Firebase: { icon: 'simple-icons:firebase', color: '#DD8113' },
  GraphQL: { icon: 'simple-icons:graphql', color: '#E10098' },
  Python: { icon: 'simple-icons:python', color: '#3776AB' },
  Django: { icon: 'simple-icons:django', color: '#092E20' },
  Git: { icon: 'simple-icons:git', color: '#F05032' },
  Figma: { icon: 'simple-icons:figma', color: '#F24E1E' },
  Redis: { icon: 'simple-icons:redis', color: '#DC382D' },
  'UI/UX Design': { icon: 'lucide:hash', color: '#5F6472' },
  'Product Management': { icon: 'lucide:hash', color: '#5F6472' },
  'Data Analysis': { icon: 'lucide:hash', color: '#5F6472' },
  'Machine Learning': { icon: 'lucide:hash', color: '#5F6472' },
  'Public Speaking': { icon: 'lucide:hash', color: '#5F6472' },
  Copywriting: { icon: 'lucide:hash', color: '#5F6472' }
};


@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserDetailsComponent implements OnInit {
  user: UserProfile | null = null;
  teachSkills: Skill[] = [];
  learnSkills: Skill[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  joinedDate: string = '';

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      this.errorMessage = 'User not found.';
      return;
    }

    this.loading = true;
    this.discoveryService.getUserById(userId).subscribe({
      next: (res) => {
        this.user = res.data;
        if (this.user.createdAt) {
          const date = new Date(this.user.createdAt);
          this.joinedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }

        this.teachSkills = this.getSkills(this.user.skillsToTeach);
        this.learnSkills = this.getSkills(this.user.skillsToLearn);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load this user profile.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackMeta(name: string) {
    return TRACK_ICONS[name] || { icon: 'lucide:hash', color: '#5F6472' };
  }

  getSkills(skillRefs: any[]): Skill[] {
    if (!skillRefs || !Array.isArray(skillRefs)) {
      return [];
    }

    return skillRefs
      .map((ref) => {
        let name = '';
        if (typeof ref === 'string') {
          name = ref;
        } else if (ref.skillName) {
          name = ref.skillName;
        } else if (ref.name) {
          name = ref.name;
        } else if (ref.skillId?.name) {
          name = ref.skillId.name;
        } else if (ref.skillId && typeof ref.skillId === 'string') {
          name = ref.skillId;
        }

        name = name.trim();
        if (!name) return null;

        const meta = this.trackMeta(name);
        return {
          name,
          icon: meta.icon,
          color: meta.color
        };
      })
      .filter((s): s is Skill => s !== null);
  }

  getAvatarLabel(name?: string): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  useDefaultAvatar(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = '/logo.png';
  }

  goBack(): void {
    this.router.navigate(['/explore']);
  }
}
