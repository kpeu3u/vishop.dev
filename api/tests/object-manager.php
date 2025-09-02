<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Radoslav Georgiev <support@globaldevelopment.bg>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

(new Dotenv())->bootEnv(dirname(__DIR__) . '/.env');

/** @var string $env */
$env = $_SERVER['APP_ENV'] ?? $_ENV['APP_ENV'] ?? 'dev';

$kernel = new Kernel($env, (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();

return $kernel->getContainer()->get('doctrine')->getManager();
