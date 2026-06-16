package taskmanager.mapper;

import org.springframework.stereotype.Component;
import taskmanager.dto.TaskRequest;
import taskmanager.dto.TaskResponse;
import taskmanager.model.Task;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        if (task == null) {
            return null;
        }

        return new TaskResponse(
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.isCompleted(),
            task.getCreatedAt(),
            task.getDueDate(),
            task.getPriority(),
            task.getCategory()
        );
    }

    public Task toEntity(TaskRequest request) {
        Task task = new Task();
        applyRequest(task, request);
        return task;
    }

    public void applyRequest(Task task, TaskRequest request) {
        if (request == null || task == null) {
            return;
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority());
        task.setCategory(request.getCategory());

        // Keep POST minimal: if completed is not provided, we keep current/default.
        if (request.getCompleted() != null) {
            task.setCompleted(request.getCompleted());
        }
    }
}

