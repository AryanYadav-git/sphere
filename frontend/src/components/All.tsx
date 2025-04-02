import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';

const All = () => {
  const [user, setUser] = useState();
    const handleSubmit = async () => {
      const project = {
        name: 'New Project',
        description: 'This is a new project',
        // startDate: new Date('2015-10-12'),
        // endDate: new Date(),
      }
  
      try {
        const response = await fetch('/api/project/create-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        })
  
        if (!response.ok) {
          throw new Error('Failed to create project')
        }
  
        const data = await response.json()
        console.log('Project created:', data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    const handleAddNewMember = async () => {
      const member = {
        projectId: 1,
        email: 'test.aryanyadav@gmail.com',
        role: 'member',
        // startDate: new Date('2015-10-12'),
        // endDate: new Date(),
      }
  
      try {
        const response = await fetch('/api/project/add-new-member', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(member),
        })
  
        if (!response.ok) {
          throw new Error('Failed to create project')
        }
  
        const data = await response.json()
        console.log('Project created:', data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    const handleAddNewSprint = async () => {
      const member = {
        projectId: 1,
        name: 'User Authentication',
        goal: 'Implement User Authentication System',
        startDate: '2015-10-12',
        endDate: '2025-10-12',
      }
  
      try {
        const response = await fetch('/api/project/create-new-sprint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(member),
        })
  
        if (!response.ok) {
          throw new Error('Failed to create project')
        }
  
        const data = await response.json()
        console.log('sprint created:', data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    const handleAddNewUserStory = async () => {
      const member = {
        sprintId: 1,
        title: 'User Authentication',
        description: 'Implement User Authentication System',
        status: 'todo',
        priority: 'low',
      }
  
      try {
        const response = await fetch('/api/project/create-new-user-story', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(member),
        })
  
        if (!response.ok) {
          throw new Error('Failed to create project')
        }
  
        const data = await response.json()
        console.log('sprint created:', data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    const handleAddNewTask = async () => {
      const member = {
        userStoryId: 1,
        title: 'User Authentication',
        status: 'todo',
        estimatedHours: 2,
        assigneeId: 2,
      }
  
      try {
        const response = await fetch('/api/project/create-new-task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(member),
        })
  
        if (!response.ok) {
          throw new Error('Failed to create project')
        }
  
        const data = await response.json()
        console.log('sprint created:', data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    const handleChangeTaskStatus = async () => {
      const body = {
        taskId: 1,
        status: 'todo',
      }
  
      try {
        const response = await fetch(`/api/project/change-task-status?taskId=${body.taskId}&&status=${body.status}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        })
  
        if (!response.ok) {
          throw new Error('Failed to create project')
        }
  
        const data = await response.json()
        console.log('sprint created:', data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/me')
          const data = await response.json();
  
          console.log('User data:', data.user.email)
          setUser(data.user.email);
        } catch (error) {
          console.error('Error:', error)
        }
      }
  
      fetchUserData();
    },[])
  
    return (
      <div className='flex flex-col gap-6 items-center w-screen'>
        <p>{user}</p>
        <Button onClick={handleSubmit} className='w-fit '>Create Project</Button>
        <button onClick={handleAddNewMember} className='w-fit'>Add new memeber</button>
        <button onClick={handleAddNewSprint} className='w-fit'>Add new sprint</button>
        <button onClick={handleAddNewUserStory} className='w-fit'>Add new user story</button>
        <button onClick={handleAddNewTask} className='w-fit'>Add new task</button>
        <button onClick={handleChangeTaskStatus} className='w-fit'>change task status</button>
      </div>
    )
}

export default All