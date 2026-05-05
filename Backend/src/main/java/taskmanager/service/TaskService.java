package taskmanager.service;

import taskmanager.exception.TaskNotFoundException;
import taskmanager.dto.TaskRequest;
import taskmanager.dto.TaskResponse;
import taskmanager.model.Task;
import taskmanager.repository.TaskRepository;
import taskmanager.mapper.TaskMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    // CREATE
    public TaskResponse createTask(TaskRequest request) {
        Task task = taskMapper.toEntity(request);
        Task saved = taskRepository.save(task);
        return taskMapper.toResponse(saved);
    }

    // READ ALL
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
            .stream()
            .map(taskMapper::toResponse)
            .collect(Collectors.toList());
    }

    // READ ONE
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new TaskNotFoundException(id));
        return taskMapper.toResponse(task);
    }

    // UPDATE
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new TaskNotFoundException(id));

        taskMapper.applyRequest(task, request);
        Task saved = taskRepository.save(task);
        return taskMapper.toResponse(saved);
    }

    // DELETE
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new TaskNotFoundException(id));
        taskRepository.delete(task);
    }

    // TOGGLE COMPLETED
    public TaskResponse toggleTask(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new TaskNotFoundException(id));

        task.setCompleted(!task.isCompleted());
        Task saved = taskRepository.save(task);
        return taskMapper.toResponse(saved);
    }
}
