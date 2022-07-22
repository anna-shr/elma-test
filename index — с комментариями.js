let URL_USERS = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users';
let URL_TASKS = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks';
let DATA_TASKS = []; // здесь лежит массив с объектами с данными тасков
let DATA_USERS = []; // здесь лежит массив с объектами с данными юзеров
let USERS_WITH_TASK = []; // здесь лежит массив с объектами с юзерами и их тасками
let TASK_WITHOUT_USERS = []; // здесь лежит массив с объектами с данными тасков без исполнителей

let dates = document.querySelector('.table__head'); //шапка таблицы с датами
let tbody = document.querySelector('.table__body'); //задаем таблицу
let backlog = document.querySelector('.backlog__body'); //задаем вторую таблицу

let d = new Date(); //константа даты

fetch(URL_USERS).then(i => i.json()).then(i => {DATA_USERS = i;}); //фетчим
fetch(URL_TASKS).then(i => i.json()).then(i => {DATA_TASKS = i, filterTask(DATA_USERS, DATA_TASKS)}); //фетчим

function filterTask(arrUser, arrTask) { //создаем массив объектов тасков с юзерами и тасков без юзеров
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
                USERS_WITH_TASK.push(obj); //создали массив с объектами тасков с юзерами
            }
        }
    }
    for (let i = 0; i < arrTask.length; i++) {
        if (arrTask[i].executor == null) {
            let obj = {
                task: arrTask[i].subject,
                endDate: arrTask[i].planStartDate,
                creationDate: arrTask[i].creationDate,
                //planStartDate
                planEndDate: arrTask[i].planEndDate,
                id: arrTask[i].id
            }
            TASK_WITHOUT_USERS.push(obj); //создали массив с объектами тасков без юзеров
        }
    }
    renderUsers(DATA_USERS); // запускаем фунцию чтобы вписать всех юзеров
    renderTasks(USERS_WITH_TASK); // запускаем функцию вписать в таблицу таски
    filterTaskWithoutUsers(TASK_WITHOUT_USERS) // запускаем фунцию чтобы таски без юзера в таблицу вписать+
    dragAndDrop();
}

function renderTasks(arr) {
    let ths = document.querySelectorAll('.table__body th'); //берем все ячейки
    for (let i = 0; i < ths.length; i++) { //для первой ячейки...

        //let thName = ths[i].getAttribute('name');
        //let thSurname = ths[i].getAttribute('surname')
        let thDate = ths[i].getAttribute('data');
        let thId = ths[i].getAttribute('id');

        for (let t = 0; t < arr.length; t++) { //перебираем по одной задачи из Users with Tasks
            if ((arr[t].creationDate === thDate) && ((arr[t].id).toString() === thId)) { //если атрибут id th = атрибуту id таска и атрибут даты th = атрибуту даты таска
                ths[i].innerHTML += `<ul data-title='ДАТА окончания: ${arr[t].planEndDate}'> 
                <li>ЗАДАЧА: ${arr[t].task}</li>
                </ul>
                `; //то меняем innerHTML этого th
            }
        }
    }
}


function renderUsers(arr) { //функция, чтобы добавить юзеров
    arr.forEach(i => {
        let tr = document.createElement('tr'); //создаем ряд
        let th = document.createElement('th'); //создаем первую ячейку
        th.classList.add('name');
        th.setAttribute('id', `${i.id}`);
        th.innerHTML = `Имя: ${i.firstName}` + `Фамилия: ${i.surname}` + `ID: ${i.id}`; //вводим innerHTML
        tr.append(th); //добавляем первую ячейку
        for (let t = d.getDate(); t < (d.getDate() + 7); t++) { //через цикл создаем еще 7 ячеек
            let th = document.createElement('th');
            th.classList.add('drop');
            th.setAttribute('data', `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(t).padStart(2, '0')}`); //ячейкам даем атрибут дата (2022-07-19)
            th.setAttribute('name', `${i.firstName}`); //ячейкам даем атрибут имя (Антон)
            th.setAttribute('surname', `${i.surname}`); //ячейкам даем атрибут фамилия (Добрый)
            th.setAttribute('id', `${i.id}`); //ячейкам даем атрибут id (1)
            tr.append(th); //добавляем tr в th
        }
        tbody.append(tr); //tr добавляем в body
    });
}


