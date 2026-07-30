import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProfileData {
  name: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  languages: string;
  availability: string;
  joinedDate: string;
  avatarUrl: string;
  githubUrl: string;
  twitterUrl: string;
  discordUrl: string;
  linkedinUrl: string;
}

interface Skill {
  name: string;
  icon: string;
  color: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
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

const LEVEL_PCT: Record<string, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileComponent {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  profile: ProfileData = {
    name: '',
    title: '',
    location: '',
    bio: '',
    email: '',
    phone: '',
    languages: '',
    availability: 'Evenings & Weekends',
    joinedDate: '',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=1A73E8&textColor=ffffff',
    githubUrl: '',
    twitterUrl: '',
    discordUrl: '',
    linkedinUrl: ''
  };

  availabilityOptions = ['Evenings & Weekends', 'Weekdays', 'Flexible', 'Weekends Only'];

  stats: Stat[] = [
    { label: 'Skills', value: 0, icon: 'lucide:target', iconBg: '#EAF1FF', iconColor: '#1A73E8' },
    { label: 'Swaps', value: 0, icon: 'lucide:handshake', iconBg: '#EAFBF3', iconColor: '#0F9D58' },
    { label: 'Learning', value: 0, icon: 'lucide:book-open', iconBg: '#F3EEFF', iconColor: '#6C5CE7' }
  ];

  rating = 0;

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

  private profileSnapshot!: ProfileData;
  private teachSnapshot: Skill[] = [];
  private learnSnapshot: Skill[] = [];

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

  levelPercent(level?: string): number {
    return level ? LEVEL_PCT[level] : 0;
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
    if (!this.hasProfileChanges) return;
    this.isSavingProfile = true;
    setTimeout(() => {
      this.isSavingProfile = false;
      this.isEditingProfile = false;
      this.showToast('Profile updated successfully');
    }, 900);
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
    setTimeout(() => {
      this.isSavingSkills = false;
      this.isEditingSkills = false;
      this.stats[0].value = this.teachSkills.length;
      this.showToast('Skills updated successfully');
    }, 900);
  }

  addTeachSkill(name: string): void {
    const meta = this.trackMeta(name);
    this.teachSkills.push({ name, icon: meta.icon, color: meta.color, level: 'Intermediate' });
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
      this.profile.avatarUrl = reader.result as string;
      this.showToast('Profile picture updated');
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    const seed = encodeURIComponent(this.profile.name || 'User');
    this.profile.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=1A73E8&textColor=ffffff`;
    this.closeAvatarMenu();
    this.showToast('Profile picture removed');
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