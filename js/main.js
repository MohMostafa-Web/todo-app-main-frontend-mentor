const todoApp = document.querySelector(".todo-app");
const headerImg = document.querySelectorAll("header img");
const input = document.querySelector(".input-field input");
const todoListUl = document.querySelector(".todo-list ul");
const controls = document.querySelector(".controls");
const filterBtns = document.querySelectorAll(".controls .filters li");
const leftItemsNumberCount = document.querySelector(".left-items .number");
const clearCompleted = document.querySelector(".controls .clear-completed");


// Toggle Light/Dark Theme
headerImg.forEach(img => {
  img.onclick = function () {
    const lastTheme = todoApp.classList.item(1);
    todoApp.classList.remove(lastTheme); // Remove the last theme
    todoApp.classList.add(this.dataset.theme); // Add the new theme
    this.classList.remove("available"); // Remove Class "available" from clicked img
    document.querySelector(`[data-theme=${lastTheme}]`).classList.add("available"); // Add Class "available" to a new img
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
  }
  if (e.target.className === "delete") {
    e.target.parentElement.remove();
    // update Number of Left Active Items
    updateLeftItemsNumber();
    // Update Filter
    updateFilter();
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
    }
  });
};


/** Helper Functions */

// Create function to add a new todo
function addTodo(param) {
  const li = document.createElement("li"); // Create Element
  li.id = `todo-${document.querySelectorAll(".todo").length + 1}`;
  li.className = "todo active"; // Add Class Name to Element
  // set InnerHTML
  li.innerHTML = `
    <span class="icon"><img class="check" src="images/icon-check.svg" alt="icon-check"></span>
    <p>${param}</p>
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


// Add Drag and Drop Events to Already Created Todos
document.querySelectorAll(".todo-list .todo").forEach(todo => {
  todo.setAttribute("draggable", true);
  todo.lastElementChild.setAttribute("draggable", false); // Make delete button not draggable
  // Add Event "dragstart" to each todo
  todo.ondragstart = dragStart;
  // Add Event "dragover" to each todo to allow drop
  todo.ondragover = dragOver;
  // Add Event "drop" to each todo
  todo.ondrop = drop;
});


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
}

// Create function to make numbering Todos
function numberingTodos() {
  document.querySelectorAll(".todo-list .todo").forEach((todo, i) => {
    todo.setAttribute("data-number", i + 1);
  });
}
numberingTodos();
