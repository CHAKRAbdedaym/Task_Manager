package taskmanager.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import taskmanager.dto.TaskRequest;
import taskmanager.dto.TaskResponse;
import taskmanager.exception.TaskNotFoundException;
import taskmanager.model.User;
import taskmanager.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TaskIsolationTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsService userDetailsService;

    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        
        userA = User.builder()
                .email("userA@example.com")
                .password("password")
                .displayName("User A")
                .build();
        userRepository.save(userA);

        userB = User.builder()
                .email("userB@example.com")
                .password("password")
                .displayName("User B")
                .build();
        userRepository.save(userB);
    }

    private void authenticateAs(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testIsolationBetweenUsers() {
        // Step 1: User A creates a task
        authenticateAs("userA@example.com");
        TaskRequest request = new TaskRequest();
        request.setTitle("User A Task");
        request.setDescription("Secret task for A");
        TaskResponse responseA = taskService.createTask(request);
        Long taskAId = responseA.getId();

        // Step 2: User B attempts to access User A's task
        authenticateAs("userB@example.com");
        assertThrows(TaskNotFoundException.class, () -> taskService.updateTask(taskAId, request));
        assertThrows(TaskNotFoundException.class, () -> taskService.toggleTask(taskAId));
        assertThrows(TaskNotFoundException.class, () -> taskService.deleteTask(taskAId));

        // Step 3: User B should not see User A's task in their list
        assertTrue(taskService.getAllTasks().isEmpty());

        // Step 4: User A should still see their task
        authenticateAs("userA@example.com");
        assertEquals(1, taskService.getAllTasks().size());
        assertEquals("User A Task", taskService.getAllTasks().get(0).getTitle());
    }
}
