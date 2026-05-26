<?php

namespace App\Exceptions;

use RuntimeException;

class AiWorkerException extends RuntimeException
{
    /**
     * Create an exception for an invalid worker response.
     */
    public static function invalidJson(string $output): self
    {
        return new self('AI worker returned invalid JSON: '.$output);
    }

    /**
     * Create an exception for a failed worker process.
     */
    public static function failed(string $message): self
    {
        return new self($message);
    }
}
