package taskmanager.repository;

import taskmanager.model.Task;
import taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    List<Task> findByOwner(User owner);
    Optional<Task> findByIdAndOwner(Long id, User owner);
}
