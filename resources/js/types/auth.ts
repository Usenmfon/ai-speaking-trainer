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

export type PracticeSessionStatus =
    | 'draft'
    | 'recorded'
    | 'transcribing'
    | 'transcribed'
    | 'analyzing'
    | 'analyzed'
    | 'failed';

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

export type PracticeSessionTranscript = {
    id: string;
    practice_session_id: string;
    user_id: number;
    practice_session_recording_id: string | null;
    text: string;
    segments: Array<Record<string, unknown>> | null;
    provider: string | null;
    completed_at: string;
};

export type SpeakingFeedbackReportStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed';

export type SpeakingFeedbackReport = {
    id: string;
    practice_session_id: string;
    user_id: number;
    transcript_id: string;
    overall_score: number | null;
    clarity_score: number | null;
    structure_score: number | null;
    confidence_score: number | null;
    pace_score: number | null;
    filler_word_score: number | null;
    summary_feedback: string;
    strengths: string[] | null;
    weaknesses: string[] | null;
    recommendations: string[] | null;
    filler_words: Array<{ word: string; count: number }> | null;
    improved_version: string | null;
    status: SpeakingFeedbackReportStatus;
    error_message: string | null;
    processed_at: string | null;
    practice_session?: PracticeSession | null;
    transcript?: PracticeSessionTranscript | null;
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
    transcript?: PracticeSessionTranscript | null;
    feedback_report?: SpeakingFeedbackReport | null;
    user?: User | null;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

export type DashboardAnalytics = {
    stats: {
        totalPracticeSessions: number;
        completedSessions: number;
        averageOverallScore: number | null;
        bestScore: number | null;
    };
    latestSession: PracticeSession | null;
    mostCommonWeakness: string | null;
    recentSessions: PracticeSession[];
    recentReports: SpeakingFeedbackReport[];
    referrals: {
        code: string;
        link: string;
        registeredCount: number;
    };
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
    referral_code?: string | null;
    is_admin: boolean;
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

export type AppNotification = {
    id: string;
    type: string;
    title: string;
    message: string;
    url: string | null;
    read_at: string | null;
    created_at: string | null;
    severity?: 'critical' | 'success';
};

export type NotificationSummary = {
    unreadCount: number;
    recent: AppNotification[];
};

export type SidebarContentItem = {
    key: string | null;
    title: string;
    description: string | null;
    value: string | null;
};

export type SidebarContent = {
    user: SidebarContentItem | null;
    admin: SidebarContentItem | null;
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
