import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../models/user';

interface Skill {
  name: string;
  icon: string;
  color: string;
}

interface Stat {
  label: string;
  value: number;
  icon: string;
  iconBg: string;
  iconColor: string;
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
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileComponent implements OnInit {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  profile: User = {
    name: '',
    bio: '',
    email: '',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=1A73E8&textColor=ffffff',
    skillsToTeach: [],
    skillsToLearn: [],
    joinedDate: ''
  };

  stats: Stat[] = [
    { label: 'Skills to Teach', value: 0, icon: 'lucide:target', iconBg: '#EAF1FF', iconColor: '#1A73E8' },
    { label: 'Skills to Learn', value: 0, icon: 'lucide:book-open', iconBg: '#F3EEFF', iconColor: '#6C5CE7' }
  ];

  teachSkills: Skill[] = [];
  learnSkills: Skill[] = [];

  isEditingProfile = false;
  isEditingSkills = false;
  isSavingProfile = false;
  isSavingSkills = false;
  showAvatarMenu = false;

  teachSearchQuery = '';
  learnSearchQuery = '';
  teachDropdownOpen = false;
  learnDropdownOpen = false;

  toastVisible = false;
  toastMessage = '';

  private profileSnapshot!: User;
  private teachSnapshot: Skill[] = [];
  private learnSnapshot: Skill[] = [];

  constructor(
    private service: ProfileService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getProfileData();
  }

  getProfileData(): void {
    this.service.getProfileData().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.profile = {
          ...this.profile,
          ...data,
          skillsToTeach: data?.skillsToTeach ?? [],
          skillsToLearn: data?.skillsToLearn ?? []
        };
        this.teachSkills = this.getSkills(this.profile.skillsToTeach);
        this.learnSkills = this.getSkills(this.profile.skillsToLearn);
        this.profileSnapshot = { ...this.profile };
        this.stats[0].value = this.profile.skillsToTeach.length;
        this.stats[1].value = this.profile.skillsToLearn.length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('Unable to load profile data');
        this.cdr.detectChanges();
      }
    });
  }

  get teachSuggestions(): string[] {
    return this.filterTracks(this.teachSearchQuery, this.teachSkills);
  }

  get learnSuggestions(): string[] {
    return this.filterTracks(this.learnSearchQuery, this.learnSkills);
  }

  get hasProfileChanges(): boolean {
    return !!this.profileSnapshot && JSON.stringify(this.profile) !== JSON.stringify(this.profileSnapshot);
  }

  trackMeta(name: string) {
    return TRACK_ICONS[name] || { icon: 'lucide:hash', color: '#5F6472' };
  }


  enterProfileEdit(): void {
    this.profileSnapshot = { ...this.profile };
    this.isEditingProfile = true;
  }

  cancelProfileEdit(): void {
    this.profile = { ...this.profileSnapshot };
    this.isEditingProfile = false;
  }

  saveProfileEdit(): void {
    if (!this.hasProfileChanges) {
      this.isEditingProfile = false;
      return;
    }

    this.isSavingProfile = true;
    this.service.updateProfile({
      name: this.profile.name,
      bio: this.profile.bio,
      avatarUrl: this.profile.avatarUrl
    }).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.profile = {
          ...this.profile,
          ...data,
          skillsToTeach: this.profile.skillsToTeach,
          skillsToLearn: this.profile.skillsToLearn
        };
        this.profileSnapshot = { ...this.profile };
        this.isSavingProfile = false;
        this.isEditingProfile = false;
        this.showToast('Profile updated successfully');
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSavingProfile = false;
        this.showToast('Profile update failed');
        this.cdr.detectChanges();
      }
    });
  }

  enterSkillsEdit(): void {
    this.teachSnapshot = this.teachSkills.map(s => ({ ...s }));
    this.learnSnapshot = this.learnSkills.map(s => ({ ...s }));
    this.isEditingSkills = true;
  }

  cancelSkillsEdit(): void {
    this.teachSkills = this.teachSnapshot.map(s => ({ ...s }));
    this.learnSkills = this.learnSnapshot.map(s => ({ ...s }));
    this.isEditingSkills = false;
  }

  confirmSkillsEdit(): void {
    this.isSavingSkills = true;

    const payload = {
      skillsToTeach: this.teachSkills.map(skill => skill.name),
      skillsToLearn: this.learnSkills.map(skill => skill.name)
    };

    this.service.updateSkills(payload).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        this.profile.skillsToTeach = data.skillsToTeach ?? this.profile.skillsToTeach;
        this.profile.skillsToLearn = data.skillsToLearn ?? this.profile.skillsToLearn;
        this.teachSkills = this.getSkills(this.profile.skillsToTeach);
        this.learnSkills = this.getSkills(this.profile.skillsToLearn);
        this.profileSnapshot = { ...this.profile };
        this.stats[0].value = this.teachSkills.length;
        this.stats[1].value = this.learnSkills.length;
        this.isSavingSkills = false;
        this.isEditingSkills = false;
        this.showToast('Skills updated successfully');
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSavingSkills = false;
        this.showToast('Failed to save skills');
        this.cdr.detectChanges();
      }
    });
  }

  addTeachSkill(name: string): void {
    const meta = this.trackMeta(name);
    this.teachSkills.push({ name, icon: meta.icon, color: meta.color });
    this.teachSearchQuery = '';
    this.teachDropdownOpen = false;
  }

  removeTeachSkill(name: string): void {
    this.teachSkills = this.teachSkills.filter(s => s.name !== name);
  }

  addLearnSkill(name: string): void {
    const meta = this.trackMeta(name);
    this.learnSkills.push({ name, icon: meta.icon, color: meta.color });
    this.learnSearchQuery = '';
    this.learnDropdownOpen = false;
  }

  removeLearnSkill(name: string): void {
    this.learnSkills = this.learnSkills.filter(s => s.name !== name);
  }

  toggleAvatarMenu(): void {
    this.showAvatarMenu = !this.showAvatarMenu;
  }

  closeAvatarMenu(): void {
    this.showAvatarMenu = false;
  }

  triggerAvatarUpload(): void {
    this.avatarInput.nativeElement.click();
    this.closeAvatarMenu();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.profile = { ...this.profile, avatarUrl: reader.result as string };
      this.showToast('Profile picture updated');
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    const seed = encodeURIComponent(this.profile.name || 'User');
    this.profile = { ...this.profile, avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=1A73E8&textColor=ffffff` };
    this.closeAvatarMenu();
    this.showToast('Profile picture removed');
    this.cdr.detectChanges();
  }

  shareProfile(): void {
    const url = this.profileUrl();
    const nav = navigator as Navigator & { share?: (data: { title: string; url: string }) => Promise<void> };
    if (nav.share) {
      nav.share({ title: this.profile.name, url }).catch(() => { });
    } else {
      this.showToast('Share link ready to copy');
    }
  }

  copyProfileLink(): void {
    const url = this.profileUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => this.showToast('Profile link copied'),
        () => this.showToast('Profile link copied')
      );
    } else {
      this.showToast('Profile link copied');
    }
  }

  private filterTracks(query: string, existing: Skill[]): string[] {
    const q = query.trim().toLowerCase();
    const existingNames = existing.map(s => s.name);
    return Object.keys(TRACK_ICONS)
      .filter(t => !existingNames.includes(t) && t.toLowerCase().includes(q))
      .slice(0, 8);
  }

  private getSkills(skillRefs: any[]): Skill[] {
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
        } else if (ref.skillId) {
          name = typeof ref.skillId === 'string' ? ref.skillId : ref.skillId.name || '';
        }

        if (!name) {
          return null;
        }

        const meta = this.trackMeta(name);
        return { name, icon: meta.icon, color: meta.color };

      }).filter((skill): skill is Skill => !!skill);
  }

  private profileUrl(): string {
    const slug = this.profile.name.trim().toLowerCase().replace(/\s+/g, '-') || 'user';
    return `${window.location.origin}/u/${slug}`;
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2800);
  }
}