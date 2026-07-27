<?php

namespace App\Support;

class PublicSpeakingTemplates
{
    /**
     * @return array<int, array{key: string, title: string, category: string, description: string, script: string}>
     */
    public static function all(): array
    {
        return [
            [
                'key' => 'personal_introduction',
                'title' => 'Personal introduction',
                'category' => 'Opening',
                'description' => 'A short talk for introducing yourself with confidence and direction.',
                'script' => "Good [morning/afternoon], everyone. My name is [your name], and I am glad to be here.\n\nI want to briefly share who I am, what I care about, and why this moment matters to me. My background is in [your background], and over time I have learned that the strongest work comes from curiosity, discipline, and the courage to keep improving.\n\nToday, I am focused on [your current goal or topic]. I am excited to learn from this room, contribute where I can, and leave you with a clear sense of what I stand for.\n\nThank you for listening.",
            ],
            [
                'key' => 'persuasive_speech',
                'title' => 'Persuasive speech',
                'category' => 'Influence',
                'description' => 'A simple structure for making a clear point and asking the audience to act.',
                'script' => "Imagine what would change if we treated [your topic] as a priority instead of an afterthought.\n\nThe problem is simple: [state the problem]. It affects [who it affects], and it keeps showing up because [reason]. But there is a better path.\n\nI believe we should [your recommendation]. This matters because [reason one], [reason two], and [reason three]. The first step does not need to be complicated. We can begin by [specific action].\n\nSo my ask is this: do not wait for the perfect moment. Start with one practical decision today, and let that decision create momentum.",
            ],
            [
                'key' => 'event_opening',
                'title' => 'Event opening',
                'category' => 'Hosting',
                'description' => 'A warm opener for welcoming people and setting expectations.',
                'script' => "Good [morning/afternoon/evening], everyone, and welcome to [event name].\n\nIt is a pleasure to have you here. Today is about [event purpose], but more than that, it is about bringing people together around ideas, stories, and useful conversations.\n\nBefore we begin, I want to thank [people or group] for making this possible. Their effort has created the space we are about to share.\n\nMy hope is that you participate fully, listen generously, and leave with something you can use. With that, let us begin.",
            ],
            [
                'key' => 'story_lesson',
                'title' => 'Story with a lesson',
                'category' => 'Storytelling',
                'description' => 'A narrative template for sharing an experience and a takeaway.',
                'script' => "I want to tell you about a moment that changed how I think about [lesson].\n\nAt the time, I was [set the scene]. I thought the challenge was [what you believed], but the real challenge was [deeper issue]. Then [describe what happened].\n\nThe turning point came when I decided to [action you took]. It was not perfect, but it taught me something important: [lesson].\n\nSince then, I have tried to carry that lesson into [where it applies now]. And if there is one thing I hope you remember, it is this: [memorable takeaway].",
            ],
            [
                'key' => 'product_explanation',
                'title' => 'Product explanation',
                'category' => 'Demo',
                'description' => 'A concise talk for explaining what a product does and why it matters.',
                'script' => "Today I want to explain [product or idea] in a simple way.\n\nThe problem it solves is [problem]. For many people, that means [pain or consequence]. [Product] helps by [core solution].\n\nHere is how it works: first, [step one]. Then, [step two]. Finally, [step three]. The result is [benefit], without [common friction].\n\nWhat makes this useful is not just the technology. It is the way it helps people [human outcome]. That is why I believe [product] is worth paying attention to.",
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return array_column(self::all(), 'key');
    }

    /**
     * @return array{key: string, title: string, category: string, description: string, script: string}|null
     */
    public static function find(string $key): ?array
    {
        foreach (self::all() as $template) {
            if ($template['key'] === $key) {
                return $template;
            }
        }

        return null;
    }
}
