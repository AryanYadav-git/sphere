import React, { useEffect, useState } from 'react'

const App = () => {
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
      projectId: 13,
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
      projectId: 14,
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
      <button onClick={handleSubmit} className='w-fit'>Create Project</button>
      <button onClick={handleAddNewMember} className='w-fit'>Add new memeber</button>
      <button onClick={handleAddNewSprint} className='w-fit'>Add new sprint</button>
    </div>
  )
}

export default App
