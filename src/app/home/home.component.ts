import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

interface HowItStep {
    step: number;
    title: string;
    description: string;
    icon: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface FeatureItem {
    title: string;
    description: string;
    icon: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterModule, CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class homeComponent {
    isLoggedIn: boolean = false;

    constructor() {
        if (localStorage.getItem('token')) {
            this.isLoggedIn = true;
        } else {
            this.isLoggedIn = false;
        }
    }

    features: FeatureItem[] = [
        {
            title: 'Meaningful Skill Swap',
            description: 'Show your skills and learn new ones from other people.',
            icon: 'mdi:swap-horizontal'
        },
        {
            title: 'Continuous Growth',
            description: 'Be part of a community focused on learning and personal development.',
            icon: 'mdi:trending-up'
        },
        {
            title: 'Global Community',
            description: 'Connect with learners and experts from around the world.',
            icon: 'mdi:earth'
        }
    ];

    howItSteps: HowItStep[] = [
        {
            step: 1,
            title: 'Create Your Profile',
            description: 'Sign up and tell us what skills you can teach and what you want to learn.',
            icon: 'mdi:account-plus-outline'
        },
        {
            step: 2,
            title: 'Discover Matches',
            description: 'Browse the community to find people with complementary skills.',
            icon: 'mdi:magnify'
        },
        {
            step: 3,
            title: 'Swap & Grow',
            description: 'Send a swap request, connect with your match, and start learning together.',
            icon: 'mdi:handshake-outline'
        }
    ];

    faqs: FaqItem[] = [
        {
            question: 'How do I get started?',
            answer: 'Create an account, fill out your profile with the skills you can teach and want to learn, then start exploring matches.'
        },
        {
            question: 'Is Skill Swap free to use?',
            answer: 'Yes, Skill Swap is completely free. We believe knowledge should be shared freely.'
        },
        {
            question: 'How are matches determined?',
            answer: 'Our algorithm finds users whose skills complement yours - people who can teach what you want to learn and want to learn what you teach.'
        },
        {
            question: 'Can I connect with anyone on the platform?',
            answer: 'You can send swap requests to any user whose skills interest you. They can accept or decline your request.'
        }
    ];

    expandedIndex: number | null = null;

    toggleFaq(index: number): void {
        this.expandedIndex = this.expandedIndex === index ? null : index;
    }
}