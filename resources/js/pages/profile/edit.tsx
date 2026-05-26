import { Head } from '@inertiajs/react';
import { edit, update } from '@/actions/App/Http/Controllers/Profile/UserProfileController';
import { UserProfileForm } from '@/components/profile/user-profile-form';
import type { MainGoal, SpeakingLevel, UserProfile } from '@/types';

type EditProfileProps = {
    profile: UserProfile | null;
    speakingLevels: SpeakingLevel[];
    mainGoals: MainGoal[];
};

export default function EditProfile({
    profile,
    speakingLevels,
    mainGoals,
}: EditProfileProps) {
    return (
        <>
            <Head title="Edit speaking profile" />

            <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 max-w-3xl">
                        <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                            Profile
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                            Edit your speaking profile
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Update your coaching preferences as your speaking
                            goals evolve.
                        </p>
                    </div>

                    <UserProfileForm
                        profile={profile}
                        speakingLevels={speakingLevels}
                        mainGoals={mainGoals}
                        submitAction={update()}
                        submitLabel="Save profile"
                        intro="Keep this current so practice prompts and feedback stay aligned with your goals."
                    />
                </div>
            </div>
        </>
    );
}

EditProfile.layout = {
    breadcrumbs: [
        {
            title: 'Edit speaking profile',
            href: edit(),
        },
    ],
};