function filterTaskWithoutUsers(arr) { //таски без юзера в таблицу вписать +
    arr.forEach(i => {
        let tr = document.createElement('tr');
        let th = document.createElement('th');

        th.setAttribute('data', `${i.creationDate}`);
        th.setAttribute('task', `${i.task}`);
        th.setAttribute('planDate', `${i.planEndDate}`);

        th.innerHTML = `<ul data-title='ДАТА окончания: ${th.getAttribute('planDate')}'> 
        <li>ЗАДАЧА: ${th.getAttribute('task')}</li>
        </ul>
        `;
        tr.append(th);
        backlog.append(tr);
    })
}


document.querySelector("input[type=\"text\"]").oninput = function () { //функция для поиска +
    let val = this.value.trim();
    let items = document.querySelectorAll(".backlog__body th");
    if (val != "") {
        items.forEach(function (elem) {
            if (elem.textContent.toLowerCase().includes(val.toLowerCase())) {
                elem.classList.remove('hide');
            } else {
                elem.classList.add('hide');
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



let DAY_MILSEC = 24 * 60 * 60 * 1000; //для даты+
let today = new Date().getTime();
//console.log(today);

let card = document.querySelectorAll(".table__head-dates");
for (let i = 0; i < 7; i++) {
    let date = new Date(today + DAY_MILSEC * i);
    //console.log(date);
    card[i].textContent = getDay(date);
}
function getDay(date) {
    let days = ["Вскр", "Пон", "Втр", "Сред", "Чтв", "Пят", "Суб"];
    return date.getDate() + " " + days[date.getDay()];
}

right.onclick = function () {
    today = today + 7;
    getDay(date);
};



function dragAndDrop() {
    let items1 = document.querySelectorAll(".backlog__body th"); //собираем все th из бэклога

    items1.forEach(function (elem) { // Перебираем все элементы списка и присваиваем draggable
        elem.draggable = true;
    })

    backlog.addEventListener(`dragstart`, (evt) => { //th будет подсвечиваться при взятии
        evt.target.classList.add(`selected`);
        evt.target.classList.add(`none`);
    });

    backlog.addEventListener(`dragend`, (evt) => { //th перестанет подсвечиваться при отпускании
        evt.target.classList.remove(`selected`);
        evt.target.classList.remove(`none`);

    });

    tbody.addEventListener(`dragover`, (evt) => { //в таблицу можно бросать + появится подсветка элемента
        evt.preventDefault();
        evt.target.classList.add(`hovered`);
    });

    tbody.addEventListener(`dragleave`, (evt) => { //при уходе мышки подсветка с элемента уберется
        evt.target.classList.remove(`hovered`);
    });



    tbody.addEventListener(`drop`, (evt) => { //вставляем элемент и скрываем его из бэклога
        const activeElement = backlog.querySelector(`.selected`);
        const currentElement = evt.target;
        if (evt.target.classList.contains('name')) {
            let ths = document.querySelectorAll('.table__body th'); //берем все ячейки
            let id = evt.target.getAttribute('id'); //id Имени
            //console.log(id);
            let date = activeElement.getAttribute('data') //дата таска
            //console.log(date);
                for (let i = 0; i < ths.length; i++) { //проходим по весм ячейкам
                    let thDate = ths[i].getAttribute('data'); //получить атрибут даты ячейки(?)
                    //console.log (thDate);

                if ((thDate === date) && ((ths[i].id).toString() === id)) {
                    console.log(activeElement);
                    ths[i].innerHTML += `<ul data-title='ДАТА окончания: ${activeElement.getAttribute('planDate')}'> 
                <li>ЗАДАЧА: ${activeElement.getAttribute('task')}</li>
                </ul>
                `; //то меняем innerHTML этого th
                }
            }

        } else {
            evt.target.innerHTML += activeElement.innerHTML;
        }
        evt.target.classList.remove(`hovered`);
        activeElement.classList.add('hide');
    });
}