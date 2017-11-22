<?php

/*
 * This file is part of Piplin.
 *
 * Copyright (C) 2016-2017 piplin.com
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Piplin\Composers;

use Auth;
use Illuminate\Contracts\View\View;
use Piplin\Models\Task;

/**
 * View composer for the header bar.
 */
class HeaderComposer
{
    /**
     * Generates the pending and running projects for the view.
     *
     * @param  \Illuminate\Contracts\View\View $view
     * @return void
     */
    public function compose(View $view)
    {
        $pending       = $this->getPending();
        $pending_count = count($pending);
        $view->with('pending', $pending);
        $view->with('pending_count', $pending_count);

        $running       = $this->getRunning();
        $running_count = count($running);
        $view->with('running', $running);
        $view->with('running_count', $running_count);

        $view->with('todo_count', $pending_count + $running_count);
    }

    /**
     * Gets pending deployments.
     *
     * @return array
     */
    private function getPending()
    {
        return $this->getStatus(Task::PENDING);
    }

    /**
     * Gets running deployments.
     *
     * @return array
     */
    private function getRunning()
    {
        return $this->getStatus(Task::RUNNING);
    }

    /**
     * Gets deployments with a supplied status.
     *
     * @param  array|int $status
     * @return array
     */
    private function getStatus($status)
    {
        return Task::whereNotNull('started_at')
                           ->whereIn('status', is_array($status) ? $status : [$status])
                           ->orderBy('started_at', 'DESC')
                           ->get();
    }
}
