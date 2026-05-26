export type SpeakingLevel = 'beginner' | 'intermediate' | 'advanced';

export type MainGoal =
    | 'public_speaking'
    | 'interviews'
    | 'presentations'
    | 'storytelling'
    | 'confidence'
    | 'pronunciation';

export type PracticeSessionType =
    | 'presentation'
    | 'interview'
    | 'storytelling'
    | 'elevator_pitch'
    | 'impromptu';

export type PracticeSessionStatus = 'draft' | 'recorded' | 'analyzed' | 'failed';

export type PracticeSessionRecording = {
    id: string;
    practice_session_id: string;
    user_id: number;
    audio_path: string;
    original_filename: string | null;
    mime_type: string;
    size: number;
    duration_seconds: number | null;
    uploaded_at: string;
};

export type PracticeSession = {
    id: string;
    user_id: number;
    title: string;
    topic: string;
    session_type: PracticeSessionType;
    target_duration_seconds: number;
    objective: string;
    status: PracticeSessionStatus;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    recording?: PracticeSessionRecording | null;
};

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
