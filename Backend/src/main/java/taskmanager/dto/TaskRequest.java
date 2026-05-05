package taskmanager.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class TaskRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    // Optional to keep POST payload minimal; if null we keep the current/default value.
    private Boolean completed;
}
