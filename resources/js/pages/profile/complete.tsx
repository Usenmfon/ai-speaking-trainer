import { Head } from '@inertiajs/react';
import { create, store } from '@/actions/App/Http/Controllers/Profile/UserProfileController';
import { UserProfileForm } from '@/components/profile/user-profile-form';
import type { MainGoal, SpeakingLevel, UserProfile } from '@/types';

type CompleteProfileProps = {
    profile: UserProfile | null;
    speakingLevels: SpeakingLevel[];
    mainGoals: MainGoal[];
};

export default function CompleteProfile({
    profile,
    speakingLevels,
    mainGoals,
}: CompleteProfileProps) {
    return (
        <>
            <Head title="Complete profile" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 max-w-3xl">
                        <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                            Onboarding
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                            Complete your speaking profile
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Help your AI coach understand your current level,
                            goals, and language preferences before your first
                            dashboard session.
                        </p>
                    </div>

                    <UserProfileForm
                        profile={profile}
                        speakingLevels={speakingLevels}
                        mainGoals={mainGoals}
                        submitAction={store()}
                        submitLabel="Complete profile"
                        intro="This only takes a minute and sets up your personalized speaking coach."
                    />
                </div>
            </div>
        </>
    );
}

CompleteProfile.layout = {
    breadcrumbs: [
        {
            title: 'Complete profile',
            href: create(),
        },
    ],
};
