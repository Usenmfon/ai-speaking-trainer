<?php

namespace App\Console\Commands;

use Illuminate\Console\Command as ArtisanCommand;
use JsonException;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class CheckAiWorkerCommand extends ArtisanCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai-worker:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify that the Python AI worker is installed and callable.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->components->info('Checking Python AI worker...');

        $root = (string) config('ai_worker.root');
        $python = (string) config('ai_worker.python');
        $entrypoint = (string) config('ai_worker.entrypoint');

        $failed = false;

        $failed = $this->checkFile('Configured Python binary', $python, executable: true) || $failed;
        $failed = $this->checkDirectory('AI worker folder', $root) || $failed;
        $failed = $this->checkFile('Python entrypoint', $entrypoint) || $failed;
        $failed = $this->checkFile('requirements.txt', $root.DIRECTORY_SEPARATOR.'requirements.txt') || $failed;
        $failed = $this->checkDirectory('temp directory', $root.DIRECTORY_SEPARATOR.'temp') || $failed;
        $failed = $this->checkDirectory('logs directory', $root.DIRECTORY_SEPARATOR.'logs') || $failed;

        $envPath = $root.DIRECTORY_SEPARATOR.'.env';

        if (is_file($envPath)) {
            $this->components->task('.env file', fn (): bool => true);
        } else {
            $this->warn('WARN  .env file is missing at '.$envPath.'. Manual worker runs may not load OPENAI_API_KEY.');
        }

        if ($failed) {
            $this->components->error('AI worker installation check failed before execution.');

            return Command::FAILURE;
        }

        return $this->runHealthCheck($python, $entrypoint, $root);
    }

    /**
     * Check that a directory exists.
     */
    private function checkDirectory(string $label, string $path): bool
    {
        $exists = is_dir($path);

        $this->components->task($label.' ['.$path.']', fn (): bool => $exists);

        return ! $exists;
    }

    /**
     * Check that a file exists.
     */
    private function checkFile(string $label, string $path, bool $executable = false): bool
    {
        $exists = is_file($path);
        $passes = $exists && (! $executable || is_executable($path));

        $this->components->task($label.' ['.$path.']', fn (): bool => $passes);

        if ($exists && $executable && ! is_executable($path)) {
            $this->warn('WARN  File exists but is not executable: '.$path);
        }

        return ! $passes;
    }

    /**
     * Execute the Python worker health check.
     */
    private function runHealthCheck(string $python, string $entrypoint, string $root): int
    {
        $this->newLine();
        $this->components->info('Running worker health check...');

        $process = new Process([
            $python,
            $entrypoint,
            '--task',
            'health_check',
        ], $root);

        $process->setTimeout(30);
        $process->setIdleTimeout(10);

        try {
            $process->run();
        } catch (ProcessTimedOutException $exception) {
            $this->components->error('Worker health check timed out: '.$exception->getMessage());

            return Command::FAILURE;
        }

        $output = trim($process->getOutput());

        if ($output === '') {
            $this->components->error('Worker returned no JSON output.');
            $this->line(trim($process->getErrorOutput()));

            return Command::FAILURE;
        }

        try {
            /** @var array<string, mixed> $payload */
            $payload = json_decode($output, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            $this->components->error('Worker returned invalid JSON: '.$exception->getMessage());
            $this->line($output);

            return Command::FAILURE;
        }

        if (! $process->isSuccessful() || ($payload['success'] ?? false) !== true || ($payload['status'] ?? null) !== 'ok') {
            $this->components->error('Worker health check failed.');
            $this->line(json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: $output);
            $this->line(trim($process->getErrorOutput()));

            return Command::FAILURE;
        }

        $this->components->twoColumnDetail('Status', 'ok');
        $this->components->twoColumnDetail('Python', (string) ($payload['python_version'] ?? 'unknown'));
        $this->components->twoColumnDetail('Worker', (string) ($payload['worker'] ?? 'unknown'));
        $this->components->success('AI worker is installed and callable.');

        return Command::SUCCESS;
    }
}
