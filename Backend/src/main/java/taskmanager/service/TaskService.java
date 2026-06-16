package taskmanager.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import taskmanager.dto.TaskRequest;
import taskmanager.dto.TaskResponse;
import taskmanager.exception.TaskNotFoundException;
import taskmanager.mapper.TaskMapper;
import taskmanager.model.Task;
import taskmanager.model.User;
import taskmanager.repository.TaskRepository;
import taskmanager.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));
    }

    public TaskResponse createTask(TaskRequest request) {
        User user = getCurrentUser();
        Task task = taskMapper.toEntity(request);
        task.setOwner(user);
        Task saved = taskRepository.save(task);
        return taskMapper.toResponse(saved);
    }

    public List<TaskResponse> getAllTasks() {
        User user = getCurrentUser();
        return taskRepository.findByOwner(user)
                .stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        User user = getCurrentUser();
        Task task = taskRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getCompleted() != null) {
            task.setCompleted(request.getCompleted());
        }

        return taskMapper.toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        User user = getCurrentUser();
        Task task = taskRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    public TaskResponse toggleTask(Long id) {
        User user = getCurrentUser();
        Task task = taskRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));

        task.setCompleted(!task.isCompleted());
        return taskMapper.toResponse(taskRepository.save(task));
    }
}