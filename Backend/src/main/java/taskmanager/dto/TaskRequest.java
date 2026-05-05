package taskmanager.dto;

import lombok.Data;

@Data
public class TaskRequest {
    private String title;
    private String description;
    private boolean completed;
}
