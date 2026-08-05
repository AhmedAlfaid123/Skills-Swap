import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

interface HowItStep {
    step: number;
    title: string;
    description: string;
    icon: string;
    image: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface FeatureItem {
    title: string;
    description: string;
    image: string;
}

interface FaqItem {
    question: string;
    answer: string;
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
            title: 'Learn New Skills',
            description: 'Discover skills you want to master and learn directly from experienced peers in our community.',
            image: '/learnsec.png'
        },
        {
            title: 'Share Your Expertise',
            description: 'Offer your knowledge to others, help fellow learners grow, and refine your own skills through teaching.',
            image: '/sharesec.png'
        },
        {
            title: 'Connect & Swap',
            description: 'Find partners with complementary skills, send swap requests, and build meaningful learning connections.',
            image: '/connectsec.png'
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