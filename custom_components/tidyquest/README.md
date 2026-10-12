# 家务小当家 Home Assistant Integration

This custom integration exposes 家务小当家 tasks in Home Assistant and lets household users complete or manage tasks through services.

## Install

Copy `custom_components/tidyquest` into your Home Assistant `custom_components` directory, restart Home Assistant, then add **家务小当家** from **Settings > Devices & services**.

Use a 家务小当家 admin or member account for the integration. 家务小当家 only allows admin/member users to complete tasks on behalf of another user.

## User Matching

When `tidyquest.complete_task` is called from a dashboard, Home Assistant includes the user who pressed the control in the service context. The integration reads that Home Assistant user's name and matches it to a 家务小当家 `displayName` or `username`, then sends the matching 家务小当家 user id as `onBehalfOfUserId`.

For this to work without extra service data, each Home Assistant user's name must exactly match a 家务小当家 display name or username, ignoring case.

You can override matching by passing `user_name` or `tidyquest_user_id` to the service.

## Entities

Each 家务小当家 task becomes a sensor with the task health as its state. Attributes include:

- `task_id`
- `room_id`
- `room_name`
- `frequency_days`
- `effort`
- `is_due`
- `completed_today_by`
- `assigned_users`
- `assignment_mode`

## Services

### `tidyquest.complete_task`

Complete a task using `entity_id` or `task_id`.

```yaml
service: tidyquest.complete_task
target:
  entity_id: sensor.kitchen_wash_dishes_health
```

Explicit user override:

```yaml
service: tidyquest.complete_task
data:
  task_id: 1
  user_name: John Doe
```

### `tidyquest.create_task`

Create a task in a room by `room_id` or `room_name`.

```yaml
service: tidyquest.create_task
data:
  room_name: Kitchen
  name: Wipe cabinet fronts
  frequency_days: 14
  effort: 2
  assigned_users:
    - John Doe
```

### `tidyquest.update_task`

Update an existing task.

```yaml
service: tidyquest.update_task
target:
  entity_id: sensor.kitchen_wash_dishes_health
data:
  frequency_days: 2
  effort: 3
```

### `tidyquest.delete_task`

Delete a task by `entity_id` or `task_id`.

### `tidyquest.reset_task`

Reset a task to dirty/due by `entity_id` or `task_id`. This removes today's completion records for the task so it can be completed again.

```yaml
service: tidyquest.reset_task
target:
  entity_id: sensor.kitchen_wash_dishes_health
```

### `tidyquest.refresh`

Refresh rooms, users, and task sensors immediately.
