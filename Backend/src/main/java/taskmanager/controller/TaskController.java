package taskmanager.controller;

import taskmanager.dto.TaskRequest;
import taskmanager.dto.TaskResponse;
import taskmanager.service.TaskService;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
}
