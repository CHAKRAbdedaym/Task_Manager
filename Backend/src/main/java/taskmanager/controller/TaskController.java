package taskmanager.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import taskmanager.dto.TaskRequest;
import taskmanager.dto.TaskResponse;
import taskmanager.model.Priority;
import taskmanager.service.TaskService;

import java.time.Instant;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskResponse create(@Valid @RequestBody TaskRequest request) {
        return taskService.createTask(request);
    }

    @GetMapping
    public Page<TaskResponse> getAll(
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Instant dueBefore,
            @RequestParam(required = false) Instant dueAfter,
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {
        return taskService.getAllTasks(completed, priority, category, search, dueBefore, dueAfter, pageable);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id, @RequestBody TaskRequest request) {
        return taskService.updateTask(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @PatchMapping("/{id}/toggle")
    public TaskResponse toggle(@PathVariable Long id) {
        return taskService.toggleTask(id);
    }
}
