<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoMetadataTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_renders_search_metadata(): void
    {
        config(['seo.site_name' => 'SpeakAI Coach']);

        $response = $this->get(route('home'));

        $response
            ->assertOk()
            ->assertSee('<title>AI Speaking Coach for Presentations, Interviews, and Public Speaking</title>', false)
            ->assertSee('<meta name="description" content="Practice speeches, presentations, interviews, and conversations with AI feedback on clarity, confidence, pronunciation, pacing, and filler words.">', false)
            ->assertSee('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">', false)
            ->assertSee('<link rel="canonical" href="http://localhost:8000">', false)
            ->assertSee('<meta property="og:site_name" content="SpeakAI Coach">', false)
            ->assertSee('"@type":"SoftwareApplication"', false);
    }

    public function test_authenticated_application_pages_are_not_indexable(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('user-profile.complete'));

        $response
            ->assertOk()
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false);
    }

    public function test_sitemap_lists_public_indexable_pages(): void
    {
        $response = $this->get(route('sitemap'));

        $response
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml')
            ->assertSee('<loc>http://localhost:8000</loc>', false);
    }
}
