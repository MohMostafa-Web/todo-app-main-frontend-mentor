const todoApp = document.querySelector(".todo-app");
const headerImg = document.querySelectorAll("header img");
const input = document.querySelector(".input-field input");
const todoListUl = document.querySelector(".todo-list ul");
const controls = document.querySelector(".controls");
const filterBtns = document.querySelectorAll(".controls .filters li");
const leftItemsNumberCount = document.querySelector(".left-items .number");
const clearCompleted = document.querySelector(".controls .clear-completed");


// Get Saved Data for todos in Local Storage
if (localStorage.length !== 0) {
  // console.log("There's local storage"); // debug

  // Calculate Number of Todos that were saved in Local Storage
  // Get Keys of Todos and Save them in Array
  let numberOfSavedTodos = 0;
  let arrKeys = [];
  for (let [key, val] of Object.entries(localStorage)) {
    if (key.startsWith("todo-")) {
      numberOfSavedTodos += 1;
      arrKeys.push(key);
    }
  }

  // console.log("Number of Saved Todos = " + numberOfSavedTodos); // debug
  // console.log(arrKeys); // debug

  if (numberOfSavedTodos > 0) {
    // Get the saved Todos in order
    for (let i = 1; i <= arrKeys.length; i++) {
      let data = JSON.parse(localStorage.getItem(`todo-${i}`));

      // add saved todos to App dashboard
      addTodo(data.text, data.class);
    }
  }
}

// Get Saved data-theme in local storage
if (localStorage.getItem("data-theme")) { // Check if there's saved data-theme in local storage
  // console.log("There's saved data-theme"); // debug

  if (todoApp.classList.item(1) !== localStorage.getItem("data-theme")) { // Check if the current theme is not the saved theme
    let savedTheme = localStorage.getItem("data-theme");

    // apply the saved Theme
    applyTheme(savedTheme);
  }
}


// Toggle Light/Dark Theme
headerImg.forEach(img => {
  img.onclick = function () {
    localStorage.setItem("data-theme", this.dataset.theme); // Save clicked data-theme in Local Storage

    // apply the clicked Theme
    applyTheme(this.dataset.theme);
  };
});


// Toggle Placeholder when you focus or blur input
input.onfocus = function () {
  this.placeholder = ""; // Empty placeholder
  this.parentElement.classList.add("focused"); // Add Class "focused" to parent
};
input.onblur = function () {
  if (this.value.trim() !== "") { // Check if input value is not empty
    // Add a new Todo
    addTodo(this.value);
    // update Local Storage
    updateLocalStorage();
  }
  this.value = ""; // Empty input
  this.placeholder = this.dataset.placeholder; // Return placeholder back
  this.parentElement.classList.remove("focused"); // Remove Class "focused" from parent
};


// When you click on icon button or P Element, toggle between Classes "active", "completed" to its Parent li.todo,
// When you click on delete button, remove its entire Parent li.todo
todoListUl.addEventListener("click", function (e) {
  if (e.target.className === "icon" || e.target.tagName === "P") {
    e.target.parentElement.classList.toggle("active");
    e.target.parentElement.classList.toggle("completed");
    // update Number of Left Active Items
    updateLeftItemsNumber();
    // Update Filter
    updateFilter();
    // update Local Storage
    updateLocalStorage();
  }
  if (e.target.className === "delete") {
    e.target.parentElement.remove();

    localStorage.removeItem(`${e.target.parentElement.id}`);

    // update Number of Left Active Items
    updateLeftItemsNumber();
    // Update Filter
    updateFilter();
    // update Numbering Todos
    numberingTodos();
    // update Local Storage
    updateLocalStorage();
  }
});


/* When you click on filter button:
  - Remove Class "selected" from all btns
  - Add Class "selected" to clicked btn
  - Filter todos [All, Active, Completed]
*/
filterBtns.forEach(btn => {
  btn.onclick = function () {
    // Remove Class "selected" from all btns
    filterBtns.forEach(btn => {
      btn.classList.remove("selected");
    });
    // Add Class "selected" to clicked btn
    this.classList.add("selected");
    // Check data-filter of clicked li to make filter
    makeFilter(this.dataset.filter);
  };
});


// When you click on "Clear Completed" button, Remove all completed todos
clearCompleted.onclick = function () {
  document.querySelectorAll(".todo-list .todo").forEach(todo => {
    if (todo.classList.contains("completed")) {
      todo.remove();
      localStorage.removeItem(`${todo.id}`);

      // update Numbering Todos
      numberingTodos();
      // update Local Storage
      updateLocalStorage();
    }
  });
};


