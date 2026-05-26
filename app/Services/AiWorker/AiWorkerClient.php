<?php

namespace App\Services\AiWorker;

use App\Exceptions\AiWorkerException;
use JsonException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class AiWorkerClient
{
    /**
     * Process a practice session recording with the Python worker.
     *
     * @param  array<string, mixed>  $metadata
     * @return array{ok: bool, task: string, data: array<string, mixed>, errors: array<int, array<string, string>>, meta: array<string, mixed>}
     *
     * @throws AiWorkerException
     */
    public function processRecording(
        string $audioPath,
        string $sessionId,
        string $recordingId,
        array $metadata = [],
    ): array {
        return $this->run('process_recording', $audioPath, $sessionId, $recordingId, $metadata);
    }

    /**
     * Run a worker task through Symfony Process.
     *
     * @param  array<string, mixed>  $metadata
     * @return array{ok: bool, task: string, data: array<string, mixed>, errors: array<int, array<string, string>>, meta: array<string, mixed>}
     *
     * @throws AiWorkerException
     */
    private function run(
        string $task,
        ?string $audioPath = null,
        ?string $sessionId = null,
        ?string $recordingId = null,
        array $metadata = [],
    ): array {
        try {
            $metadataJson = json_encode($metadata, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw AiWorkerException::failed('Unable to encode AI worker metadata: '.$exception->getMessage());
        }

        $command = [
            $this->pythonBinary(),
            config('ai_worker.entrypoint'),
            '--task',
            $task,
            '--metadata-json',
            $metadataJson,
        ];

        if ($audioPath !== null) {
            array_push($command, '--audio-path', $audioPath);
        }

        if ($sessionId !== null) {
            array_push($command, '--session-id', $sessionId);
        }

        if ($recordingId !== null) {
            array_push($command, '--recording-id', $recordingId);
        }

        $process = new Process($command, config('ai_worker.root'));
        $process->setTimeout(config('ai_worker.timeout'));
        $process->setIdleTimeout(config('ai_worker.idle_timeout'));

        try {
            $process->run();
        } catch (ProcessTimedOutException $exception) {
            throw AiWorkerException::failed('AI worker timed out: '.$exception->getMessage());
        }

        $output = trim($process->getOutput());

        if ($output === '') {
            throw AiWorkerException::failed('AI worker returned no JSON output: '.$process->getErrorOutput());
        }

        try {
            /** @var array{ok: bool, task: string, data: array<string, mixed>, errors: array<int, array<string, string>>, meta: array<string, mixed>} $response */
            $response = json_decode($output, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw AiWorkerException::invalidJson($output);
        }

        if (! $process->isSuccessful() || $response['ok'] !== true) {
            $message = $response['errors'][0]['message']
                ?? $process->getErrorOutput()
                ?: 'AI worker failed.';

            throw AiWorkerException::failed($message);
        }

        return $response;
    }

    /**
     * Resolve the configured Python executable, falling back to PATH.
     */
    private function pythonBinary(): string
    {
        $configuredPython = (string) config('ai_worker.python');

        if (is_file($configuredPython)) {
            return $configuredPython;
        }

        return PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3';
    }
}
