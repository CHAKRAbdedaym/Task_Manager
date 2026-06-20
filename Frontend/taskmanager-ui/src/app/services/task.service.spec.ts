import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, Priority, Task, Page } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch tasks with params', () => {
    const mockTasks: Page<Task> = {
      content: [{ title: 'Task 1', description: 'Desc 1', completed: false, priority: Priority.MEDIUM }],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    };

    service.getTasks({ search: 'Task' }).subscribe(data => {
      expect(data.content.length).toBe(1);
      expect(data.content[0].title).toBe('Task 1');
    });

    const req = httpMock.expectOne(request => request.url === '/api/tasks' && request.params.has('search'));
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should create a task', () => {
    const newTask: Task = { title: 'New Task', description: 'New Desc', completed: false, priority: Priority.HIGH };

    service.createTask(newTask).subscribe(task => {
      expect(task.title).toBe('New Task');
    });

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    req.flush(newTask);
  });

  it('should delete a task', () => {
    service.deleteTask(1).subscribe();

    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should toggle a task', () => {
    const toggledTask: Task = { id: 1, title: 'Toggled Task', description: '', completed: true, priority: Priority.LOW };

    service.toggleTask(1).subscribe(task => {
      expect(task.completed).toBe(true);
    });

    const req = httpMock.expectOne('/api/tasks/1/toggle');
    expect(req.request.method).toBe('PATCH');
    req.flush(toggledTask);
  });
});
