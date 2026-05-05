package taskmanager.controller;

import taskmanager.dto.TaskRequest;
import taskmanager.dto.TaskResponse;
import taskmanager.service.TaskService;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // POST
    @PostMapping
    public TaskResponse create(@Valid @RequestBody TaskRequest request) {
        return taskService.createTask(request);
    }

    // GET
    @GetMapping
    public List<TaskResponse> getAll() {
        return taskService.getAllTasks();
    }

    // GET by id
    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    // PUT update
    @PutMapping("/{id}")
    public TaskResponse update(
        @PathVariable Long id,
        @Valid @RequestBody TaskRequest request
    ) {
        return taskService.updateTask(id, request);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH toggle completed
    @PatchMapping("/{id}/toggle")
    public TaskResponse toggleCompleted(@PathVariable Long id) {
        return taskService.toggleTask(id);
    }
}