/** Helper Functions */

// Create Function to apply the new Theme
function applyTheme(newTheme) {
  let lastTheme = todoApp.classList.item(1);
  todoApp.classList.remove(lastTheme); // Remove the last theme
  todoApp.classList.add(newTheme); // Add the new theme
  document.querySelector(`[data-theme="${newTheme}"]`).classList.remove("available"); // Remove Class "available" from the img of new theme
  document.querySelector(`[data-theme="${lastTheme}"]`).classList.add("available"); // Add Class "available" to the img of last theme
}


// Create function to add a new todo
function addTodo(textParam, classParam) {
  const li = document.createElement("li"); // Create Element
  li.id = `todo-${document.querySelectorAll(".todo").length + 1}`;
  li.className = classParam || "todo active"; // Add Class Name to Element
  // set InnerHTML
  li.innerHTML = `
    <span class="icon"><img class="check" src="images/icon-check.svg" alt="icon-check"></span>
    <p>${textParam}</p>
    <img class="delete" src="images/icon-cross.svg" alt="icon-cross">
  `;

  // Add Drag and Drop Events
  li.setAttribute("draggable", true);
  li.lastElementChild.setAttribute("draggable", false); // Make delete button not draggable
  // Add Event "dragstart" to each todo
  li.ondragstart = dragStart;
  // Add Event "dragover" to each todo to allow drop
  li.ondragover = dragOver;
  // Add Event "drop" to each todo
  li.ondrop = drop;

  // Append Element li to TodoList ul
  todoListUl.appendChild(li);
  // update Number of Left Active Items
  updateLeftItemsNumber();
  // update numbering Todos
  numberingTodos();
}


// Create Function to update left Active Items Number
function updateLeftItemsNumber() {
  leftItemsNumberCount.innerHTML = document.querySelectorAll(".todo.active").length; // Get Number of li.todo has Class "active"
}
// update Number of Left Active Items
updateLeftItemsNumber();


// Create Function to make filter
function makeFilter(filtered) {
  document.querySelectorAll(".todo-list .todo").forEach(todo => {
    if (!todo.classList.contains(filtered)) {
      todo.classList.add("hidden"); // Add Class "hidden" to all todos except filtered Class
    } else {
      todo.classList.remove("hidden"); // Remove Class "hidden" from the todos that has filtered Class
    }
  });
}


// Create Function to update filter
function updateFilter() {
  for (btn of filterBtns) {
    if(btn.classList.contains("selected")) { // Check which filter btn has been selected
      makeFilter(btn.dataset.filter); // make filter
    }
  }
}


// Drag and Drop handler Functions
function dragStart(e) {
  e.dataTransfer.setData("number", e.target.dataset.number); // Save "data-number" of dragged item in "number"
  e.dataTransfer.setData("text", e.target.id); // Save "id" of dragged Item in "text"
  e.dataTransfer.effectAllowed = "move"; // Make drag effect "move"
}
function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move"; // Make drop effect "move"
}
function drop(e) {
  e.preventDefault();
  const number = e.dataTransfer.getData("number");
  const data = e.dataTransfer.getData("text");
  if (number > e.currentTarget.dataset.number) { // Check if number of dragged item > number of dropped item
    e.currentTarget.before(document.getElementById(data)); // Insert dragged item before dropped item
  } else {
    e.currentTarget.after(document.getElementById(data)); // Insert dragged item after dropped item
  }
  // update Numbering Todos
  numberingTodos();
  // update Local Storage
  updateLocalStorage();
}

// Create function to make numbering Todos [both data-number and id]
function numberingTodos() {
  document.querySelectorAll(".todo-list .todo").forEach((todo, i) => {
    todo.setAttribute("data-number", i + 1);
    todo.id = `todo-${i + 1}`;
  });
}
numberingTodos();


// Create Function to Update Local Storage
function updateLocalStorage() {
  // Remove Items of Saved Todos from local storage
  for (let [key, val] of Object.entries(localStorage)) {
    if (key.startsWith("todo-")) {
      localStorage.removeItem(key);
    }
  }

  // Add Items of Saved Todos in local storage
  document.querySelectorAll(".todo-list .todo").forEach(todo => {
    let data = {
      "class": todo.className,
      "text": todo.textContent.trim()
    }
    localStorage.setItem(todo.id, JSON.stringify(data));
  });
}
