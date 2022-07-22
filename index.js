let URL_USERS = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users';
let URL_TASKS = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks';
let DATA_TASKS = [];
let DATA_USERS = [];
let USERS_WITH_TASK = [];
let TASK_WITHOUT_USERS = [];

let dates = document.querySelector('.table__head');
let tbody = document.querySelector('.table__body');
let backlog = document.querySelector('.backlog__body');

let d = new Date();


fetch(URL_USERS).then(i => i.json()).then(i => {
    DATA_USERS = i;
});
fetch(URL_TASKS).then(i => i.json()).then(i => {
    DATA_TASKS = i, filterTask(DATA_USERS, DATA_TASKS)
});


// Promise.all([
//     fetch('URL_USERS').then(i => i.json()).then(i => {DATA_USERS = i;}),
//     fetch('URL_TASKS').then(i => i.json()).then(i => {DATA_TASKS = i;})
//   ]).then(filterTask(DATA_USERS, DATA_TASKS));


function filterTask(arrUser, arrTask) {
    for (let i = 0; i < arrUser.length; i++) {
        for (let t = 0; t < arrTask.length; t++) {
            if (arrUser[i].id == arrTask[t].executor) {
                let obj = {
                    name: arrUser[i].firstName,
                    surname: arrUser[i].surname,
                    task: arrTask[t].subject,
                    endDate: arrTask[t].planStartDate,
                    creationDate: arrTask[t].creationDate,
                    planEndDate: arrTask[t].planEndDate,
                    id: arrUser[i].id
                }
                USERS_WITH_TASK.push(obj);
            }
        }
    }
    for (let i = 0; i < arrTask.length; i++) {
        if (arrTask[i].executor == null) {
            let obj = {
                task: arrTask[i].subject,
                endDate: arrTask[i].planStartDate,
                creationDate: arrTask[i].creationDate,
                planEndDate: arrTask[i].planEndDate,
                id: arrTask[i].id
            }
            TASK_WITHOUT_USERS.push(obj);
        }
    }
    renderUsers(DATA_USERS);
    renderTasks(USERS_WITH_TASK);
    renderTaskWithoutUsers(TASK_WITHOUT_USERS)
    dragAndDrop();
}

function renderTasks(arr) {
    let ths = document.querySelectorAll('.table__body th');
    for (let i = 0; i < ths.length; i++) {
        let thDate = ths[i].getAttribute('data');
        let thId = ths[i].getAttribute('id');
        for (let t = 0; t < arr.length; t++) {
            if ((arr[t].creationDate === thDate) && ((arr[t].id).toString() === thId)) {
                ths[i].innerHTML += `<ul data-title='Дата окончания: ${arr[t].planEndDate}'><li>${arr[t].task}</li></ul>`;
            }
        }
    }
}

function renderUsers(arr) {
    arr.forEach(i => {
        let tr = document.createElement('tr');
        let th = document.createElement('th');
        th.classList.add('name');
        th.setAttribute('id', `${i.id}`);
        th.innerHTML = `${i.firstName} ` + `${i.surname}` + '<br>' + ` ID: ${i.id}`;
        tr.append(th);
        for (let t = d.getDate(); t < (d.getDate() + 7); t++) {
            let th = document.createElement('th');
            th.classList.add('drop');
            th.setAttribute('data', `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(t).padStart(2, '0')}`);
            th.setAttribute('name', `${i.firstName}`);
            th.setAttribute('surname', `${i.surname}`);
            th.setAttribute('id', `${i.id}`);
            tr.append(th);
        }
        tbody.append(tr);
    });
}

function renderTaskWithoutUsers(arr) {
    arr.forEach(i => {
        let tr = document.createElement('tr');
        let th = document.createElement('th');
        th.setAttribute('data', `${i.creationDate}`);
        th.setAttribute('task', `${i.task}`);
        th.setAttribute('planDate', `${i.planEndDate}`);
        th.innerHTML = `<ul data-title='Дата окончания: ${th.getAttribute('planDate')}'> <li>${th.getAttribute('task')}</li></ul>`;
        tr.append(th);
        backlog.append(tr);
    })
}

document.querySelector("input[type=\"text\"]").oninput = function () {
    let val = this.value.trim();
    let items = document.querySelectorAll(".backlog__body th");
    if (val != "") {
        items.forEach(function (elem) {
            if (elem.textContent.toLowerCase().includes(val.toLowerCase())) {
                elem.classList.remove('hide');
                elem.parentElement.classList.remove('hide');
            } else {
                elem.classList.add('hide');
                elem.parentElement.classList.add('hide');
            }
        })
    } else {
        items.forEach(function (elem) {
            elem.classList.remove('hide');
        })
    }
}

const left = document.querySelector('.left'); //левая кнопка
const right = document.querySelector('.right'); //правая кнопка

let DAY_MILSEC = 24 * 60 * 60 * 1000;
let today = new Date().getTime();

let card = document.querySelectorAll(".table__head-dates");
for (let i = 0; i < 7; i++) {
    let date = new Date(today + DAY_MILSEC * i);
    card[i].textContent = getDay(date);
}

function getDay(date) {
    let days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return date.getDate() + " " + days[date.getDay()];
}





function dragAndDrop() {
    let items1 = document.querySelectorAll(".backlog__body th");
    items1.forEach(function (elem) {
        elem.draggable = true;
    })
    backlog.addEventListener(`dragstart`, (evt) => {
        evt.target.classList.add(`selected`);
        evt.target.classList.add(`none`);
    });
    backlog.addEventListener(`dragend`, (evt) => {
        evt.target.classList.remove(`selected`);
        evt.target.classList.remove(`none`);
    });
    tbody.addEventListener(`dragover`, (evt) => {
        evt.preventDefault();
        evt.target.closest('th').classList.add(`hovered`);
    });
    tbody.addEventListener(`dragleave`, (evt) => {
        evt.target.closest('th').classList.remove(`hovered`);
    });
    tbody.addEventListener(`drop`, (evt) => {
        let activeElement = backlog.querySelector(`.selected`);
        let currentElement = evt.target.closest('th');

        if (evt.target.classList.contains('name')) {
            let ths = document.querySelectorAll('.table__body th');
            let id = evt.target.getAttribute('id');
            let date = activeElement.getAttribute('data')
            for (let i = 0; i < ths.length; i++) {
                let thDate = ths[i].getAttribute('data');
                if ((thDate === date) && ((ths[i].id).toString() === id)) {
                    ths[i].innerHTML += `<ul data-title='Дата окончания: ${activeElement.getAttribute('planDate')}'> <li>${activeElement.getAttribute('task')}</li></ul>`;
                }
            }
        } else {
            evt.target.closest('th').innerHTML += activeElement.innerHTML;
            //console.log(evt.target);
        }
        currentElement.classList.remove(`hovered`);
        activeElement.classList.add('hide');
        activeElement.parentElement.classList.add('hide');
    });
}