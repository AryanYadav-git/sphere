import React from 'react'

const App = () => {
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

  return (
    <div>
      <button onClick={handleSubmit}>Create Project</button>
      <button onClick={handleAddNewMember}>Add new memeber</button>
    </div>
  )
}

export default App
