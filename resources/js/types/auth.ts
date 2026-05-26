export type SpeakingLevel = 'beginner' | 'intermediate' | 'advanced';

export type MainGoal =
    | 'public_speaking'
    | 'interviews'
    | 'presentations'
    | 'storytelling'
    | 'confidence'
    | 'pronunciation';

export type UserProfile = {
    id: string;
    user_id: number;
    full_name: string;
    speaking_level: SpeakingLevel;
    main_goal: MainGoal;
    preferred_language: string;
    bio: string | null;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
};

export type User = {
    id: number;
    public_id: string;
    name: string;
    email: string;
    avatar?: string;
    profile?: UserProfile | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
