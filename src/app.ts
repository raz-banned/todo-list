// Твой код здесь

// Подсказка по структуре (можешь удалить):
// 1. Создай массив для хранения задач
// 2. Получи ссылки на нужные элементы DOM
// 3. Создай функции для работы с задачами
// 4. Добавь обработчики событий

// получение с dom
const button = document.querySelector<HTMLButtonElement>('#addButton');
const list = document.querySelector<HTMLUListElement>('#todoList');
const clear = document.querySelector<HTMLButtonElement>('#clearCompleted');
const filterBtns = document.querySelector<HTMLDivElement>('.filters');
const counter = document.querySelector<HTMLSpanElement>('#counter');
const input = document.querySelector<HTMLInputElement>('#todoInput');
interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
}

// массив задач
let todoList: Todo[] = JSON.parse(localStorage.getItem('todos') || '[]');

// обновление и сохранение значений
const updateCounter = () => {
  const activeCount = todoList.filter((element) => !element.isCompleted);
  if (!counter) return;
  counter.textContent = `Активных задач: ${activeCount.length}`;
};

const storageSave = () => {
  localStorage.setItem('todos', JSON.stringify(todoList));
};

// вызов с хранилища если есть
if (todoList.length > 0) {
  todoList.forEach((element) => {
    renderTodo(element);
  });
}

// функция создает задачу
function createTodo() {
  // информация о задаче отдается массиву
  if (!input?.value.trim()) return;
  const info = () => {
    const id = crypto.randomUUID();
    const text = input.value;
    const isCompleted = false;

    return {
      id,
      text,
      isCompleted,
    };
  };
  const createInstance = info();

  todoList.push(createInstance);

  updateCounter();
  storageSave();
  renderTodo(createInstance);
  input.value = '';
}

// рендеринг в dom
function renderTodo(todoInstance: Todo) {
  // элементы с dom
  const item = document.createElement('li');
  const itemText = document.createElement('span');
  const deleteBtn = document.createElement('button');

  // присваивание свойств
  item.classList = 'todo-item';
  if (todoInstance.isCompleted) {
    item.classList.add('completed');
  }

  itemText.classList = 'todo-text';
  itemText.textContent = todoInstance.text;

  deleteBtn.textContent = 'X';
  deleteBtn.classList = 'delete-btn';

  // добавление в dom
  item.appendChild(itemText);
  item.appendChild(deleteBtn);
  list?.appendChild(item);

  updateCounter();

  // слушатели
  itemText.addEventListener('click', () => {
    handleComplete(todoInstance, item);
  });

  deleteBtn.addEventListener('click', () => {
    handleRemove(todoInstance, item);
  });

  const events = ['dblclick', 'keydown', 'blur'] as const;
  events.forEach((event) => {
    itemText.addEventListener(event, (e) => edit(e, itemText, todoInstance));
  });
}

// триггеры функции от слушателя
const handleComplete = (info: Todo, listELement: HTMLLIElement) => {
  listELement.classList.toggle('completed');
  info.isCompleted = !info.isCompleted;

  updateCounter();
  storageSave();
};

const handleRemove = (info: Todo, listElement: HTMLLIElement) => {
  const index = todoList.indexOf(info);

  if (index > -1) {
    todoList.splice(index, 1);
  }
  listElement.remove();

  updateCounter();
  storageSave();
};

// фильтры

function filter(e: MouseEvent) {
  const btn = document.querySelectorAll('.filter-btn');
  const target = e.target as HTMLButtonElement;

  const filterType = target.dataset?.filter;
  if (!filterType) return;

  btn.forEach((btn) => {
    btn.classList.remove('active');
    target.classList.add('active');
  });

  const items = document.querySelectorAll('.todo-item');
  items.forEach((item) => {
    item.classList.remove('hidden');

    if (filterType === 'active') {
      if (item.classList.contains('completed')) item.classList.add('hidden');
    }
    if (filterType === 'completed') {
      if (!item.classList.contains('completed')) item.classList.add('hidden');
    }
  });
}

filterBtns?.addEventListener('click', filter);

const clearAll = () => {
  const item = document.querySelectorAll('li');
  const filteredList = todoList.filter((element) => !element.isCompleted);
  todoList = filteredList;

  item.forEach((element) => {
    if (element.classList.contains('completed')) element.remove();
  });

  updateCounter();
  storageSave();
};

clear?.addEventListener('click', clearAll);

type EditEvents = MouseEvent | KeyboardEvent | FocusEvent;

function edit(e: EditEvents, text: HTMLSpanElement, info: Todo) {
  if (e.type === 'dblclick') {
    text.contentEditable = 'true';
    text.focus();
  }
  // 2. Обработка клавиш (только если это keydown)
  if (e.type === 'keydown' && e instanceof KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault(); // Отменяем перенос строки
      text.blur(); // Просто вызываем blur, а остальное сделает обработчик blur
    } else if (e.key === 'Escape') {
      text.contentEditable = 'false'; // Отмена без сохранения (опционально)
    }
  }
  // 3. Сохранение (срабатывает при потере фокуса или вызове .blur())
  else if (e.type === 'blur' && text.contentEditable === 'true') {
    if ((text.textContent ?? '').trim().length < 1) {
      text.textContent = info.text; // вернуть старый текст
    } else {
      info.text = text.textContent ?? info.text; // ← сохранить новый текст
      storageSave(); // ← сохранить в localStorage
    }
    text.contentEditable = 'false';
    // Здесь можно вызвать функцию обновления в БД или API
    console.log('Сохранено:', info.text);
  }
}

// слушатель создания задачи
button?.addEventListener('click', createTodo);
input?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') createTodo();
});
