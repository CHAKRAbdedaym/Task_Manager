package taskmanager.repository;

import org.springframework.data.jpa.domain.Specification;
import taskmanager.model.Priority;
import taskmanager.model.Task;
import taskmanager.model.User;

import java.time.Instant;

public class TaskSpecification {

    public static Specification<Task> hasOwner(User owner) {
        return (root, query, cb) -> cb.equal(root.get("owner"), owner);
    }

    public static Specification<Task> hasCompleted(Boolean completed) {
        return (root, query, cb) -> completed == null ? null : cb.equal(root.get("completed"), completed);
    }

    public static Specification<Task> hasPriority(Priority priority) {
        return (root, query, cb) -> priority == null ? null : cb.equal(root.get("priority"), priority);
    }

    public static Specification<Task> hasCategory(String category) {
        return (root, query, cb) -> category == null || category.isEmpty() ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Task> search(String term) {
        return (root, query, cb) -> {
            if (term == null || term.isEmpty()) return null;
            String likeTerm = "%" + term.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), likeTerm),
                    cb.like(cb.lower(root.get("description")), likeTerm)
            );
        };
    }

    public static Specification<Task> dueBefore(Instant date) {
        return (root, query, cb) -> date == null ? null : cb.lessThanOrEqualTo(root.get("dueDate"), date);
    }

    public static Specification<Task> dueAfter(Instant date) {
        return (root, query, cb) -> date == null ? null : cb.greaterThanOrEqualTo(root.get("dueDate"), date);
    }
}
