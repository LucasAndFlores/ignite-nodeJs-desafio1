const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const {username} = request.headers

    const findUser =  users.find( (user)  => 
      user.username === username
    )

    if(!findUser) {
      return response.status(400).json({error: "Username not found"})
    }

    request.findedUser = findUser

    return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const checksExistUsername = users.some( user  => 
    user.username === username
  )

  if(checksExistUsername) {
    return response.status(400).json({error: "Username already exists"})
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }

  users.push(newUser)

  return response.status(201).json(newUser)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const { findedUser } = request

   return response.status(200).json(findedUser.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { findedUser } = request
  const {title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  findedUser.todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { findedUser } = request
   const { title, deadline } = request.body
   const { id } = request.params

   const findedTodo = findedUser.todos.find( todo => todo.id === id)

   if(!findedTodo) {
    return response.status(404).json({error: "Todo not finded"})
  }

   findedTodo.title = title
   findedTodo.deadline = new Date(deadline)


  return response.json(findedTodo)

   
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
   const { findedUser } = request
   const { id } = request.params

   const findedTodoAsDone = findedUser.todos.find( todo => todo.id === id )

   if (!findedTodoAsDone) {
     return response.status(404).json({error: "Todo not finded"})
   }

   findedTodoAsDone.done = true

   return response.json(findedTodoAsDone)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { findedUser } = request
   const { id } = request.params

   const deleteTodo = findedUser.todos.findIndex( todo => todo.id === id )

   if (deleteTodo === -1) {
    return response.status(404).json({error: "Todo not finded"})
  }

  findedUser.todos.splice(deleteTodo, 1)

  return response.status(204).json()


});

module.exports = app;