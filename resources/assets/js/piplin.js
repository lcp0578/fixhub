(function ($) {

    Piplin.loadLivestamp();

    Piplin.listener.on('task:' + Piplin.events.MODEL_CHANGED, function (data) {

        // Update todo bar
        updateTodoBar(data);

        if ($('#timeline').length > 0) {
            updateTimeline();
        }

        var task  = $('#task_' + data.model.id);

        if (task.length > 0) {

            $('td.committer', task).text(data.model.committer);

            if (data.model.commit_url) {
                $('td.commit', task).html('<a href="' + data.model.commit_url + '" target="_blank">' + data.model.short_commit + '</a>'+'('+data.model.branch+')');
            }

            var status_bar = $('td.status span', task);

            var status_data = Piplin.formatDeploymentStatus(parseInt(data.model.status));

            if (status_data.done) {
                $('button#deploy_project:disabled').removeAttr('disabled');
                $('td a.btn-cancel', task).remove();

                if (status_data.success) {
                    $('button.btn-rollback').removeClass('hide');
                }
            }

            status_bar.attr('class', 'text-' + status_data.label_class);
            $('i', status_bar).attr('class', 'piplin piplin-' + status_data.icon_class);
            $('span', status_bar).text(status_data.label);
        } else {
            var toast_title = trans('tasks.deploy_title', {
                'id': data.model.id
            });

            if (data.model.status === Piplin.statuses.DEPLOYMENT_COMPLETED) {
                Piplin.toast(toast_title + ' - ' + trans('tasks.completed'), data.model.project_name, 'success');
            } else if (data.model.status === Piplin.statuses.DEPLOYMENT_FAILED) {
                Piplin.toast(toast_title + ' - ' + trans('tasks.failed'), data.model.project_name, 'error');
            } else if (data.model.status === Piplin.statuses.DEPLOYMENT_ERRORS) {
                Piplin.toast(toast_title + ' - ' + trans('tasks.completed_with_errors'), data.model.project_name, 'warning');
            } // FIXME: Add cancelled
        }
    });

    Piplin.listener.on('project:' + Piplin.events.MODEL_CHANGED, function (data) {

        var project = $('#project_' + data.model.id);

        if (project.length > 0) {
            var status_bar = $('td.status span', project);

            var status_data = Piplin.formatProjectStatus(parseInt(data.model.status));

            $('td.name', project).text(data.model.name);
            $('td.time', project).text(moment(data.model.last_run).fromNow());
            status_bar.attr('class', 'text-' + status_data.label_class)
            $('i', status_bar).attr('class', 'piplin piplin-' + status_data.icon_class);
            $('span', status_bar).text(status_data.label);
        }
    });

    Piplin.listener.on('project:' + Piplin.events.MODEL_TRASHED, function (data) {

        if (parseInt(data.model.id) === parseInt(Piplin.project_id)) {
            window.location.href = '/';
        }
    });

    Piplin.listener.on('task:' + Piplin.events.MODEL_CREATED, function (data) {
        var userId = parseInt($('meta[name="user_id"]').attr('content'));

        if (data.model.user_id == userId) {
            Piplin.toast(trans('tasks.create_success'), '', 'info').on('click', function(){
                window.location.href = '/task/' + data.model.id;
            });
        }
    });

    function updateTimeline() {
        $.ajax({
            type: 'GET',
            url: '/timeline'
        }).done(function (response) {
            $('#timeline').html(response);
            Piplin.loadLivestamp();
        });
    }

    function updateTodoBar(data) {
        data.model.time = moment(data.model.started_at).fromNow();
        data.model.url = '/task/' + data.model.id;

        $('#task_info_' + data.model.id).remove();

        var template = _.template($('#task-list-template').html());
        var html = template(data.model);

        if (data.model.status === Piplin.statuses.DEPLOYMENT_RUNNING) {
            $('.running_menu').append(html);
        }

        var running = $('.running_menu li.todo_item').length;
        var pending = $('.pending_menu li.todo_item').length;

        var todo_count = running+pending;

    
        if(todo_count > 0) {
            $('#todo_menu span.label').html(todo_count).addClass('label-success');
            $('#todo_menu .dropdown-toggle i.ion').addClass('text-danger');
        } else {
            $('#todo_menu span.label').html('').removeClass('label-success');
            $('#todo_menu .dropdown-toggle i.ion').removeClass('text-danger')
        }

        var empty_template = _.template($('#todo-item-empty-template').html());

        if(running > 0) {
            $('.running_header i').addClass('piplin-spin');
            $('.running_menu li.item_empty').remove();
        } else {
            $('.running_header i').removeClass('piplin-spin');
            $('.running_menu li.item_empty').remove();
            $('.running_menu').append(empty_template({empty_text:trans('dashboard.running_empty')}));
        }

        var pending_label = Lang.choice('dashboard.pending', pending, {
            'count': pending
        });
        var running_label = Lang.choice('dashboard.running', running, {
            'count': running
        });

        $('.running_header span').text(running_label);
        $('.pending_header span').text(pending_label);
    }

})(jQuery);