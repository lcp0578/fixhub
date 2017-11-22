<?php

/*
 * This file is part of Piplin.
 *
 * Copyright (C) 2016-2017 piplin.com
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use Illuminate\Database\Seeder;
use Piplin\Models\Command;
use Piplin\Models\DeployTemplate;

class DeployTemplateTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('deploy_templates')->delete();

        $laravel = DeployTemplate::create([
            'name' => 'Laravel',
        ]);

        DeployTemplate::create([
            'name' => 'Wordpress',
        ]);

        Command::create([
            'name'            => 'Composer',
            'script'          => 'composer install -o --no-dev',
            'targetable_type' => 'Piplin\\Models\\DeployTemplate',
            'targetable_id'   => $laravel->id,
            'user'            => '',
            'step'            => Command::AFTER_INSTALL,
        ]);

        Command::create([
            'name'            => 'Down',
            'script'          => 'php {{ release_path }}/artisan down',
            'targetable_type' => 'Piplin\\Models\\DeployTemplate',
            'targetable_id'   => $laravel->id,
            'user'            => '',
            'step'            => Command::BEFORE_ACTIVATE,
        ]);

        Command::create([
            'name'            => 'Run Migrations',
            'script'          => 'php {{ release_path }}/artisan migrate --force',
            'targetable_type' => 'Piplin\\Models\\DeployTemplate',
            'targetable_id'   => $laravel->id,
            'user'            => '',
            'step'            => Command::BEFORE_ACTIVATE,
        ]);

        Command::create([
            'name'            => 'Up',
            'script'          => 'php {{ release_path }}/artisan up',
            'targetable_type' => 'Piplin\\Models\\DeployTemplate',
            'targetable_id'   => $laravel->id,
            'user'            => '',
            'step'            => Command::BEFORE_ACTIVATE,
        ]);
    }
}
