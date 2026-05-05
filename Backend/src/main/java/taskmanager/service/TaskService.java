package taskmanager.service;

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
}
