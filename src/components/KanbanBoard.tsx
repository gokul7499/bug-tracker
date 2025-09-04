
import React from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import type { Task } from '../hooks/useTasks'
import {Clock, User, AlertCircle, Paperclip} from 'lucide-react'
import { format } from 'date-fns'
import './KanbanBoard.css'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskClick: (task: Task) => void
}

const statusColumns = [
  { id: 'todo', title: 'To Do', header: 'header-gray' },
  { id: 'in_progress', title: 'In Progress', header: 'header-blue' },
  { id: 'review', title: 'Review', header: 'header-yellow' },
  { id: 'done', title: 'Done', header: 'header-green' }
]

const priorityColors = {
  low: 'border-green',
  medium: 'border-yellow',
  high: 'border-orange',
  critical: 'border-red'
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate, onTaskClick }) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId as Task['status']
    
    onTaskUpdate(draggableId, { status: newStatus })
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-grid">
          {statusColumns.map((column) => (
            <div key={column.id} className="kanban-column">
              <div className={`kanban-header ${column.header}`}>
                <h3>{column.title}</h3>
                <span className="sub">
                  {getTasksByStatus(column.id).length} tasks
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-droppable ${snapshot.isDraggingOver ? 'dragover' : ''}`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            className={`kanban-card ${priorityColors[task.priority]} ${snapshot.isDragging ? 'rotate' : ''}`}
                          >
                            <div className="flex justify-between items-start" style={{ marginBottom: 8 }}>
                              <h4 className="line-clamp-2">
                                {task.title}
                              </h4>
                              <span className={`status-badge priority-${task.priority}`}>
                                {task.priority}
                              </span>
                            </div>
                            
                            <p className="desc line-clamp-2">
                              {task.description}
                            </p>
                            
                            <div className="kanban-meta">
                              <div className="left">
                                {task.due_date && (
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{format(new Date(task.due_date), 'MMM dd')}</span>
                                  </div>
                                )}
                                
                                {task.attachments?.length > 0 && (
                                  <div className="flex items-center">
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    <span>{task.attachments.length}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center">
                                {task.assigned_to && (
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    <span className="truncate max-w-[60px]">
                                      {task.assigned_to}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {task.labels && task.labels.length > 0 && (
                              <div className="kanban-labels">
                                {task.labels.slice(0, 2).map((label, idx) => (
                                  <span
                                    key={idx}
                                    className="kanban-chip"
                                  >
                                    {label}
                                  </span>
                                ))}
                                {task.labels.length > 2 && (
                                  <span className="kanban-chip">
                                    +{task.labels.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

export default KanbanBoard
