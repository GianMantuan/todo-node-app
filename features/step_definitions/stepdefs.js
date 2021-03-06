const { Given, Then, After } = require('cucumber');
const { expect } = require('chai');
const assert = require("assert");
const axios = require("axios");
const dayjs = require("dayjs");

Given(`Eu devo me cadastrar na plataforma utilizando o nome {string} {string} com o email {string} e a senha {string} e com o nome de usuario {string}`, { timeout: 2 * 50000 }, async function (firstName, lastName, email, password, username) {
    try {
        let response = await axios.post("http://localhost:3001/users/new", {
            firstName, lastName, email, password, username
        });
        this.user = response.data;
        return true;
    } catch (err) {
        throw new Error(JSON.stringify(err.response.data));
    }
});

Then('Eu devo receber uma confirmação dos dados gravados e seu identificador', { timeout: 2 * 50000 }, async function () {
    let fields = ['firstName', 'lastName', 'email', 'username', '_id', 'todo', 'createdAt'];
    fields.forEach(field => {
        if (!(field in this.user)) {
            throw new Error({ message: "O usuário não foi gravado corretamente" });
        }
    })
});

Then('Eu devo logar no sistema com username {string} e senha {string}', { timeout: 2 * 50000 }, async function (username, password) {
    try {
        let response = await axios.post("http://localhost:3001/login", {
            username, password
        });
        this.token = response.data;
        return true;
    } catch (err) {
        throw new Error(err.response.data);
    }
});

Then(`Eu devo cadastrar uma tarefa com o conteudo {string} e a data de finalização é {string} dia após da data atual`, { timeout: 2 * 50000 }, async function (content, ndays) {
    try {
        let response = await axios.post("http://localhost:3001/todo/new", {
            content,
            todoAt: dayjs().add(parseInt(ndays), 'day').format("YYYY-MM-DD"),
            user_id: this.user._id
        });
        this.todo = response.data;
        return true;
    } catch (err) {
        throw new Error(err.response.data);
    }
});

Then(`Eu devo finalizar a tarefa criada, a operação deverá ser {string}`, { timeout: 2 * 50000 }, async function (status) {

    try {
        await axios.put("http://localhost:3001/todo/update", {
            todo_id: this.todo._id,
            finished: true
        });
    } catch (err) {
        throw new Error(err.response.data);
    }
    expect(status).equals("permitida");
})

Then(`Eu devo editar o conteúdo da tarefa criada para {string}`, { timeout: 2 * 50000 }, async function (content) {
    try {
        let response = await axios.put("http://localhost:3001/todo/update", {
            todo_id: this.todo._id,
            content
        });
        const editedTodo = response.data;
        expect(editedTodo.content).equals(content);
        expect(this.todo._id).equals(editedTodo._id);
        this.todo = editedTodo;
        return true;
    } catch (err) {
        throw new Error(err.response.data);
    }
});

Then(`Eu devo editar a data da tarefa criada para uma data anterior a atual`, { timeout: 2 * 50000 }, async function () {
    try {
        let editedTodo = await axios.put("http://localhost:3001/todo/update", {
            todo_id: this.todo._id,
            todoAt: dayjs().subtract(1, 'day').format("YYYY-MM-DD")
        });
        this.todo = editedTodo;
        return true;
    } catch (err) {
        new Error(err.response.data);
    }
})

Then(`Eu devo excluir a tarefa criada`, { timeout: 2 * 50000 }, async function () {
    try {
        if (this.todo && this.todo._id) {
            await axios.delete("http://localhost:3001/todo/delete", {
                data: {
                    todo_id: this.todo._id
                }
            });
            return true;
        }
    } catch (err) {
        throw new Error(err.response.data);
    }
});

Then(`Deve ser listado as tarefas com o filtro {string}`, { timeout: 2 * 50000 }, async function (filtro) {
    try {
        let url = `http://localhost:3001/todo/?user_id=${this.user._id}`;
        if (filtro !== 'todos') {
            url += `&finished=${filtro == 'todos' ? '' : (filtro == 'finalizadas' ? 'true' : 'false')}`
        }
        
        const response = await axios.get(url);
        let lista = response.data;
        
        if(filtro !== 'todas') {
            return lista.reduce((prev,cur) => {
                return prev && cur.finished == (filtro == 'finalizadas' ? true : false)
            }, true);
        }

        return true;
    } catch (err) {
        new Error(err.response.data);
    }
});



// Eu poderia criar a conta do usário sempre no before de cada scenario, mas optei por não usarpara deixar as explicações mais claras no inicio
// da apresentação do trabalho e por ter rotinas simples dar mais enfase em todo o processo.
After(async function () {
    if (this.user && this.user._id) {
        await axios.delete("http://localhost:3001/users/delete", {
            data: {
                user_id: this.user._id
            }
        });
    }
    return true;
});