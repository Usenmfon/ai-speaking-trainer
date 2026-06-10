<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CaptureReferralCode
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->query->has('ref')) {
            $referralCode = Str::of((string) $request->query('ref'))
                ->trim()
                ->upper()
                ->toString();

            if ($referralCode !== '') {
                $request->session()->put('referral_code', $referralCode);
            }
        }

        return $next($request);
    }
}
